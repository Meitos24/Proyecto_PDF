import io
import os
import zipfile
from io import BytesIO

import fitz  # PyMuPDF
from django.core.files.base import ContentFile
from file_manager.models import TemporaryFile
from file_manager.utils import create_download_file
from PIL import Image
from PyPDF2 import PdfReader, PdfWriter


def validate_pdf_files(file_ids):
    """
    Validate that all file IDs exist, are PDFs, and are not expired
    Returns list of TemporaryFile objects or raises ValueError
    """
    files = []

    for file_id in file_ids:
        try:
            temp_file = TemporaryFile.objects.get(id=file_id)
        except TemporaryFile.DoesNotExist:
            raise ValueError(f"File with ID {file_id} not found")

        # Check if file is expired
        if temp_file.is_expired:
            raise ValueError(f"File {temp_file.original_filename} has expired")

        # Check if physical file exists
        if not temp_file.file_exists:
            raise ValueError(
                f"Physical file {temp_file.original_filename} not found on storage"
            )

        # Check if file is PDF
        if temp_file.mime_type != "application/pdf":
            raise ValueError(
                f"File {temp_file.original_filename} is not a PDF (type: {temp_file.mime_type})"
            )

        files.append(temp_file)

    return files


def merge_pdf_files(file_ids, output_filename="merged_document.pdf"):
    """
    Merge multiple PDF files into one

    Args:
        file_ids: List of file UUIDs to merge
        output_filename: Name for the output file

    Returns:
        TemporaryFile object of the merged PDF

    Raises:
        ValueError: If validation fails
        Exception: If PDF processing fails
    """

    # Validate input files
    pdf_files = validate_pdf_files(file_ids)

    # Create PDF writer for output
    pdf_writer = PdfWriter()

    try:
        # Process each PDF file
        for temp_file in pdf_files:
            # Read the PDF file
            with open(temp_file.full_file_path, "rb") as pdf_file:
                pdf_reader = PdfReader(pdf_file)

                # Check if PDF is encrypted
                if pdf_reader.is_encrypted:
                    raise ValueError(
                        f"PDF {temp_file.original_filename} is encrypted and cannot be merged"
                    )

                # Add all pages to the writer
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    pdf_writer.add_page(page)

        # Create output buffer
        output_buffer = io.BytesIO()
        pdf_writer.write(output_buffer)
        output_buffer.seek(0)

        # Create temporary file for the merged PDF
        merged_file = create_download_file(
            file_content=output_buffer.getvalue(), filename=output_filename
        )

        return merged_file

    except Exception as e:
        raise Exception(f"Failed to merge PDFs: {str(e)}")


def get_pdf_info(temp_file):
    """
    Get information about a PDF file

    Args:
        temp_file: TemporaryFile object

    Returns:
        dict with PDF information
    """
    try:
        with open(temp_file.full_file_path, "rb") as pdf_file:
            pdf_reader = PdfReader(pdf_file)

            info = {
                "filename": temp_file.original_filename,
                "pages": len(pdf_reader.pages),
                "encrypted": pdf_reader.is_encrypted,
                "size_bytes": temp_file.file_size,
                "size_mb": round(temp_file.file_size / (1024 * 1024), 2),
            }

            # Try to get metadata
            if pdf_reader.metadata:
                info["title"] = pdf_reader.metadata.get("/Title", "")
                info["author"] = pdf_reader.metadata.get("/Author", "")
                info["subject"] = pdf_reader.metadata.get("/Subject", "")
                info["creator"] = pdf_reader.metadata.get("/Creator", "")
                info["producer"] = pdf_reader.metadata.get("/Producer", "")

            return info

    except Exception as e:
        return {
            "filename": temp_file.original_filename,
            "error": str(e),
            "size_bytes": temp_file.file_size,
        }


def validate_merge_operation(file_ids):
    """
    Validate that a merge operation can be performed

    Args:
        file_ids: List of file UUIDs

    Returns:
        dict with validation results and file information
    """
    try:
        pdf_files = validate_pdf_files(file_ids)

        # Get info for each file
        files_info = []
        total_pages = 0
        total_size = 0

        for temp_file in pdf_files:
            file_info = get_pdf_info(temp_file)
            files_info.append(file_info)

            if "pages" in file_info:
                total_pages += file_info["pages"]
            total_size += temp_file.file_size

        # Check size limits (100MB total)
        max_size = 500 * 1024 * 1024  # 100MB
        if total_size > max_size:
            raise ValueError(
                f"Total file size ({total_size / (1024*1024):.1f}MB) exceeds limit (100MB)"
            )

        if total_pages > 5000:
            raise ValueError(f"Total pages ({total_pages}) exceeds limit (500 pages)")

        return {
            "valid": True,
            "files_info": files_info,
            "total_pages": total_pages,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "estimated_output_size_mb": round(
                total_size / (1024 * 1024), 2
            ),  # Rough estimate
        }

    except (ValueError, Exception) as e:
        return {"valid": False, "error": str(e), "files_info": []}


def split_pdf_by_pages(file_id, split_options):
    """
    Split a PDF file by pages based on different options

    Args:
        file_id: UUID of the PDF file to split
        split_options: dict with split configuration
            - mode: 'all_pages', 'page_ranges', 'every_n_pages'
            - ranges: list of page ranges (for page_ranges mode)
            - pages_per_split: int (for every_n_pages mode)
            - output_prefix: string prefix for output files

    Returns:
        Tuple of (TemporaryFile object, file_count, is_single_file)
        - Single PDF if only one output file
        - ZIP file if multiple output files
    """

    # Validate input file
    pdf_files = validate_pdf_files([file_id])
    source_file = pdf_files[0]

    try:
        # Read the source PDF
        with open(source_file.full_file_path, "rb") as pdf_file:
            pdf_reader = PdfReader(pdf_file)

            # Check if PDF is encrypted
            if pdf_reader.is_encrypted:
                raise ValueError(
                    f"PDF {source_file.original_filename} is encrypted and cannot be split"
                )

            total_pages = len(pdf_reader.pages)

            if total_pages == 1:
                raise ValueError("PDF has only 1 page, cannot split")

            # Generate split files based on mode
            split_files = []
            mode = split_options.get("mode", "all_pages")
            output_prefix = split_options.get("output_prefix", "page")

            if mode == "all_pages":
                # Split into individual pages
                for page_num in range(total_pages):
                    pdf_writer = PdfWriter()
                    pdf_writer.add_page(pdf_reader.pages[page_num])

                    # Create output buffer
                    output_buffer = io.BytesIO()
                    pdf_writer.write(output_buffer)
                    output_buffer.seek(0)

                    filename = f"{output_prefix}_{page_num + 1}.pdf"
                    split_files.append(
                        {"filename": filename, "content": output_buffer.getvalue()}
                    )

            elif mode == "page_ranges":
                # Split by specified page ranges
                ranges = split_options.get("ranges", [])
                if not ranges:
                    raise ValueError("No page ranges specified")

                for i, page_range in enumerate(ranges):
                    start_page = page_range.get("start", 1) - 1  # Convert to 0-indexed
                    end_page = (
                        page_range.get("end", total_pages) - 1
                    )  # Convert to 0-indexed

                    # Validate range
                    if (
                        start_page < 0
                        or end_page >= total_pages
                        or start_page > end_page
                    ):
                        raise ValueError(
                            f"Invalid page range: {start_page + 1}-{end_page + 1}"
                        )

                    pdf_writer = PdfWriter()
                    for page_num in range(start_page, end_page + 1):
                        pdf_writer.add_page(pdf_reader.pages[page_num])

                    # Create output buffer
                    output_buffer = io.BytesIO()
                    pdf_writer.write(output_buffer)
                    output_buffer.seek(0)

                    filename = f"{output_prefix}_{start_page + 1}_{end_page + 1}.pdf"
                    split_files.append(
                        {"filename": filename, "content": output_buffer.getvalue()}
                    )

            elif mode == "every_n_pages":
                # Split every N pages
                pages_per_split = split_options.get("pages_per_split", 1)
                if pages_per_split <= 0:
                    raise ValueError("Pages per split must be greater than 0")

                split_num = 1
                for start_page in range(0, total_pages, pages_per_split):
                    end_page = min(start_page + pages_per_split - 1, total_pages - 1)

                    pdf_writer = PdfWriter()
                    for page_num in range(start_page, end_page + 1):
                        pdf_writer.add_page(pdf_reader.pages[page_num])

                    # Create output buffer
                    output_buffer = io.BytesIO()
                    pdf_writer.write(output_buffer)
                    output_buffer.seek(0)

                    filename = f"{output_prefix}_parte_{split_num}.pdf"
                    split_files.append(
                        {"filename": filename, "content": output_buffer.getvalue()}
                    )
                    split_num += 1

            else:
                raise ValueError(f"Invalid split mode: {mode}")

            # Determine output format based on number of files
            file_count = len(split_files)

            if file_count == 1:
                # Single PDF output
                split_file = split_files[0]
                output_temp_file = create_download_file(
                    file_content=split_file["content"],
                    filename=split_file["filename"],
                    original_temp_file=source_file,
                )
                return output_temp_file, file_count, True

            else:
                # Multiple files - create ZIP
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                    for split_file in split_files:
                        zip_file.writestr(split_file["filename"], split_file["content"])

                zip_buffer.seek(0)

                # Create temporary file for the ZIP
                zip_filename = f"{output_prefix}_split.zip"
                zip_temp_file = create_download_file(
                    file_content=zip_buffer.getvalue(),
                    filename=zip_filename,
                    original_temp_file=source_file,
                )

                return zip_temp_file, file_count, False

    except Exception as e:
        raise Exception(f"Failed to split PDF: {str(e)}")


def get_pdf_split_info(file_id):
    """
    Get information about a PDF for splitting

    Args:
        file_id: UUID of the PDF file

    Returns:
        dict with PDF split information
    """
    try:
        pdf_files = validate_pdf_files([file_id])
        temp_file = pdf_files[0]

        with open(temp_file.full_file_path, "rb") as pdf_file:
            pdf_reader = PdfReader(pdf_file)

            total_pages = len(pdf_reader.pages)

            info = {
                "filename": temp_file.original_filename,
                "total_pages": total_pages,
                "can_split": total_pages > 1,
                "encrypted": pdf_reader.is_encrypted,
                "size_bytes": temp_file.file_size,
                "size_mb": round(temp_file.file_size / (1024 * 1024), 2),
            }

            # Add split suggestions
            if total_pages > 1:
                info["split_suggestions"] = {
                    "all_pages": f"Split into {total_pages} individual pages",
                    "every_2_pages": f"Split every 2 pages ({(total_pages + 1) // 2} files)",
                    "every_5_pages": f"Split every 5 pages ({(total_pages + 4) // 5} files)",
                    "every_10_pages": f"Split every 10 pages ({(total_pages + 9) // 10} files)",
                }

            return info

    except Exception as e:
        return {"filename": "Unknown", "error": str(e), "can_split": False}


def validate_split_operation(file_id, split_options):
    """
    Validate that a split operation can be performed

    Args:
        file_id: UUID of the PDF file
        split_options: dict with split configuration

    Returns:
        dict with validation results
    """
    try:
        pdf_info = get_pdf_split_info(file_id)

        if "error" in pdf_info:
            raise ValueError(pdf_info["error"])

        if not pdf_info["can_split"]:
            raise ValueError("PDF cannot be split (only 1 page or encrypted)")

        mode = split_options.get("mode", "all_pages")
        total_pages = pdf_info["total_pages"]

        # Validate specific split modes
        if mode == "page_ranges":
            ranges = split_options.get("ranges", [])
            if not ranges:
                raise ValueError("No page ranges specified")

            for page_range in ranges:
                start = page_range.get("start", 1)
                end = page_range.get("end", total_pages)

                if start < 1 or end > total_pages or start > end:
                    raise ValueError(f"Invalid page range: {start}-{end}")

        elif mode == "every_n_pages":
            pages_per_split = split_options.get("pages_per_split", 1)
            if pages_per_split <= 0 or pages_per_split > total_pages:
                raise ValueError(f"Invalid pages per split: {pages_per_split}")

        # Estimate output
        if mode == "all_pages":
            estimated_files = total_pages
        elif mode == "page_ranges":
            estimated_files = len(split_options.get("ranges", []))
        elif mode == "every_n_pages":
            estimated_files = (
                total_pages + split_options.get("pages_per_split", 1) - 1
            ) // split_options.get("pages_per_split", 1)
        else:
            estimated_files = 1

        return {
            "valid": True,
            "pdf_info": pdf_info,
            "estimated_output_files": estimated_files,
            "estimated_zip_size_mb": round(
                pdf_info["size_mb"] * 1.1, 2
            ),  # Rough estimate with ZIP overhead
        }

    except Exception as e:
        return {"valid": False, "error": str(e)}


import zipfile

import fitz  # PyMuPDF
from PIL import Image


def validate_image_files(file_ids):
    """
    Validate that all file IDs exist, are images, and are not expired
    Returns list of TemporaryFile objects or raises ValueError
    """
    files = []
    allowed_image_types = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/tiff",
        "image/webp",
    ]

    for file_id in file_ids:
        try:
            temp_file = TemporaryFile.objects.get(id=file_id)
        except TemporaryFile.DoesNotExist:
            raise ValueError(f"File with ID {file_id} not found")

        if temp_file.is_expired:
            raise ValueError(f"File {temp_file.original_filename} has expired")

        if not temp_file.file_exists:
            raise ValueError(
                f"Physical file {temp_file.original_filename} not found on storage"
            )

        if temp_file.mime_type not in allowed_image_types:
            raise ValueError(
                f"File {temp_file.original_filename} is not a supported image (type: {temp_file.mime_type})"
            )

        files.append(temp_file)
    return files


def convert_pdf_to_images(
    file_id,
    output_format="PNG",
    quality=95,
    dpi=150,
    output_filename=None,
    pages_range=None,
):
    """
    Convert PDF pages to images

    Args:
        file_id: UUID of the PDF file
        output_format: Image format (PNG, JPEG, WEBP, TIFF)
        quality: Image quality for JPEG (1-100)
        dpi: Resolution in DPI
        output_filename: Base name for output files
        pages_range: Tuple (start, end) for page range, None for all pages

    Returns:
        TemporaryFile object of the ZIP file containing images
    """

    pdf_files = validate_pdf_files([file_id])
    pdf_file = pdf_files[0]

    if not output_filename:
        base_name = os.path.splitext(pdf_file.original_filename)[0]
        output_filename = f"{base_name}_images.zip"

    try:
        pdf_document = fitz.open(pdf_file.full_file_path)
        total_pages = len(pdf_document)

        if pages_range:
            start_page, end_page = pages_range
            start_page = max(0, start_page - 1)
            end_page = min(total_pages, end_page)
        else:
            start_page = 0
            end_page = total_pages

        if start_page >= end_page:
            raise ValueError("Invalid page range")

        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for page_num in range(start_page, end_page):
                page = pdf_document[page_num]

                mat = fitz.Matrix(dpi / 72, dpi / 72)
                pix = page.get_pixmap(matrix=mat)

                img_data = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_data))

                img_buffer = io.BytesIO()

                if output_format.upper() == "JPEG":
                    if image.mode == "RGBA":
                        background = Image.new("RGB", image.size, (255, 255, 255))
                        background.paste(image, mask=image.split()[-1])
                        image = background
                    image.save(
                        img_buffer, format="JPEG", quality=quality, optimize=True
                    )
                    file_ext = "jpg"
                elif output_format.upper() == "PNG":
                    image.save(img_buffer, format="PNG", optimize=True)
                    file_ext = "png"
                elif output_format.upper() == "WEBP":
                    image.save(
                        img_buffer, format="WEBP", quality=quality, optimize=True
                    )
                    file_ext = "webp"
                elif output_format.upper() == "TIFF":
                    image.save(img_buffer, format="TIFF", optimize=True)
                    file_ext = "tiff"
                else:
                    raise ValueError(f"Unsupported output format: {output_format}")

                img_filename = f"page_{page_num + 1:03d}.{file_ext}"
                zip_file.writestr(img_filename, img_buffer.getvalue())

        pdf_document.close()

        zip_buffer.seek(0)
        converted_file = create_download_file(
            file_content=zip_buffer.getvalue(), filename=output_filename
        )

        return converted_file

    except Exception as e:
        raise Exception(f"Failed to convert PDF to images: {str(e)}")


def convert_images_to_pdf(
    file_ids,
    output_filename="images_to_pdf.pdf",
    page_size="A4",
    orientation="portrait",
):
    """
    Convert multiple images to a single PDF

    Args:
        file_ids: List of image file UUIDs
        output_filename: Name for the output PDF
        page_size: Page size (A4, A3, Letter, etc.)
        orientation: portrait or landscape

    Returns:
        TemporaryFile object of the created PDF
    """

    image_files = validate_image_files(file_ids)

    try:
        page_sizes = {
            "A4": (595, 842),
            "A3": (842, 1191),
            "A5": (420, 595),
            "Letter": (612, 792),
            "Legal": (612, 1008),
        }

        if page_size not in page_sizes:
            raise ValueError(f"Unsupported page size: {page_size}")

        page_width, page_height = page_sizes[page_size]

        if orientation.lower() == "landscape":
            page_width, page_height = page_height, page_width

        pdf_buffer = io.BytesIO()
        pdf_images = []

        for temp_file in image_files:
            image = Image.open(temp_file.full_file_path)

            if image.mode != "RGB":
                image = image.convert("RGB")

            img_width, img_height = image.size

            scale_x = (page_width - 40) / img_width
            scale_y = (page_height - 40) / img_height
            scale = min(scale_x, scale_y)

            if scale < 1:
                new_width = int(img_width * scale)
                new_height = int(img_height * scale)
                image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

            pdf_images.append(image)

        if pdf_images:
            first_image = pdf_images[0]
            other_images = pdf_images[1:] if len(pdf_images) > 1 else []

            first_image.save(
                pdf_buffer,
                format="PDF",
                save_all=True,
                append_images=other_images,
                resolution=150.0,
            )

        pdf_buffer.seek(0)
        converted_file = create_download_file(
            file_content=pdf_buffer.getvalue(), filename=output_filename
        )

        return converted_file

    except Exception as e:
        raise Exception(f"Failed to convert images to PDF: {str(e)}")


def validate_pdf_to_images_operation(file_id, pages_range=None):
    """
    Validate that a PDF to images conversion can be performed
    """
    try:
        pdf_files = validate_pdf_files([file_id])
        pdf_file = pdf_files[0]

        file_info = get_pdf_info(pdf_file)

        if "error" in file_info:
            raise ValueError(f"Cannot read PDF: {file_info['error']}")

        total_pages = file_info["pages"]

        if pages_range:
            start_page, end_page = pages_range
            if start_page < 1 or end_page > total_pages or start_page > end_page:
                raise ValueError(
                    f"Invalid page range {start_page}-{end_page}. PDF has {total_pages} pages."
                )
            pages_to_convert = end_page - start_page + 1
        else:
            pages_to_convert = total_pages

        if pages_to_convert > 100:
            raise ValueError(
                f"Cannot convert more than 100 pages at once (requested: {pages_to_convert})"
            )

        estimated_size_mb = pages_to_convert * 0.5

        return {
            "valid": True,
            "file_info": file_info,
            "pages_to_convert": pages_to_convert,
            "estimated_output_size_mb": round(estimated_size_mb, 2),
        }

    except (ValueError, Exception) as e:
        return {"valid": False, "error": str(e)}


def rotate_pdf_file(
    file_id, rotation_angle, pages="all", output_filename="rotated_document.pdf"
):
    """
    Rotate pages in a PDF file

    Args:
        file_id: UUID of the PDF file to rotate
        rotation_angle: Degrees to rotate (90, 180, 270, or -90, -180, -270)
        pages: "all" or list of page numbers (1-indexed) to rotate
        output_filename: Name for the output file

    Returns:
        TemporaryFile object of the rotated PDF

    Raises:
        ValueError: If validation fails
        Exception: If PDF processing fails
    """

    # Validate input file
    pdf_files = validate_pdf_files([file_id])
    temp_file = pdf_files[0]

    # Validate rotation angle
    valid_angles = [90, 180, 270, -90, -180, -270]
    if rotation_angle not in valid_angles:
        raise ValueError(f"Invalid rotation angle. Must be one of: {valid_angles}")

    # Create PDF writer for output
    pdf_writer = PdfWriter()

    try:
        # Read the PDF file
        with open(temp_file.full_file_path, "rb") as pdf_file:
            pdf_reader = PdfReader(pdf_file)

            # Check if PDF is encrypted
            if pdf_reader.is_encrypted:
                raise ValueError(
                    f"PDF {temp_file.original_filename} is encrypted and cannot be rotated"
                )

            total_pages = len(pdf_reader.pages)

            # Determine which pages to rotate
            if pages == "all":
                pages_to_rotate = list(range(total_pages))
            else:
                # Convert 1-indexed page numbers to 0-indexed
                pages_to_rotate = []
                for page_num in pages:
                    if page_num < 1 or page_num > total_pages:
                        raise ValueError(
                            f"Invalid page number {page_num}. PDF has {total_pages} pages"
                        )
                    pages_to_rotate.append(page_num - 1)

            # Process each page
            for page_index in range(total_pages):
                page = pdf_reader.pages[page_index]

                # Rotate the page if it's in the list
                if page_index in pages_to_rotate:
                    page.rotate(rotation_angle)

                pdf_writer.add_page(page)

        # Create output buffer
        output_buffer = io.BytesIO()
        pdf_writer.write(output_buffer)
        output_buffer.seek(0)

        # Create temporary file for the rotated PDF
        rotated_file = create_download_file(
            file_content=output_buffer.getvalue(), filename=output_filename
        )

        return rotated_file

    except Exception as e:
        raise Exception(f"Failed to rotate PDF: {str(e)}")


def validate_rotate_operation(file_id, rotation_angle, pages="all"):
    """
    Validate that a rotate operation can be performed

    Args:
        file_id: UUID of the PDF file
        rotation_angle: Degrees to rotate
        pages: "all" or list of page numbers

    Returns:
        dict with validation results and file information
    """
    try:
        # Validate the PDF file
        pdf_files = validate_pdf_files([file_id])
        temp_file = pdf_files[0]

        # Get file info
        file_info = get_pdf_info(temp_file)

        # Validate rotation angle
        valid_angles = [90, 180, 270, -90, -180, -270]
        if rotation_angle not in valid_angles:
            raise ValueError(f"Invalid rotation angle. Must be one of: {valid_angles}")

        # Validate pages if specific pages are provided
        if pages != "all":
            if not isinstance(pages, list):
                raise ValueError("Pages must be 'all' or a list of page numbers")

            total_pages = file_info.get("pages", 0)
            for page_num in pages:
                if (
                    not isinstance(page_num, int)
                    or page_num < 1
                    or page_num > total_pages
                ):
                    raise ValueError(
                        f"Invalid page number {page_num}. Must be between 1 and {total_pages}"
                    )

        return {
            "valid": True,
            "file_info": file_info,
            "rotation_angle": rotation_angle,
            "pages_to_rotate": pages,
            "estimated_output_size_mb": file_info.get(
                "size_mb", 0
            ),  # Size should remain similar
        }

    except (ValueError, Exception) as e:
        return {"valid": False, "error": str(e), "file_info": {}}

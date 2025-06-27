import io
import os
import zipfile
from io import BytesIO

from django.core.files.base import ContentFile
from file_manager.models import TemporaryFile
from file_manager.utils import create_download_file
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

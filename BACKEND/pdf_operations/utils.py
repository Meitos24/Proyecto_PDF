import io
import os

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

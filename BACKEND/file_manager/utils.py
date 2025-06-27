import mimetypes
import os
import uuid

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from .models import TemporaryFile


def generate_unique_filename(original_filename):
    """Generate a unique filename while preserving the extension"""
    name, ext = os.path.splitext(original_filename)
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{ext}"


def save_uploaded_file(uploaded_file):
    """
    Save uploaded file to storage and create TemporaryFile record
    Returns TemporaryFile instance
    """
    # Generate unique filename
    unique_filename = generate_unique_filename(uploaded_file.name)

    # Create directory path (organize by date)
    from datetime import datetime

    date_path = datetime.now().strftime("%Y/%m/%d")
    file_path = os.path.join("uploads", date_path, unique_filename)

    # Save file to storage
    saved_path = default_storage.save(file_path, ContentFile(uploaded_file.read()))

    # Get or detect MIME type with improved detection for Office files
    mime_type = uploaded_file.content_type
    if not mime_type or mime_type == "application/octet-stream":
        mime_type, _ = mimetypes.guess_type(uploaded_file.name)

        # Fallback for Office files if mimetypes doesn't detect correctly
        if not mime_type and uploaded_file.name:
            ext = os.path.splitext(uploaded_file.name.lower())[1]
            office_mime_types = {
                ".doc": "application/msword",
                ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls": "application/vnd.ms-excel",
                ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt": "application/vnd.ms-powerpoint",
                ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".pdf": "application/pdf",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".gif": "image/gif",
                ".bmp": "image/bmp",
                ".tiff": "image/tiff",
            }
            mime_type = office_mime_types.get(ext, "application/octet-stream")

    mime_type = mime_type or "application/octet-stream"

    # Create TemporaryFile record
    temp_file = TemporaryFile.objects.create(
        original_filename=uploaded_file.name,
        file_path=saved_path,
        file_size=uploaded_file.size,
        mime_type=mime_type,
    )

    return temp_file


def create_download_file(file_content, filename, original_temp_file=None):
    """
    Create a new temporary file for download (for processed files)
    file_content: bytes or file-like object
    filename: desired filename
    original_temp_file: optional reference to original file for metadata
    """
    # Generate unique filename
    unique_filename = generate_unique_filename(filename)

    # Create directory path
    from datetime import datetime

    date_path = datetime.now().strftime("%Y/%m/%d")
    file_path = os.path.join("processed", date_path, unique_filename)

    # Save file content
    if isinstance(file_content, bytes):
        content = ContentFile(file_content)
    else:
        content = file_content

    saved_path = default_storage.save(file_path, content)

    # Get MIME type
    mime_type, _ = mimetypes.guess_type(filename)
    mime_type = mime_type or "application/octet-stream"

    # Get file size
    file_size = default_storage.size(saved_path)

    # Create TemporaryFile record
    temp_file = TemporaryFile.objects.create(
        original_filename=filename,
        file_path=saved_path,
        file_size=file_size,
        mime_type=mime_type,
    )

    return temp_file


def cleanup_expired_files():
    """Utility function to clean up expired files"""
    return TemporaryFile.cleanup_expired_files()


def get_file_info(file_path):
    """Get basic file information with improved Office file detection"""
    if not os.path.exists(file_path):
        return None

    stat = os.stat(file_path)
    mime_type, _ = mimetypes.guess_type(file_path)

    # Enhanced MIME type detection for Office files
    if not mime_type:
        ext = os.path.splitext(file_path.lower())[1]
        office_mime_types = {
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls": "application/vnd.ms-excel",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt": "application/vnd.ms-powerpoint",
            ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".pdf": "application/pdf",
        }
        mime_type = office_mime_types.get(ext, "application/octet-stream")

    return {
        "size": stat.st_size,
        "modified": stat.st_mtime,
        "mime_type": mime_type or "application/octet-stream",
    }

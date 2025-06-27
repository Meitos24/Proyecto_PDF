import os

from django.core.files.storage import default_storage
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import TemporaryFile
from .serializers import FileUploadSerializer, TemporaryFileSerializer
from .utils import cleanup_expired_files, save_uploaded_file


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    """
    Upload a file and return file information
    """
    serializer = FileUploadSerializer(data=request.data)

    if serializer.is_valid():
        uploaded_file = serializer.validated_data["file"]

        try:
            # Save file and create record
            temp_file = save_uploaded_file(uploaded_file)

            # Return file information
            file_serializer = TemporaryFileSerializer(
                temp_file, context={"request": request}
            )

            return Response(
                {
                    "success": True,
                    "message": "File uploaded successfully",
                    "file": file_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"success": False, "message": f"Error uploading file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    return Response(
        {"success": False, "message": "Invalid file data", "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
def download_file(request, file_id):
    """
    Download a file by its ID
    """
    try:
        temp_file = get_object_or_404(TemporaryFile, id=file_id)

        # Check if file is expired
        if temp_file.is_expired:
            return Response(
                {"success": False, "message": "File has expired"},
                status=status.HTTP_410_GONE,
            )

        # Check if physical file exists
        if not temp_file.file_exists:
            return Response(
                {"success": False, "message": "File not found on storage"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Open and serve file
        try:
            with default_storage.open(temp_file.file_path, "rb") as file:
                response = HttpResponse(file.read(), content_type=temp_file.mime_type)
                response["Content-Disposition"] = (
                    f'attachment; filename="{temp_file.original_filename}"'
                )
                response["Content-Length"] = temp_file.file_size
                return response

        except Exception as e:
            return Response(
                {"success": False, "message": f"Error reading file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        return Response(
            {"success": False, "message": f"Error downloading file: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def file_info(request, file_id):
    """
    Get information about a specific file
    """
    temp_file = get_object_or_404(TemporaryFile, id=file_id)

    serializer = TemporaryFileSerializer(temp_file, context={"request": request})

    return Response({"success": True, "file": serializer.data})


@api_view(["DELETE"])
def delete_file(request, file_id):
    """
    Delete a specific file
    """
    temp_file = get_object_or_404(TemporaryFile, id=file_id)

    try:
        filename = temp_file.original_filename
        temp_file.delete()  # This will also delete the physical file

        return Response(
            {"success": True, "message": f'File "{filename}" deleted successfully'}
        )

    except Exception as e:
        return Response(
            {"success": False, "message": f"Error deleting file: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def cleanup_files(request):
    """
    Clean up expired files (can be called manually or via cron)
    """
    try:
        deleted_count = cleanup_expired_files()

        return Response(
            {"success": True, "message": f"Cleaned up {deleted_count} expired files"}
        )

    except Exception as e:
        return Response(
            {"success": False, "message": f"Error during cleanup: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def list_files(request):
    """
    List all current temporary files (for debugging/admin purposes)
    """
    files = TemporaryFile.objects.filter(expires_at__gt=timezone.now())
    serializer = TemporaryFileSerializer(files, many=True, context={"request": request})

    return Response({"success": True, "count": files.count(), "files": serializer.data})


@api_view(["GET"])
def storage_stats(request):
    """
    Get storage statistics
    """
    from django.utils import timezone

    total_files = TemporaryFile.objects.count()
    active_files = TemporaryFile.objects.filter(expires_at__gt=timezone.now()).count()
    expired_files = total_files - active_files

    # Calculate total storage used
    total_size = sum(
        f.file_size for f in TemporaryFile.objects.filter(expires_at__gt=timezone.now())
    )

    return Response(
        {
            "success": True,
            "stats": {
                "total_files": total_files,
                "active_files": active_files,
                "expired_files": expired_files,
                "total_storage_bytes": total_size,
                "total_storage_mb": round(total_size / (1024 * 1024), 2),
            },
        }
    )

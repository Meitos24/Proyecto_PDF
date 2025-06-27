from rest_framework import serializers

from .models import TemporaryFile


class TemporaryFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    is_expired = serializers.ReadOnlyField()
    file_exists = serializers.ReadOnlyField()

    class Meta:
        model = TemporaryFile
        fields = [
            "id",
            "original_filename",
            "file_size",
            "mime_type",
            "uploaded_at",
            "expires_at",
            "is_expired",
            "file_exists",
            "file_url",
        ]
        read_only_fields = ["id", "uploaded_at", "expires_at"]

    def get_file_url(self, obj):
        """Generate download URL for the file"""
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(f"/api/files/download/{obj.id}/")
        return f"/api/files/download/{obj.id}/"


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        """Validate uploaded file"""
        # Check file size (50MB limit)
        max_size = 200 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 50MB")

        # Check file type - PDF, images, and Microsoft Office documents
        allowed_types = [
            # PDF files
            "application/pdf",
            # Image files
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/tiff",
            # Microsoft Office documents
            "application/msword",  # .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
            "application/vnd.ms-excel",  # .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # .xlsx
            "application/vnd.ms-powerpoint",  # .ppt
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",  # .pptx
            # Sometimes Office files are detected as octet-stream, so we'll check by extension too
            "application/octet-stream",
        ]

        # If content_type is octet-stream, validate by file extension
        if value.content_type == "application/octet-stream":
            allowed_extensions = [
                ".pdf",
                ".doc",
                ".docx",
                ".xls",
                ".xlsx",
                ".ppt",
                ".pptx",
                ".jpg",
                ".jpeg",
                ".png",
                ".gif",
                ".bmp",
                ".tiff",
            ]

            file_extension = None
            if hasattr(value, "name") and value.name:
                import os

                file_extension = os.path.splitext(value.name.lower())[1]

            if not file_extension or file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f"File extension '{file_extension}' is not supported. "
                    f"Allowed extensions: {', '.join(allowed_extensions)}"
                )

        elif value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"File type '{value.content_type}' is not supported. "
                f"Allowed types: PDF, Word, Excel, PowerPoint, JPEG, PNG, GIF, BMP, TIFF"
            )

        return value

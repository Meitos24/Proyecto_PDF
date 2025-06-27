from rest_framework import serializers

from .models import PDFOperation


class PDFOperationSerializer(serializers.ModelSerializer):
    duration = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = PDFOperation
        fields = [
            "id",
            "operation_type",
            "status",
            "input_files",
            "output_file",
            "parameters",
            "error_message",
            "created_at",
            "started_at",
            "completed_at",
            "expires_at",
            "duration",
            "is_expired",
        ]
        read_only_fields = [
            "id",
            "status",
            "output_file",
            "error_message",
            "created_at",
            "started_at",
            "completed_at",
            "expires_at",
        ]


class MergePDFSerializer(serializers.Serializer):
    """Serializer for PDF merge operation"""

    file_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=2,
        help_text="List of file UUIDs to merge (minimum 2 files)",
    )
    output_filename = serializers.CharField(
        max_length=255,
        default="merged_document.pdf",
        help_text="Name for the output file",
    )

    def validate_file_ids(self, value):
        if len(value) < 2:
            raise serializers.ValidationError(
                "At least 2 files are required for merging"
            )
        if len(value) > 20:
            raise serializers.ValidationError("Maximum 20 files can be merged at once")
        return value

    def validate_output_filename(self, value):
        if not value.lower().endswith(".pdf"):
            value += ".pdf"
        return value


class PDFOperationStatusSerializer(serializers.Serializer):
    """Serializer for checking operation status"""

    operation_id = serializers.UUIDField()


class PDFOperationResultSerializer(serializers.Serializer):
    """Serializer for operation results"""

    success = serializers.BooleanField()
    message = serializers.CharField()
    operation = PDFOperationSerializer(required=False)
    download_url = serializers.URLField(required=False)

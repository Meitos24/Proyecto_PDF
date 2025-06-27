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


class PageRangeSerializer(serializers.Serializer):
    """Serializer for page range specification"""

    start = serializers.IntegerField(min_value=1)
    end = serializers.IntegerField(min_value=1)

    def validate(self, data):
        if data["start"] > data["end"]:
            raise serializers.ValidationError(
                "Start page must be less than or equal to end page"
            )
        return data


class SplitPDFSerializer(serializers.Serializer):
    """Serializer for PDF split operation"""

    SPLIT_MODE_CHOICES = [
        ("all_pages", "Split into individual pages"),
        ("page_ranges", "Split by page ranges"),
        ("every_n_pages", "Split every N pages"),
    ]

    file_id = serializers.UUIDField(help_text="UUID of the PDF file to split")
    mode = serializers.ChoiceField(
        choices=SPLIT_MODE_CHOICES, default="all_pages", help_text="Split mode"
    )
    output_prefix = serializers.CharField(
        max_length=100, default="page", help_text="Prefix for output file names"
    )

    # For page_ranges mode
    ranges = PageRangeSerializer(
        many=True,
        required=False,
        help_text="List of page ranges (required for page_ranges mode)",
    )

    # For every_n_pages mode
    pages_per_split = serializers.IntegerField(
        min_value=1,
        max_value=100,
        required=False,
        help_text="Number of pages per split file (required for every_n_pages mode)",
    )

    def validate(self, data):
        mode = data.get("mode")

        if mode == "page_ranges":
            if not data.get("ranges"):
                raise serializers.ValidationError(
                    {"ranges": "Page ranges are required for page_ranges mode"}
                )

            if len(data["ranges"]) > 20:
                raise serializers.ValidationError(
                    {"ranges": "Maximum 20 page ranges allowed"}
                )

        elif mode == "every_n_pages":
            if not data.get("pages_per_split"):
                raise serializers.ValidationError(
                    {
                        "pages_per_split": "Pages per split is required for every_n_pages mode"
                    }
                )

        return data


class PDFSplitInfoSerializer(serializers.Serializer):
    """Serializer for PDF split information"""

    file_id = serializers.UUIDField()


class SplitValidationSerializer(serializers.Serializer):
    """Serializer for split validation"""

    file_id = serializers.UUIDField()
    mode = serializers.ChoiceField(
        choices=SplitPDFSerializer.SPLIT_MODE_CHOICES, default="all_pages"
    )
    ranges = PageRangeSerializer(many=True, required=False)
    pages_per_split = serializers.IntegerField(min_value=1, required=False)


class PDFToImagesSerializer(serializers.Serializer):
    """Serializer for PDF to images conversion"""

    file_id = serializers.UUIDField(help_text="UUID of the PDF file to convert")
    output_format = serializers.ChoiceField(
        choices=["PNG", "JPEG", "WEBP", "TIFF"],
        default="PNG",
        help_text="Output image format",
    )
    quality = serializers.IntegerField(
        min_value=1,
        max_value=100,
        default=95,
        help_text="Image quality for JPEG/WEBP (1-100)",
    )
    dpi = serializers.IntegerField(
        min_value=72, max_value=300, default=150, help_text="Resolution in DPI (72-300)"
    )
    output_filename = serializers.CharField(
        max_length=255, required=False, help_text="Base name for output ZIP file"
    )
    start_page = serializers.IntegerField(
        min_value=1, required=False, help_text="Starting page number (1-based)"
    )
    end_page = serializers.IntegerField(
        min_value=1, required=False, help_text="Ending page number (1-based)"
    )

    def validate(self, data):
        """Validate page range if provided"""
        start_page = data.get("start_page")
        end_page = data.get("end_page")

        if start_page and end_page:
            if start_page > end_page:
                raise serializers.ValidationError(
                    "start_page must be less than or equal to end_page"
                )
        elif start_page and not end_page:
            raise serializers.ValidationError(
                "end_page is required when start_page is provided"
            )
        elif end_page and not start_page:
            raise serializers.ValidationError(
                "start_page is required when end_page is provided"
            )

        return data


class ImagesToPDFSerializer(serializers.Serializer):
    """Serializer for images to PDF conversion"""

    file_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=50,
        help_text="List of image file UUIDs to convert",
    )
    output_filename = serializers.CharField(
        max_length=255,
        default="images_to_pdf.pdf",
        help_text="Name for the output PDF file",
    )
    page_size = serializers.ChoiceField(
        choices=["A4", "A3", "A5", "Letter", "Legal"],
        default="A4",
        help_text="Page size for the PDF",
    )
    orientation = serializers.ChoiceField(
        choices=["portrait", "landscape"],
        default="portrait",
        help_text="Page orientation",
    )

    def validate_output_filename(self, value):
        if not value.lower().endswith(".pdf"):
            value += ".pdf"
        return value


class RotatePDFSerializer(serializers.Serializer):
    """Serializer for PDF rotate operation"""

    file_id = serializers.UUIDField(help_text="UUID of the PDF file to rotate")
    rotation_angle = serializers.IntegerField(
        help_text="Degrees to rotate (90, 180, 270, -90, -180, -270)"
    )
    pages = serializers.CharField(
        default="all",
        help_text="'all' to rotate all pages, or comma-separated page numbers (e.g., '1,3,5')",
    )
    output_filename = serializers.CharField(
        max_length=255,
        default="rotated_document.pdf",
        help_text="Name for the output file",
    )

    def validate_rotation_angle(self, value):
        valid_angles = [90, 180, 270, -90, -180, -270]
        if value not in valid_angles:
            raise serializers.ValidationError(
                f"Invalid rotation angle. Must be one of: {valid_angles}"
            )
        return value

    def validate_pages(self, value):
        if value == "all":
            return value

        try:
            # Parse comma-separated page numbers
            pages = [int(p.strip()) for p in value.split(",") if p.strip()]
            if not pages:
                raise ValueError("No valid page numbers provided")
            return pages
        except ValueError:
            raise serializers.ValidationError(
                "Pages must be 'all' or comma-separated page numbers (e.g., '1,3,5')"
            )

    def validate_output_filename(self, value):
        if not value.lower().endswith(".pdf"):
            value += ".pdf"
        return value

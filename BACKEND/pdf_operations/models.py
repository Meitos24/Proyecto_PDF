import uuid
from datetime import timedelta

from django.db import models
from django.utils import timezone


class PDFOperation(models.Model):
    """Track PDF operations for analytics and debugging"""

    OPERATION_TYPES = [
        ("merge", "Merge PDFs"),
        ("split", "Split PDF"),
        ("compress", "Compress PDF"),
        ("convert_to_image", "Convert PDF to Image"),
        ("convert_from_image", "Convert Image to PDF"),
        ("rotate", "Rotate PDF"),
        ("protect", "Protect PDF"),
        ("unlock", "Unlock PDF"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    operation_type = models.CharField(max_length=20, choices=OPERATION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Input and output file references (UUIDs from file_manager)
    input_files = models.JSONField(default=list, help_text="List of input file UUIDs")
    output_file = models.CharField(
        max_length=100, blank=True, null=True, help_text="Output file UUID"
    )

    # Operation metadata
    parameters = models.JSONField(
        default=dict, help_text="Operation-specific parameters"
    )
    error_message = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    # Auto-cleanup
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "pdf_operations"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Operations expire after 2 hours
            self.expires_at = timezone.now() + timedelta(hours=2)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def duration(self):
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None

    def mark_as_processing(self):
        self.status = "processing"
        self.started_at = timezone.now()
        self.save()

    def mark_as_completed(self, output_file_uuid):
        self.status = "completed"
        self.completed_at = timezone.now()
        self.output_file = output_file_uuid
        self.save()

    def mark_as_failed(self, error_message):
        self.status = "failed"
        self.completed_at = timezone.now()
        self.error_message = error_message
        self.save()

    def __str__(self):
        return f"{self.get_operation_type_display()} - {self.status} ({self.id})"

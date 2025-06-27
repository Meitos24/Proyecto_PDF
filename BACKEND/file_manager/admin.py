from django.contrib import admin
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html

from .models import TemporaryFile


@admin.register(TemporaryFile)
class TemporaryFileAdmin(admin.ModelAdmin):
    list_display = [
        "original_filename",
        "file_size_display",
        "mime_type",
        "uploaded_at",
        "expires_at",
        "status_display",
        "file_exists",
        "actions_display",
    ]

    list_filter = ["mime_type", "uploaded_at", "expires_at"]

    def get_list_filter(self, request):
        """Dynamic list filter with readable file type names"""
        return [
            ("mime_type", admin.ChoicesFieldListFilter),
            "uploaded_at",
            "expires_at",
        ]

    search_fields = ["original_filename", "id"]

    readonly_fields = [
        "id",
        "uploaded_at",
        "file_size_display",
        "full_file_path",
        "is_expired",
        "file_exists",
    ]

    ordering = ["-uploaded_at"]

    def file_size_display(self, obj):
        """Display file size in human readable format"""
        size = obj.file_size
        for unit in ["B", "KB", "MB", "GB"]:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    file_size_display.short_description = "File Size"

    def status_display(self, obj):
        """Display file status with color coding"""
        if obj.is_expired:
            return format_html(
                '<span style="color: red; font-weight: bold;">Expired</span>'
            )
        elif not obj.file_exists:
            return format_html(
                '<span style="color: orange; font-weight: bold;">Missing</span>'
            )
        else:
            return format_html(
                '<span style="color: green; font-weight: bold;">Active</span>'
            )

    status_display.short_description = "Status"

    def actions_display(self, obj):
        """Display action buttons"""
        download_url = reverse("download_file", args=[obj.id])

        actions = []

        if not obj.is_expired and obj.file_exists:
            actions.append(
                f'<a href="{download_url}" target="_blank" '
                f'style="color: blue;">Download</a>'
            )

        if actions:
            return format_html(" | ".join(actions))
        return "-"

    actions_display.short_description = "Actions"

    def get_queryset(self, request):
        """Add custom annotations"""
        qs = super().get_queryset(request)
        return qs

    actions = ["cleanup_expired_files", "force_delete_selected"]

    def cleanup_expired_files(self, request, queryset):
        """Admin action to cleanup expired files"""
        deleted_count = TemporaryFile.cleanup_expired_files()
        self.message_user(
            request, f"Successfully cleaned up {deleted_count} expired files."
        )

    cleanup_expired_files.short_description = "Clean up expired files"

    def force_delete_selected(self, request, queryset):
        """Admin action to force delete selected files"""
        count = 0
        for obj in queryset:
            obj.delete()
            count += 1

        self.message_user(request, f"Successfully deleted {count} files.")

    force_delete_selected.short_description = "Force delete selected files"

    fieldsets = (
        (
            "File Information",
            {
                "fields": (
                    "id",
                    "original_filename",
                    "file_path",
                    "full_file_path",
                    "file_size_display",
                    "mime_type",
                )
            },
        ),
        ("Timestamps", {"fields": ("uploaded_at", "expires_at")}),
        ("Status", {"fields": ("is_expired", "file_exists")}),
    )

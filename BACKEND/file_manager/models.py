import os
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class TemporaryFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "temporary_files"
        ordering = ["-uploaded_at"]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Files expire after 1 hour by default
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def full_file_path(self):
        """Returns the absolute path to the file"""
        return os.path.join(settings.MEDIA_ROOT, self.file_path)

    @property
    def file_exists(self):
        """Check if the physical file still exists"""
        return os.path.exists(self.full_file_path)

    def delete_file(self):
        """Delete the physical file from storage"""
        if self.file_exists:
            try:
                os.remove(self.full_file_path)
                return True
            except OSError:
                return False
        return False

    def delete(self, *args, **kwargs):
        """Override delete to also remove physical file"""
        self.delete_file()
        super().delete(*args, **kwargs)

    @classmethod
    def cleanup_expired_files(cls):
        """Class method to clean up expired files"""
        expired_files = cls.objects.filter(expires_at__lt=timezone.now())
        count = 0
        for file_obj in expired_files:
            file_obj.delete()
            count += 1
        return count

    def __str__(self):
        return f"{self.original_filename} ({self.id})"

from django.core.management.base import BaseCommand
from file_manager.models import TemporaryFile


class Command(BaseCommand):
    help = "Clean up expired temporary files"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be deleted without actually deleting",
        )

        parser.add_argument(
            "--force",
            action="store_true",
            help="Delete all files regardless of expiration",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        force = options["force"]

        if force:
            files_to_delete = TemporaryFile.objects.all()
            self.stdout.write(self.style.WARNING("FORCE MODE: Will delete ALL files"))
        else:
            from django.utils import timezone

            files_to_delete = TemporaryFile.objects.filter(
                expires_at__lt=timezone.now()
            )

        count = files_to_delete.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("No files to clean up"))
            return

        if dry_run:
            self.stdout.write(
                self.style.WARNING(f"DRY RUN: Would delete {count} files:")
            )
            for file_obj in files_to_delete:
                self.stdout.write(f"  - {file_obj.original_filename} ({file_obj.id})")
        else:
            self.stdout.write(f"Deleting {count} files...")

            deleted_count = 0
            for file_obj in files_to_delete:
                try:
                    filename = file_obj.original_filename
                    file_obj.delete()
                    deleted_count += 1
                    self.stdout.write(f"  ✓ Deleted: {filename}")
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"  ✗ Failed to delete {file_obj.original_filename}: {e}"
                        )
                    )

            self.stdout.write(
                self.style.SUCCESS(f"Successfully deleted {deleted_count} files")
            )

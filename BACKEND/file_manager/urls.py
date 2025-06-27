from django.urls import path

from . import views

urlpatterns = [
    # File upload
    path("upload/", views.upload_file, name="upload_file"),
    # File download
    path("download/<uuid:file_id>/", views.download_file, name="download_file"),
    # File management
    path("info/<uuid:file_id>/", views.file_info, name="file_info"),
    path("delete/<uuid:file_id>/", views.delete_file, name="delete_file"),
    # Utility endpoints
    path("cleanup/", views.cleanup_files, name="cleanup_files"),
    path("list/", views.list_files, name="list_files"),
    path("stats/", views.storage_stats, name="storage_stats"),
]

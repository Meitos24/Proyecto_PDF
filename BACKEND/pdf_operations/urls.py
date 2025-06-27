from django.urls import path

from . import views

urlpatterns = [
    # PDF Merge operations
    path("merge/", views.merge_pdfs, name="merge_pdfs"),
    path("merge/validate/", views.validate_merge, name="validate_merge"),
    # PDF Split operations
    path("split/", views.split_pdf, name="split_pdf"),
    path("split/info/", views.get_pdf_info, name="get_pdf_info"),
    path("split/validate/", views.validate_split, name="validate_split"),
    # PDF to Images conversion
    path("convert/images-to-pdf/", views.images_to_pdf, name="images_to_pdf"),
    path("convert/pdf-to-images/", views.pdf_to_images, name="pdf_to_images"),
    path(
        "convert/pdf-to-images/validate/",
        views.validate_pdf_conversion,
        name="validate_pdf_conversion",
    ),
    # PDF Rotate operations
    path("rotate/", views.rotate_pdf, name="rotate_pdf"),
    path("rotate/validate/", views.validate_rotate, name="validate_rotate"),
    # Operation status and results
    path(
        "operation/<uuid:operation_id>/",
        views.get_operation_status,
        name="get_operation_status",
    ),
    path(
        "operation/<uuid:operation_id>/result/",
        views.get_operation_result,
        name="get_operation_result",
    ),
    # General info endpoint
    path("", views.pdf_operations_info, name="pdf_operations_info"),
    # Future endpoints:
    # path('split/', views.split_pdf, name='split_pdf'),
    # path('compress/', views.compress_pdf, name='compress_pdf'),
    # path('convert/pdf-to-jpg/', views.pdf_to_jpg, name='pdf_to_jpg'),
    # path('convert/jpg-to-pdf/', views.jpg_to_pdf, name='jpg_to_pdf'),
]

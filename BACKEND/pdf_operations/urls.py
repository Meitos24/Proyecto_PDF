from django.http import JsonResponse
from django.urls import path


# Temporary view for testing
def temp_view(request):
    return JsonResponse(
        {
            "message": "PDF Operations API - Coming Soon",
            "available_operations": [
                "merge",
                "split",
                "compress",
                "pdf_to_jpg",
                "jpg_to_pdf",
                "convert",
            ],
        }
    )


urlpatterns = [
    # Temporary endpoint until we implement actual PDF operations
    path("", temp_view, name="pdf_operations_info"),
    # Future endpoints:
    # path('merge/', views.merge_pdfs, name='merge_pdfs'),
    # path('split/', views.split_pdf, name='split_pdf'),
    # path('compress/', views.compress_pdf, name='compress_pdf'),
    # path('convert/pdf-to-jpg/', views.pdf_to_jpg, name='pdf_to_jpg'),
    # path('convert/jpg-to-pdf/', views.jpg_to_pdf, name='jpg_to_pdf'),
]

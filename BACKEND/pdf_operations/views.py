import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import PDFOperation
from .serializers import (ImagesToPDFSerializer, MergePDFSerializer,
                          PDFOperationResultSerializer, PDFOperationSerializer,
                          PDFSplitInfoSerializer, PDFToImagesSerializer,
                          SplitPDFSerializer, SplitValidationSerializer)
from .utils import convert_images_to_pdf  # Add this
from .utils import convert_pdf_to_images  # Add this
from .utils import validate_pdf_to_images_operation  # Add this
from .utils import (get_pdf_split_info, merge_pdf_files, split_pdf_by_pages,
                    validate_merge_operation, validate_split_operation)

logger = logging.getLogger(__name__)


@api_view(["GET"])
def pdf_operations_info(request):
    """General information about PDF operations API"""
    return JsonResponse(
        {
            "message": "PDF Operations API",
            "version": "1.0",
            "available_operations": {
                "merge": {
                    "endpoint": "/api/pdf/merge/",
                    "method": "POST",
                    "description": "Merge multiple PDF files into one",
                    "status": "available",
                },
                "pdf_to_images": {
                    "endpoint": "/api/pdf/convert/pdf-to-images/",
                    "method": "POST",
                    "description": "Convert PDF pages to images (PNG, JPEG, WEBP, TIFF)",
                    "status": "available",
                },
                "images_to_pdf": {
                    "endpoint": "/api/pdf/convert/images-to-pdf/",
                    "method": "POST",
                    "description": "Convert multiple images to a single PDF",
                    "status": "available",
                },
                "split": {
                    "endpoint": "/api/pdf/split/",
                    "method": "POST",
                    "description": "Split PDF into multiple files",
                    "status": "coming_soon",
                },
                "compress": {
                    "endpoint": "/api/pdf/compress/",
                    "method": "POST",
                    "description": "Compress PDF file size",
                    "status": "coming_soon",
                },
            },
            "limits": {
                "max_file_size_mb": 200,
                "max_files_per_merge": 20,
                "max_total_pages": 5000,
                "max_total_size_mb": 500,
                "max_pages_per_conversion": 100,
                "max_images_per_pdf": 50,
                "supported_image_formats": [
                    "JPEG",
                    "PNG",
                    "GIF",
                    "BMP",
                    "TIFF",
                    "WEBP",
                ],
                "supported_output_formats": ["PNG", "JPEG", "WEBP", "TIFF"],
            },
        }
    )


@api_view(["POST"])
def validate_merge(request):
    """Validate files before merging"""
    try:
        # Get file IDs from request
        file_ids = request.data.get("file_ids", [])

        if not file_ids:
            return Response(
                {"success": False, "message": "No file IDs provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate the merge operation
        validation_result = validate_merge_operation(file_ids)

        if validation_result["valid"]:
            return Response(
                {
                    "success": True,
                    "message": "Files are valid for merging",
                    "validation": validation_result,
                }
            )
        else:
            return Response(
                {
                    "success": False,
                    "message": validation_result["error"],
                    "validation": validation_result,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        logger.error(f"Error validating merge: {str(e)}")
        return Response(
            {"success": False, "message": f"Validation error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def merge_pdfs(request):
    """Merge multiple PDF files"""
    try:
        # Validate request data
        serializer = MergePDFSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request data",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_ids = serializer.validated_data["file_ids"]
        output_filename = serializer.validated_data["output_filename"]

        # Create operation record
        operation = PDFOperation.objects.create(
            operation_type="merge",
            input_files=[str(fid) for fid in file_ids],
            parameters={
                "output_filename": output_filename,
                "file_count": len(file_ids),
            },
        )

        try:
            # Mark as processing
            operation.mark_as_processing()

            # Perform the merge
            merged_file = merge_pdf_files(file_ids, output_filename)

            # Mark as completed
            operation.mark_as_completed(str(merged_file.id))

            # Return success response
            return Response(
                {
                    "success": True,
                    "message": f"Successfully merged {len(file_ids)} PDFs",
                    "operation": {
                        "id": operation.id,
                        "status": operation.status,
                        "output_file_id": merged_file.id,
                        "download_url": request.build_absolute_uri(
                            f"/api/files/download/{merged_file.id}/"
                        ),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except ValueError as ve:
            # Handle validation errors
            operation.mark_as_failed(str(ve))
            return Response(
                {"success": False, "message": str(ve), "operation_id": operation.id},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            # Handle processing errors
            operation.mark_as_failed(str(e))
            logger.error(f"Error merging PDFs: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": f"Error processing PDFs: {str(e)}",
                    "operation_id": operation.id,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error(f"Unexpected error in merge_pdfs: {str(e)}")
        return Response(
            {"success": False, "message": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def get_operation_status(request, operation_id):
    """Get the status of a PDF operation"""
    try:
        operation = get_object_or_404(PDFOperation, id=operation_id)

        serializer = PDFOperationSerializer(operation)

        return Response({"success": True, "operation": serializer.data})

    except Exception as e:
        return Response(
            {"success": False, "message": f"Error retrieving operation: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def get_operation_result(request, operation_id):
    """Get the result of a completed PDF operation"""
    try:
        operation = get_object_or_404(PDFOperation, id=operation_id)

        if operation.status == "completed" and operation.output_file:
            download_url = request.build_absolute_uri(
                f"/api/files/download/{operation.output_file}/"
            )

            return Response(
                {
                    "success": True,
                    "message": "Operation completed successfully",
                    "operation": PDFOperationSerializer(operation).data,
                    "download_url": download_url,
                }
            )

        elif operation.status == "failed":
            return Response(
                {
                    "success": False,
                    "message": f"Operation failed: {operation.error_message}",
                    "operation": PDFOperationSerializer(operation).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        elif operation.status in ["pending", "processing"]:
            return Response(
                {
                    "success": False,
                    "message": f"Operation is still {operation.status}",
                    "operation": PDFOperationSerializer(operation).data,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        else:
            return Response(
                {
                    "success": False,
                    "message": "Unknown operation status",
                    "operation": PDFOperationSerializer(operation).data,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": f"Error retrieving operation result: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def split_pdf(request):
    """Split a PDF file"""
    try:
        # Validate request data
        serializer = SplitPDFSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request data",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_id = serializer.validated_data["file_id"]
        split_options = {
            "mode": serializer.validated_data["mode"],
            "output_prefix": serializer.validated_data["output_prefix"],
        }

        # Add mode-specific options
        if split_options["mode"] == "page_ranges":
            split_options["ranges"] = serializer.validated_data.get("ranges", [])
        elif split_options["mode"] == "every_n_pages":
            split_options["pages_per_split"] = serializer.validated_data.get(
                "pages_per_split"
            )

        # Create operation record
        operation = PDFOperation.objects.create(
            operation_type="split",
            input_files=[str(file_id)],
            parameters=split_options,
        )

        try:
            # Mark as processing
            operation.mark_as_processing()

            # Perform the split
            split_result, file_count, is_single_file = split_pdf_by_pages(
                file_id, split_options
            )

            # Mark as completed
            operation.mark_as_completed(str(split_result.id))

            # Determine response message based on output type
            if is_single_file:
                message = f"Successfully extracted pages as single PDF"
                file_type = "PDF"
            else:
                message = f"Successfully split PDF into {file_count} files (ZIP)"
                file_type = "ZIP"

            # Return success response
            return Response(
                {
                    "success": True,
                    "message": message,
                    "operation": {
                        "id": operation.id,
                        "status": operation.status,
                        "output_file_id": split_result.id,
                        "file_count": file_count,
                        "is_single_file": is_single_file,
                        "file_type": file_type,
                        "download_url": request.build_absolute_uri(
                            f"/api/files/download/{split_result.id}/"
                        ),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except ValueError as ve:
            # Handle validation errors
            operation.mark_as_failed(str(ve))
            return Response(
                {"success": False, "message": str(ve), "operation_id": operation.id},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            # Handle processing errors
            operation.mark_as_failed(str(e))
            logger.error(f"Error splitting PDF: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": f"Error processing PDF: {str(e)}",
                    "operation_id": operation.id,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error(f"Unexpected error in split_pdf: {str(e)}")
        return Response(
            {"success": False, "message": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def get_pdf_info(request):
    """Get information about a PDF for splitting"""
    try:
        serializer = PDFSplitInfoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request data",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_id = serializer.validated_data["file_id"]

        # Get PDF information
        pdf_info = get_pdf_split_info(file_id)

        if "error" in pdf_info:
            return Response(
                {
                    "success": False,
                    "message": pdf_info["error"],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "pdf_info": pdf_info,
            }
        )

    except Exception as e:
        logger.error(f"Error getting PDF info: {str(e)}")
        return Response(
            {"success": False, "message": f"Error getting PDF info: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def validate_split(request):
    """Validate split operation before processing"""
    try:
        serializer = SplitValidationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request data",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_id = serializer.validated_data["file_id"]
        split_options = {
            "mode": serializer.validated_data.get("mode", "all_pages"),
        }

        # Add mode-specific options
        if split_options["mode"] == "page_ranges":
            split_options["ranges"] = serializer.validated_data.get("ranges", [])
        elif split_options["mode"] == "every_n_pages":
            split_options["pages_per_split"] = serializer.validated_data.get(
                "pages_per_split"
            )

        # Validate the split operation
        validation_result = validate_split_operation(file_id, split_options)

        if validation_result["valid"]:
            return Response(
                {
                    "success": True,
                    "message": "Split operation is valid",
                    "validation": validation_result,
                }
            )
        else:
            return Response(
                {
                    "success": False,
                    "message": validation_result["error"],
                    "validation": validation_result,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        logger.error(f"Error validating split: {str(e)}")
        return Response(
            {"success": False, "message": f"Validation error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def pdf_to_images(request):
    """Convert PDF to images"""
    try:
        serializer = PDFToImagesSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request data",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_data = serializer.validated_data
        file_id = validated_data["file_id"]
        output_format = validated_data["output_format"]
        quality = validated_data["quality"]
        dpi = validated_data["dpi"]
        output_filename = validated_data.get("output_filename")

        # Handle page range
        pages_range = None
        if validated_data.get("start_page") and validated_data.get("end_page"):
            pages_range = (validated_data["start_page"], validated_data["end_page"])

        # Create operation record
        operation = PDFOperation.objects.create(
            operation_type="convert_to_image",
            input_files=[str(file_id)],
            parameters={
                "output_format": output_format,
                "quality": quality,
                "dpi": dpi,
                "pages_range": pages_range,
                "output_filename": output_filename,
            },
        )

        try:
            operation.mark_as_processing()

            # Perform the conversion
            converted_file = convert_pdf_to_images(
                file_id=file_id,
                output_format=output_format,
                quality=quality,
                dpi=dpi,
                output_filename=output_filename,
                pages_range=pages_range,
            )

            operation.mark_as_completed(str(converted_file.id))

            return Response(
                {
                    "success": True,
                    "message": f"Successfully converted PDF to {output_format} images",
                    "operation": {
                        "id": operation.id,
                        "status": operation.status,
                        "output_file_id": converted_file.id,
                        "download_url": request.build_absolute_uri(
                            f"/api/files/download/{converted_file.id}/"
                        ),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except ValueError as ve:
            operation.mark_as_failed(str(ve))
            return Response(
                {"success": False, "message": str(ve), "operation_id": operation.id},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            operation.mark_as_failed(str(e))
            logger.error(f"Error converting PDF to images: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": f"Error processing PDF: {str(e)}",
                    "operation_id": operation.id,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error(f"Unexpected error in pdf_to_images: {str(e)}")
        return Response(
            {"success": False, "message": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def images_to_pdf(request):
    """Convert images to PDF"""
    try:
        serializer = ImagesToPDFSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request data",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_data = serializer.validated_data
        file_ids = validated_data["file_ids"]
        output_filename = validated_data["output_filename"]
        page_size = validated_data["page_size"]
        orientation = validated_data["orientation"]

        # Create operation record
        operation = PDFOperation.objects.create(
            operation_type="convert_from_image",
            input_files=[str(fid) for fid in file_ids],
            parameters={
                "output_filename": output_filename,
                "page_size": page_size,
                "orientation": orientation,
                "file_count": len(file_ids),
            },
        )

        try:
            operation.mark_as_processing()

            # Perform the conversion
            converted_file = convert_images_to_pdf(
                file_ids=file_ids,
                output_filename=output_filename,
                page_size=page_size,
                orientation=orientation,
            )

            operation.mark_as_completed(str(converted_file.id))

            return Response(
                {
                    "success": True,
                    "message": f"Successfully converted {len(file_ids)} images to PDF",
                    "operation": {
                        "id": operation.id,
                        "status": operation.status,
                        "output_file_id": converted_file.id,
                        "download_url": request.build_absolute_uri(
                            f"/api/files/download/{converted_file.id}/"
                        ),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except ValueError as ve:
            operation.mark_as_failed(str(ve))
            return Response(
                {"success": False, "message": str(ve), "operation_id": operation.id},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            operation.mark_as_failed(str(e))
            logger.error(f"Error converting images to PDF: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": f"Error processing images: {str(e)}",
                    "operation_id": operation.id,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error(f"Unexpected error in images_to_pdf: {str(e)}")
        return Response(
            {"success": False, "message": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def validate_pdf_conversion(request):
    """Validate PDF before converting to images"""
    try:
        file_id = request.data.get("file_id")
        start_page = request.data.get("start_page")
        end_page = request.data.get("end_page")

        if not file_id:
            return Response(
                {"success": False, "message": "file_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pages_range = None
        if start_page and end_page:
            pages_range = (start_page, end_page)

        validation_result = validate_pdf_to_images_operation(file_id, pages_range)

        if validation_result["valid"]:
            return Response(
                {
                    "success": True,
                    "message": "PDF is valid for conversion",
                    "validation": validation_result,
                }
            )
        else:
            return Response(
                {
                    "success": False,
                    "message": validation_result["error"],
                    "validation": validation_result,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        logger.error(f"Error validating PDF conversion: {str(e)}")
        return Response(
            {"success": False, "message": f"Validation error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

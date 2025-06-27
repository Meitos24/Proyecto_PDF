'use client';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007/api';

export function useFileUpload() {
    const [files, setFiles] = useState([]); // Changed to array for multiple files
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadFileToBackend = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/files/upload/`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error uploading file');
            }

            return {
                success: true,
                fileData: data.file,
                originalFile: file
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                originalFile: file
            };
        }
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        await processFiles(selectedFiles);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files || []);
        await processFiles(droppedFiles);
    };

    const processFiles = async (newFiles) => {
        if (newFiles.length === 0) return;

        setUploading(true);
        setError(null);

        const uploadPromises = newFiles.map(uploadFileToBackend);
        const results = await Promise.all(uploadPromises);

        const successfulUploads = results.filter(result => result.success);
        const failedUploads = results.filter(result => !result.success);

        // Add successful uploads to files list
        const newUploadedFiles = successfulUploads.map(result => ({
            id: result.fileData.id,
            name: result.fileData.original_filename,
            size: result.fileData.file_size,
            mimeType: result.fileData.mime_type,
            uploadedAt: result.fileData.uploaded_at,
            downloadUrl: result.fileData.file_url,
            originalFile: result.originalFile
        }));

        setFiles(prevFiles => [...prevFiles, ...newUploadedFiles]);

        // Handle errors
        if (failedUploads.length > 0) {
            const errorMessages = failedUploads.map(result =>
                `${result.originalFile.name}: ${result.error}`
            );
            setError(errorMessages.join('; '));
        }

        setUploading(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const removeFile = (fileId) => {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    };

    const clearAllFiles = () => {
        setFiles([]);
        setError(null);
    };

    const reorderFiles = (startIndex, endIndex) => {
        const result = Array.from(files);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        setFiles(result);
    };

    return {
        files, // Array of uploaded files
        dragActive,
        uploading,
        error,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeFile,
        clearAllFiles,
        reorderFiles,
        // Legacy support for single file (first file in array)
        file: files.length > 0 ? files[0] : null
    };
}

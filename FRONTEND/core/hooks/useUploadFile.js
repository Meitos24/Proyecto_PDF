'use client';
import { useState } from 'react';

export function useFileUpload() {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            console.log("Archivo seleccionado: ", selectedFile.name);
            setFile(selectedFile);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            console.log("Archivo dropeado:", droppedFile.name);
            setFile(droppedFile);
        }
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

    return {
        file,
        dragActive,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
    };
}

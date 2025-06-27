'use client';
import { useState } from "react";
import { useFileUpload } from "@/core/hooks/useUploadFile";
import FileList from "@/components/FileList";
import RotateProcessor from "@/components/RotateProcessor";
import Navbar from "@/components/Navbar";

export default function RotatePDFPage() {
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const {
        files,
        dragActive,
        uploading,
        error,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeFile,
        clearAllFiles,
        reorderFiles
    } = useFileUpload();

    const handleRotateComplete = (result) => {
        setSuccessMessage('');
        setErrorMessage('');
        // Success message is shown in the RotateProcessor component
    };

    const handleRotateError = (error) => {
        setErrorMessage(error);
        setSuccessMessage('');
    };

    const clearMessages = () => {
        setSuccessMessage('');
        setErrorMessage('');
    };

    return (
        <>
            <Navbar />

            <div className="w-full relative bg-[#020205] text-white font-inter px-4 py-4 flex flex-col items-center min-h-screen">
                <b className="titulo-tools text-3xl sm:text-4xl text-center mb-2">
                    Rotar PDF
                </b>

                <p className="texto-tools text-base sm:text-lg text-[#a6a7a9] text-center max-w-xl mb-12">
                    Rota las páginas de tu PDF en el ángulo que necesites. ¡Rápido y fácil!
                </p>

                {/* Error/Success Messages */}
                {errorMessage && (
                    <div className="w-full max-w-md mb-8 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-red-400 text-xl">×</span>
                                <p className="text-red-400 text-sm">{errorMessage}</p>
                            </div>
                            <button
                                onClick={clearMessages}
                                className="text-red-400 hover:text-red-300"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="w-full max-w-md mb-8 bg-[#1e3a8a]/30 border border-[#3b82f6]/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <p className="text-[#3b82f6] text-sm">{successMessage}</p>
                            </div>
                            <button
                                onClick={clearMessages}
                                className="text-[#3b82f6] hover:text-[#2563eb]"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Upload Error */}
                {error && (
                    <div className="w-full max-w-md mb-8 bg-orange-900/30 border border-orange-500/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-orange-400 text-xl">!</span>
                            <p className="text-orange-400 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* File Upload Area */}
                <div
                    className={`borde-archivos w-full max-w-md border-4 border-dashed rounded-2xl ${dragActive ? "bg-[#111] border-[#4b68ff]" : "bg-transparent border-white"
                        } p-12 flex flex-col items-center justify-center space-y-6 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <label
                        htmlFor="fileInput"
                        className={`largebutton bg-[#4b68ff] hover:bg-[#3b55d6] text-white font-semibold py-4 px-6 rounded cursor-pointer w-full text-center transition ${uploading ? 'cursor-not-allowed' : ''
                            }`}
                    >
                        {uploading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Subiendo...</span>
                            </div>
                        ) : (
                            'Seleccionar Archivo PDF'
                        )}
                    </label>

                    <input
                        type="file"
                        id="fileInput"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                    />

                    <p className="text-[#a6a7a9] font-medium text-center">
                        o arrastra y suelta el PDF aquí
                    </p>

                    {files.length > 0 && (
                        <p className="text-sm text-center text-white">
                            {files.length} archivo{files.length > 1 ? 's' : ''} cargado{files.length > 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* File List */}
                <FileList
                    files={files}
                    onRemoveFile={removeFile}
                    onReorderFiles={reorderFiles}
                    showReorder={false}
                />

                {/* Rotate Processor */}
                {files.length > 0 && (
                    <RotateProcessor
                        files={files}
                        onRotateComplete={handleRotateComplete}
                        onRotateError={handleRotateError}
                    />
                )}

                {/* Help Text */}
                {files.length === 0 && (
                    <div className="mt-8 text-center max-w-md">
                        <h3 className="text-white font-semibold mb-3">¿Cómo rotar un PDF?</h3>
                        <div className="space-y-2 text-[#a6a7a9] text-sm">
                            <p>1. Selecciona o arrastra tu archivo PDF</p>
                            <p>2. Elige el ángulo de rotación (90°, 180°, 270°)</p>
                            <p>3. Selecciona qué páginas rotar</p>
                            <p>4. Personaliza el nombre del archivo final</p>
                            <p>5. Haz clic en "Rotar PDF"</p>
                            <p>6. Descarga tu PDF rotado</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

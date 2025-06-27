'use client';
import { useState } from "react";
import { useFileUpload } from "@/core/hooks/useUploadFile";
import SplitProcessor from "@/components/SplitProcessor";
import Navbar from "@/components/Navbar";

export default function DividirPDFPage() {
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
        clearAllFiles
    } = useFileUpload();

    // Get the first (and only) file since split works with single files
    const file = files.length > 0 ? files[0] : null;

    const handleSplitComplete = (result) => {
        setSuccessMessage('');
        setErrorMessage('');
        // Don't show the top success message anymore since SplitProcessor handles it
    };

    const handleSplitError = (error) => {
        setErrorMessage(error);
        setSuccessMessage('');
    };

    const clearMessages = () => {
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleRemoveFile = () => {
        if (file) {
            removeFile(file.id);
        }
        clearMessages();
    };

    return (
        <>
            <Navbar />

            <div className="w-full relative bg-[#020205] text-white font-inter px-4 py-4 flex flex-col items-center min-h-screen">
                <b className="titulo-tools text-3xl sm:text-4xl text-center mb-2">
                    Dividir archivos PDF
                </b>

                <p className="texto-tools text-base sm:text-lg text-[#a6a7a9] text-center max-w-xl mb-12">
                    Divide tu PDF en páginas individuales o por rangos específicos. ¡Rápido y fácil!
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
                {!file && (
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
                    </div>
                )}

                {/* File Display */}
                {file && (
                    <div className="w-full max-w-md mb-6">
                        <div className="bg-[#12172a] border border-[#161618] rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {/* PDF Icon */}
                                <div className="text-xs font-bold text-[#4b68ff] bg-[#4b68ff]/20 px-1.5 py-0.5 rounded flex-shrink-0 min-w-[35px] text-center">
                                    PDF
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate text-sm">
                                        {file.name}
                                    </p>
                                    <p className="text-[#a6a7a9] text-xs">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={handleRemoveFile}
                                className="ml-3 text-[#a6a7a9] hover:text-red-400 transition-colors flex-shrink-0"
                                title="Eliminar archivo"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Split Processor */}
                {file && (
                    <SplitProcessor
                        file={file}
                        onSplitComplete={handleSplitComplete}
                        onSplitError={handleSplitError}
                    />
                )}

                {/* Help Text */}
                {!file && (
                    <div className="mt-8 text-center max-w-md">
                        <h3 className="text-white font-semibold mb-3">¿Cómo dividir PDFs?</h3>
                        <div className="space-y-2 text-[#a6a7a9] text-sm">
                            <p>1. Selecciona o arrastra tu archivo PDF</p>
                            <p>2. Elige el modo de división que prefieras</p>
                            <p>3. Configura las opciones específicas</p>
                            <p>4. Haz clic en "Dividir PDF"</p>
                            <p>5. Descarga tu archivo dividido</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

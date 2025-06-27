'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFileUpload } from "@/core/hooks/useUploadFile";
import FileList from "@/components/FileList";
import ImagesToPDFProcessor from "@/components/ImagesToPDFProcessor";

export default function ImagesToPDFPage() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
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

    // Filter only image files
    const imageFiles = files.filter(file =>
        file.mimeType && file.mimeType.startsWith('image/')
    );

    const handleConversionComplete = (result) => {
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleConversionError = (error) => {
        setErrorMessage(error);
        setSuccessMessage('');
    };

    const clearMessages = () => {
        setSuccessMessage('');
        setErrorMessage('');
    };

    return (
        <>
            <div className="w-full relative bg-[#020205] text-white font-inter px-4 py-4 flex flex-col items-center min-h-screen">
                <b className="titulo-tools text-3xl sm:text-4xl text-center mb-2">
                    Convertir Imágenes a PDF
                </b>

                <p className="texto-tools text-base sm:text-lg text-[#a6a7a9] text-center max-w-xl mb-12">
                    Convierte múltiples imágenes (JPG, PNG, TIFF, WebP) en un solo documento PDF.
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
                            'Seleccionar Imágenes'
                        )}
                    </label>

                    <input
                        type="file"
                        id="fileInput"
                        multiple
                        accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                    />

                    <p className="text-[#a6a7a9] font-medium text-center">
                        o arrastra y suelta las imágenes aquí
                    </p>

                    <div className="text-center">
                        <p className="text-sm text-[#a6a7a9] mb-2">
                            Formatos soportados:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['JPG', 'PNG', 'TIFF', 'WebP'].map(format => (
                                <span key={format} className="text-xs bg-[#4b68ff]/20 text-[#4b68ff] px-2 py-1 rounded">
                                    {format}
                                </span>
                            ))}
                        </div>
                    </div>

                    {imageFiles.length > 0 && (
                        <p className="text-sm text-center text-white">
                            {imageFiles.length} imagen{imageFiles.length > 1 ? 'es' : ''} cargada{imageFiles.length > 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* File List */}
                <FileList
                    files={imageFiles}
                    onRemoveFile={removeFile}
                    onReorderFiles={reorderFiles}
                    showReorder={true}
                />

                {/* Images to PDF Processor */}
                {imageFiles.length > 0 && (
                    <ImagesToPDFProcessor
                        files={imageFiles}
                        onConversionComplete={handleConversionComplete}
                        onConversionError={handleConversionError}
                        onReorderFiles={reorderFiles}
                    />
                )}

                {/* Help Text */}
                {imageFiles.length === 0 && (
                    <div className="mt-8 text-center max-w-md">
                        <h3 className="text-white font-semibold mb-3">¿Cómo convertir imágenes a PDF?</h3>
                        <div className="space-y-2 text-[#a6a7a9] text-sm">
                            <p>1. Selecciona o arrastra tus imágenes</p>
                            <p>2. Reordena las imágenes si es necesario</p>
                            <p>3. Elige el tamaño de página y orientación</p>
                            <p>4. Personaliza el nombre del PDF</p>
                            <p>5. Haz clic en "Convertir" y descarga tu PDF</p>
                        </div>

                    </div>
                )}

                {/* NAVBAR RESPONSIVE */}
                <div className="fixed w-full h-[62px] z-[1000] flex items-center justify-between px-5 drop-shadow-md backdrop-blur border-b border-[#161618] text-white text-base font-inter bg-black top-0 left-0">
                    {/* Logo */}
                    <div className="text-lg font-inter text-white cursor-pointer" onClick={() => router.push('/')}>
                        FreePDF
                    </div>

                    {/* Botón hamburguesa visible solo en móvil */}
                    <div className="md:hidden">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">☰</button>
                    </div>

                    {/* Menú en desktop */}
                    <div className="hidden md:flex items-center gap-5">
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/tools/unir-pdf')}>Unir PDF</div>
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/tools/dividir-pdf')}>Dividir PDF</div>
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/tools/comprimir-pdf')}>Comprimir PDF</div>
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/tools/convertir')}>Convertir PDF</div>
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/')}>Todas las herramientas</div>
                    </div>

                    {/* Donar */}
                    <div className="hidden md:flex bg-[#4b68ff] rounded-[10px] px-5 py-2 cursor-pointer hover:bg-[#3c56d4] transition" onClick={() => router.push('/donar')}>
                        <div className="font-semibold text-white">Donar</div>
                    </div>
                </div>

                {/* Menú en móviles (condicional) */}
                {menuOpen && (
                    <div className="md:hidden absolute top-[62px] left-0 w-full bg-black flex flex-col items-center gap-4 py-4 z-[999]">
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => { router.push('/tools/unir-pdf'); setMenuOpen(false); }}>Unir PDF</div>
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => { router.push('/tools/dividir-pdf'); setMenuOpen(false); }}>Dividir PDF</div>
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => { router.push('/tools/comprimir-pdf'); setMenuOpen(false); }}>Comprimir PDF</div>
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => { router.push('/tools/convertir'); setMenuOpen(false); }}>Convertir PDF</div>
                        <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => { router.push('/'); setMenuOpen(false); }}>Todas las herramientas</div>
                        <div className="cursor-pointer text-[#4b68ff] font-semibold" onClick={() => { router.push('/donar'); setMenuOpen(false); }}>Donar</div>
                    </div>
                )}
            </div>
        </>
    );
}

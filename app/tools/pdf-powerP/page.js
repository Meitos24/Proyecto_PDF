'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFileUpload } from "@/core/hooks/useUploadFile";

export default function DropPage() {
    const router = useRouter();

    const [menuOpen, setMenuOpen] = useState(false);

    const {
        file,
        dragActive,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
    } = useFileUpload();

    return (
        <>
            <div className="w-full relative bg-[#020205] text-white font-inter px-4 py-20 flex flex-col items-center">
                <b className="titulo-tools text-3xl sm:text-4xl text-center mb-4">
                    PDF a PowerPoint
                </b>

                <p className="texto-tools text-base sm:text-lg text-[#a6a7a9] text-center max-w-xl mb-10">
                    Une PDF y ponlos en el orden que prefieras. ¡Rápido y fácil!
                </p>

                <div
                    className={`borde-archivos w-full max-w-md border-4 border-dashed rounded-2xl ${dragActive ? "bg-[#111] border-[#4b68ff]" : "bg-transparent border-white"
                        } p-10 flex flex-col items-center justify-center space-y-5 transition-all`}
                >
                    <label
                        htmlFor="fileInput"
                        className="largebutton bg-[#4b68ff] hover:bg-[#3b55d6] text-white font-semibold py-4 px-6 rounded cursor-pointer w-full text-center transition"
                    >
                        Seleccionar Archivo
                    </label>

                    <input
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <p className="text-[#a6a7a9] font-medium text-center">
                        o arrastra y suelta los PDF aquí
                    </p>

                    {file && (
                        <p className="text-sm text-center text-white">
                            Archivo cargado: {file.name}
                        </p>
                    )}
                </div>



                {/* NAVBAR RESPONSIVE */}
                <div className="fixed w-full h-[62px] z-[1000] flex items-center justify-between px-5 drop-shadow-md backdrop-blur border-b border-[#161618] text-white text-base font-inter bg-black">
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

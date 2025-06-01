'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { useDropzone } from "react-dropzone/.";

export default function DropPage() {

    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = e => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            console.log("Archivo seleccionado: ", selectedFile.name)
        }
    }

    const handleDrop = e => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            console.log("Archivo dropeado:", e.dataTransfer.files[0].name);
            // Aquí podrías procesarlo igual que con handleFileChange
        }
    }

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

    return (
        <>
            <div className={"droppdf"}>
                <b className={"unirArchivosPdf"}>Unir archivos PDF</b>
                <div className={"unePdfY"}>Une PDF y ponlos en el orden que prefieras. ¡Rápido y fácil!</div>
                <div
                    className={`drop ${dragActive ? "drag-active" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <label htmlFor="fileInput" className="largebutton">Seleccionar Archivo</label>
                    <input 
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        style={{ display: 'none' }} //Ocultar input
                    />
                    <div className={"oArrastraY"}>o arrastra y suelta los PDF aquí</div>
                </div>
                <div className={"navbar"}>
                    <b className={"freepdf"}>FreePDF</b>
                    <div className={"menu"}>
                        <div className={"unirPdf"}>Unir PDF</div>
                        <div className={"unirPdf"}>Dividir PDF</div>
                        <div className={"unirPdf"}>Comprimir PDF</div>
                        <div className={"unirPdf"}>Convertir PDF</div>
                        <div className={"unirPdf"} onClick={() => router.push('/')}>Todas las herramientas</div>
                    </div>
                    <div className={"donarParent"}>
                        <div className={"seleccionarArchivosPdf"}>Donar</div>
                    </div>
                </div>
                <div className={"footer"}>
                    <div className={"freepdfHechoContainer"}>
                        <span>
                            <b>@2025 FreePDF</b>
                        </span>
                        <span className={"hechoConPorGenteDeInte"}>
                            <span>{` — Hecho con `}</span>
                            <span className={"span"}>💙</span>
                            <span className={"porGenteDe"}>{`️ por gente de internet `}</span>
                        </span>
                    </div>
                </div>
            </div>;
        </>
    )
}
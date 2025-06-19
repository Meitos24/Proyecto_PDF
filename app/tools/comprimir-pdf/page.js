'use client';
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/core/hooks/useUploadFile";

export default function DropPage() {
    const router = useRouter();
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
            <div className={"droppdf"}>
                <b className={"unirArchivosPdf"}>Comprimir archivos PDF</b>
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
                        style={{ display: 'none' }}
                    />
                    <div className={"oArrastraY"}>o arrastra y suelta los PDF aquí</div>
                    {file && <p>Archivo cargado: {file.name}</p>}
                </div>

                <div className={"navbar"}>
                    <div className={"freepdf"} onClick={() => router.push('/')}>FreePDF</div>
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
                        <span><b>@2025 FreePDF</b></span>
                        <span className={"hechoConPorGenteDeInte"}>
                            <span>{` — Hecho con `}</span>
                            <span className={"span"}>💙</span>
                            <span className={"porGenteDe"}>{`️ por gente de internet `}</span>
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

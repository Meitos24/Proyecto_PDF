'use client';
import { useRouter } from "next/navigation";

export default function DropPage() {

    const router = useRouter();

    return (
        <>
            <div className={"droppdf"}>
                <b className={"unirArchivosPdf"}>PDF a Excel</b>
                <div className={"unePdfY"}>Convierte tus PDF a Excel y ponlos en el orden que prefieras.</div>
                <div className={"drop"}>
                    <div className={"largebuttonParent"}>
                        <div className={"largebutton"}>
                            <div className={"seleccionarArchivosPdf"}>Seleccionar archivos PDF</div>
                        </div>
                        <div className={"oArrastraY"}>o arrastra y suelta los PDF aquí</div>
                    </div>
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
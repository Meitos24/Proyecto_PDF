import Image from "next/image"

export default function Card({ titulo, descripcion }) {
    return (
        <div className="card">
            <Image src="/icono.svg" alt="image-icono" width="30" height="34"></Image>
            <div className="unirPDFParent">
                <div className="unirPDF">{titulo}</div>
                <div className="unirPDFTexto">{descripcion}</div>
            </div>
        </div>
    )
}
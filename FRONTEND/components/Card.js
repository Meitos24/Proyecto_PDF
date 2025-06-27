import Image from "next/image"
import Link from "next/link"

export default function Card({ titulo, descripcion, link }) {
    return (
        <Link href={`/tools/${link}`}>
            <div className="card">
                <Image src="/icono.svg" alt="image-icono" width="30" height="34"></Image>
                <div className="unirPDFParent">
                    <div className="unirPDF">{titulo}</div>
                    <div className="unirPDFTexto">{descripcion}</div>
                </div>
            </div>
        </Link>
    );
}
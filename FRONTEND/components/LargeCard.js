import Image from "next/image";
import Link from "next/link";

export default function LargeCard({ titulo, descripcion, link}) {
    return (
        <Link href={`/tools/${link}`}>
            <div className="largeCard">
                <Image src="/icono.svg" alt="image-icono" width={30} height={34} />
                <div className="unirPDFParent">
                    <div className="unirPDF">{titulo}</div>
                    <div className="unirPDFTexto">{descripcion}</div>
                </div>
            </div>
        </Link>
    );
}
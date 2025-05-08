import Image from "next/image";
import Link from "next/link";

export default function LargeCard({ titulo, descripcion }) {
    return (
        <Link href="/attachPDF/drop">
            <div className="largeCard" style={{ cursor: "pointer", textDecoration: 'none'}}>
                <Image src="/icono.svg" alt="image-icono" width={30} height={34} />
                <div className="unirPDFParent">
                    <div className="unirPDF">{titulo}</div>
                    <div className="unirPDFTexto">{descripcion}</div>
                </div>
            </div>
        </Link>
    );
}

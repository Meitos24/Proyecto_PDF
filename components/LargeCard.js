import Image from "next/image"
import Link from 'next/link'
 
export function Page() {
  return <Link href="/dashboard">Dashboard</Link>
}

export default function LargeCard({ titulo, descripcion }) {
    return (
        <div className="largeCard">
            <Image src="/icono.svg" alt="image-icono" width="30" height="34"></Image>
            <div className="unirPDFParent">
                <div className="unirPDF">Unir PDF</div>
                <div className="unirPDFTexto">Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!</div>
            </div>
        </div>
    )
}


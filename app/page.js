import Image from "next/image";

export default function Page() {
  return (
    <>
    <div className="navbar">
      <b className="styles.freepdf">FreePDF</b>
      <div className="menu">
        <div className="unirPDF">Unir PDF</div>
        <div className="unirPDF">Dividir PDF</div>
        <div className="unirPDF">Comprimir PDF</div>
        <div className="unirPDF">Convertir PDF</div>
        <div className="unirPDF">Todas las herramientas</div>
      </div>
      <div className="donarParent">
        <div className="donar">Donar</div>
      </div>
    </div>

      <div className="tituloPotenciaCreatividad">
        <b className="textoPotenciaCreatividad">Potencia tu productividad con FreePDFs</b>
      </div>

      <div className="subtitulo">
        <p className="subtituloTexto">
          Herramientas online y completamente gratuitas para unir PDF, separar PDF, comprimir PDF<br></br>
          convertir documentos Office a PDF, PDF a JPG y JPG  a PDF. No se necesita instalación.
        </p>
      </div>

      <div className="seccionBotones">
        <button>Ayúdanos a mantener el proyecto</button>
        <button>Explora todas las herramientas</button>
      </div>
    </>
  );
}
import LargeCard from "@/components/LargeCard";
import Card from "@/components/Card";


export default function Page() {

  const cardArrays = [
    {
      titulo: 'Unir PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'Dividir PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'Comprimir PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'PDF a Word',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'PDF a PowerPoint',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'PDF a Excel',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'Word a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'PowerPoint a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'Excel a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'Editar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'PDF a JPG',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'JPG a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    },
    {
      titulo: 'PDF a Excel',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!'
    }

  ]

  return (
    <>
      <div className="navbar">
        <b className="styles.freepdf">FreePDF</b>
        <div className="menu">
          <div className="unirPdf">Unir PDF</div>
          <div className="unirPdf">Dividir PDF</div>
          <div className="unirPdf">Comprimir PDF</div>
          <div className="unirPdf">Convertir PDF</div>
          <div className="unirPdf">Todas las herramientas</div>
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
        <button className="btn btn-azul">Ayúdanos a mantener el proyecto</button>
        <button className="btn btn-blanco">Explora todas las herramientas</button>
      </div>

      <div className="tituloPDFPopular">
        <b className="textoPDFPopular">Herramientas PDF más populares</b>
      </div>

      <div className="subtituloPDFPopular">
        <p className="subtituloTextoPDFPopular">
          21 herramientas para convertir, comprimir y editar archivos PDF dfe forma gratuita.<br></br>
          ¡Pruébalo hoy mismo!
        </p>
      </div>

      <div className="cardSectionWrapper">
        <div className="cardSection">
          <LargeCard titulo="Carta 1" descripcion="Prueba 1"></LargeCard>
          <LargeCard titulo="Carta 1" descripcion="Prueba 1"></LargeCard>
          <LargeCard titulo="Carta 1" descripcion="Prueba 1"></LargeCard>
          <LargeCard titulo="Carta 1" descripcion="Prueba 1"></LargeCard>
          <LargeCard titulo="Carta 1" descripcion="Prueba 1"></LargeCard>
          <LargeCard titulo="Carta 1" descripcion="Prueba 1"></LargeCard>
        </div>
      </div>

      <div className="sobreNosotros">
        <b className="textoProyeUni">Un Proyecto Universitario para Todos</b>
        <div className="frameParent">
          <div className="quienesSomosParent">
            <b className="textoProyeUni">¿Quiénes somos?</b>
            <div className="subtextQuienesSomos">
              <span>{'Un equipo de estudiantes comprometidos con la tecnología, ofreciendo '}</span>
              <b className="textoNegritas">herramientas gratuitas y completas </b>
              <span>para que todos puedan trabajar con sus PDFs de manera eficiente.</span>
            </div>
          </div>

          <div className="quienesSomosParent">
            <b className="textoProyeUni">¿Cuál es nuestra misión?</b>
            <div className="subtextQuienesSomos">
              <span>{'Crear una plataforma que permita '}</span>
              <b className="textoNegritas">convertir, editar y organizar PDFs sin costo alguno </b>
              <span>brindando acceso a funcionalidades avanzadas de forma fácil y accesible para todos.</span>
            </div>
          </div>

          <div className="quienesSomosParent">
            <b className="textoProyeUni">Nuestro equipo</b>
            <div className="subtextQuienesSomos">
              <p className="textoEquipo">
                Este proyecto es llevado a cabo por:<br></br>
                @insta1, @insta2, @insta3, @insta4, @insta5<br></br>
                Agradecemos profundamente al profesor:
                <b className="textoNegritas"> Gerardo Guzmán</b>
              </p>
            </div>
          </div>
        </div>

        <div className="textoAgradecimientos">
          <b className="subtextoAgradecimientos">¡Gracias por ser parte de este proyecto!</b>
          <div className="experienciaTexto">Tu experiencia con nosotros es lo más importante.</div>
        </div>
      </div>

      <div className="tituloPDFPopular">
        <div className="textoAllTools">Todas las herramientas de FreePDF</div>
      </div>

      <div className="subtituloPDFPopular">
        <p className="subtituloTextoPDFPopular">
          Usa nuestra colección de herramientas PDF para procesar documentos digitalesy facilitar<br></br>
          el flujo de trabajo sin problemas.
        </p>
      </div>

      <div className="cardSectionWrapper2">
        <div className="cardSection2">
          {
            cardArrays.map((card, index) => (
              <Card key={index} titulo={card.titulo} descripcion={card.descripcion} />
            ))
          }
        </div>
      </div>
    </>
  );
}
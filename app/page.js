'use client';

import LargeCard from "@/components/LargeCard";
import Card from "@/components/Card";
import Link from "next/link";

export default function Page() {

  const largeCardArrays = [
    {
      titulo: 'Unir PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!',
      link: 'unir-pdf'
    },
    {
      titulo: 'Dividir PDF',
      descripcion: 'Divide PDF y ponlos en el orden que prefieras. !Rápido y fácil!',
      link: 'dividir-pdf',
    },
    {
      titulo: 'Comprimir PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. !Rápido y fácil!',
      link: 'comprimir-pdf',
    },
    {
      titulo: 'PDF a Word',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'pdf-a-word',
    },
    {
      titulo: 'PDF a PowerPoint',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'pdf-a-powerpoint'
    },
    {
      titulo: 'PDF a Excel',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'pdf-a-excel'
    },
    {
      titulo: 'Word a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'word-a-pdf'
    },
    {
      titulo: 'PowerPoint a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'powerpoint-a-pdf'
    },
    {
      titulo: 'Excel a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'excel-a-pdf'
    },
    {
      titulo: 'Editar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'editar-pdf'
    },
    {
      titulo: 'PDF a JPG',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'pdf-a-jpg'
    },
    {
      titulo: 'JPG a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'jpg-a-pdf'
    },
    {
      titulo: 'Firmar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'firmar-pdf'
    },
    {
      titulo: 'Marca de Agua',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'marca-de-agua'
    },
    {
      titulo: 'Rotar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'rotas-pdf'
    },
    {
      titulo: 'HTML a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'html-a-pdf'
    },
    {
      titulo: 'Desbloquear PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras.',
      link: 'desbloquear-pdf'
    },
    {
      titulo: 'Proteger PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras.',
      link: 'proteger-pdf'
    },
    {
      titulo: 'Ordenar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras.',
      link: 'ordenar-pdf'
    },
  ]

  return (
    <>
     
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{
  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
  backdropFilter: 'blur(10px)',
  borderBottom: '2px solid #161618',
  zIndex: 1000
}}>
  <div className="container-fluid px-3">
    {/* Brand/Logo */}
    <a className="navbar-brand fw-bold" href="/" style={{color: '#fff', fontSize: '1.2rem'}}>
      FreePDF
    </a>

    {/* Toggle button para móvil */}
    <button 
      className="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarNav" 
      aria-controls="navbarNav" 
      aria-expanded="false" 
      aria-label="Toggle navigation"
      style={{borderColor: '#7188ff', color: '#fff'}}
    >
      <span className="navbar-toggler-icon"></span>
    </button>

    {/* Menu colapsible */}
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <a className="nav-link text-white hover-effect" href="/tools/unir-pdf">
            Unir PDF
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white hover-effect" href="/tools/dividir-pdf">
            Dividir PDF
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white hover-effect" href="/tools/comprimir">
            Comprimir PDF
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white hover-effect" href="/tools/convertir">
            Convertir PDF
          </a>
        </li>
        <li className="nav-item dropdown">
          <a 
            className="nav-link dropdown-toggle text-white hover-effect" 
            href="#" 
            id="navbarDropdown" 
            role="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            Todas las herramientas
          </a>
          <ul className="dropdown-menu dropdown-menu-dark" style={{backgroundColor: 'rgba(0,0,0,0.9)'}}>
            <li><a className="dropdown-item" href="/tools/unir-pdf">Unir PDF</a></li>
            <li><a className="dropdown-item" href="/tools/dividir-pdf">Dividir PDF</a></li>
            <li><a className="dropdown-item" href="/tools/comprimir">Comprimir PDF</a></li>
            <li><a className="dropdown-item" href="/tools/convertir">Convertir PDF</a></li>
          </ul>
        </li>
      </ul>
      
      {/* Botón Donar */}
      <div className="d-flex">
        <a 
          className="btn btn-primary rounded-pill px-4" 
          href="/donar"
          style={{
            backgroundColor: '#4c6ef5',
            borderColor: '#4c6ef5',
            fontWeight: '600'
          }}
        >
          Donar
        </a>
      </div>
    </div>
  </div>
</nav>

      {/* <nav className="navbar fixed-top d-flex flex-row align-items-center justify-content-between px-3">
        <b className="freepdf">FreePDF</b>
        <div className="menu">
          <Link href="/tools/unir-pdf" className="unirPdf">Unir PDF</Link>
          <Link href="/tools/dividir-pdf" className="unirPdf">Dividir PDF</Link>
          <Link href="/tools/comprimir" className="unirPdf">Comprimir PDF</Link>
          <Link href="/tools/convertir" className="unirPdf">Convertir PDF</Link>
          <Link href="/" className="unirPdf">Todas las herramientas</Link>
        </div>
        <div className="donarParent">
          <Link href="/donar" className="donar">Donar</Link>
        </div>
      </nav> */}

       <main className="main">
        <div className="tituloPotenciaCreatividad">
          <b className="textoPotenciaCreatividad">Potencía tu productividad con FreePDFs</b>
        </div>

        <div className="subtitulo">
          <p className="subtituloTexto">
            <br></br><br></br>Herramientas online y completamente gratuitas para unir PDF, separar PDF, comprimir PDF<br></br>
            convertir documentos Office a PDF, PDF a JPG y JPG  a PDF. No se necesita instalación.
          </p>
        </div>

        <div className="seccionBotones">
          <button className="btn btn-azul">Ayúdanos a mantener el proyecto</button>
          <button
            className="btn btn-blanco"
            onClick={() => {
              const destino = document.getElementById('allTools');
              if (destino) destino.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explora todas las herramientas</button>
        </div>

        <div className="tituloPDFPopular">
          <b className="textoPDFPopular">Herramientas PDF más populares</b>
        </div>

        <div className="subtituloPDFPopular">
          <p className="subtituloTextoPDFPopular">
            21 herramientas para convertir, comprimir y editar archivos PDF de forma gratuita.<br></br>
            ¡Pruébalo hoy mismo!
          </p>
        </div>

        <div className="cardSectionWrapper">
          <div className="cardSection">
            {largeCardArrays.slice(0, 6).map((card, index) => (
              <LargeCard
                key={index}
                titulo={card.titulo}
                descripcion={card.descripcion}
                link={card.link}
              />
            ))}
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
          <div className="textoAllTools" id="allTools">Todas las herramientas de FreePDF</div>
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
              largeCardArrays.map((card, index) => (
                <Card key={index} titulo={card.titulo} descripcion={card.descripcion} />
              ))
            }
          </div>
        </div>
      </main> */
    </>
  );
}
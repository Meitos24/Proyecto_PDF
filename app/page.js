'use client';
import { useState } from "react";

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
      link: 'pdf-word',
    },
    {
      titulo: 'PDF a PowerPoint',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'pdf-powerP'
    },
    {
      titulo: 'PDF a Excel',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'pdf-Excel'
    },
    {
      titulo: 'Word a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'Word-pdf'
    },
    {
      titulo: 'PowerPoint a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'powerP-pdf'
    },
    {
      titulo: 'Excel a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'Excel-pdf'
    },
    {
      titulo: 'Editar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'Editar-pdf'
    },
    {
      titulo: 'PDF a JPG',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'pdf-jpg'
    },
    {
      titulo: 'JPG a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'jpg-pdf'
    },
    {
      titulo: 'Firmar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'pdf-firma'
    },
    {
      titulo: 'Marca de Agua',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'marcaAgua-pdf'
    },
    {
      titulo: 'Rotar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'rotar-pdf'
    },
    {
      titulo: 'HTML a PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras. ',
      link: 'Html-pdf'
    },
    {
      titulo: 'Desbloquear PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras.',
      link: 'Desbloquear-pdf'
    },
    {
      titulo: 'Proteger PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras.',
      link: 'Protege-pdf'
    },
    {
      titulo: 'Ordenar PDF',
      descripcion: 'Une PDF y ponlos en el orden que prefieras.',
      link: 'Orden-pdf'
    },
  ]

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed w-full h-[62px] z-[1000] flex items-center justify-between px-5 drop-shadow-md backdrop-blur border-b border-[#161618] text-white text-base font-inter bg-black">
        {/* <b className="text-xl cursor-pointer translate-y-[20px]">FreePDF</b> */}
        <b className="text-xl cursor-pointer pt-1">FreePDF</b>

        {/* Botón hamburguesa en móvil */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>

        {/* Menú en desktop */}
        <div className="hidden md:flex items-center justify-center gap-5 text-center">
          <Link href="/tools/unir-pdf">Unir PDF</Link>
          <Link href="/tools/dividir-pdf">Dividir PDF</Link>
          <Link href="/tools/comprimir-pdf">Comprimir PDF</Link>
          <Link href="/tools/convertir">Convertir PDF</Link>
          <Link href="/">Todas las herramientas</Link>
        </div>

        {/* Donar */}
        <div className="hidden md:block">
          <Link href="/donar">Donar</Link>
        </div>

        {/* Menú móvil (condicional) */}
        {menuOpen && (
          <div className="absolute top-[62px] left-0 w-full bg-black flex flex-col items-center gap-4 py-4 md:hidden">
            <Link href="/tools/unir-pdf" onClick={() => setMenuOpen(false)}>Unir PDF</Link>
            <Link href="/tools/dividir-pdf" onClick={() => setMenuOpen(false)}>Dividir PDF</Link>
            <Link href="/tools/comprimir-pdf" onClick={() => setMenuOpen(false)}>Comprimir PDF</Link>
            <Link href="/tools/convertir" onClick={() => setMenuOpen(false)}>Convertir PDF</Link>
            <Link href="/" onClick={() => setMenuOpen(false)}>Todas las herramientas</Link>
            <Link href="/donar" onClick={() => setMenuOpen(false)}>Donar</Link>
          </div>
        )}
      </nav>

      <main className="flex flex-col px-4 sm:px-6 md:px-8 mt-[62px">
        {/* Título principal */}
        <div className="flex justify-center items-center py-10">
          <b className="tituloPDFPopular text-white font-inter text-2xl sm:text-3xl md:text-4xl text-center sm:text-left max-w-full sm:max-w-[600px] md:max-w-[784px] inline-block">
            Potencia tu productividad con FreePDFs
          </b>
        </div>

        {/* Subtítulo */}
        <div className="flex justify-center items-center h-[100px]">
          <p className="text-[#a6a7a9] font-inter text-sm sm:text-base text-center max-w-full sm:max-w-[600px] md:max-w-[776px] mt-[-10px] inline-block px-2">
            Herramientas online y completamente gratuitas para unir PDF, separar PDF, comprimir PDF<br />
            convertir documentos Office a PDF, PDF a JPG y JPG a PDF. No se necesita instalación.
          </p>
        </div>

        {/* Botones */}
        {/* Contenedor centrado */}
        <div className="flex justify-center"> 
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button className="btn btn-azul w-full sm:w-auto">
              Ayúdanos a mantener el proyecto
            </button>
            <button
              className="btn btn-blanco w-full sm:w-auto"
              onClick={() => {
                const destino = document.getElementById('allTools');
                if (destino) destino.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explora todas las herramientas
            </button>
          </div>
        </div>

      </main>



      {/* <main className="flex flex-col"> */}
        {/* Título Principal */}
        {/* <div className="flex justify-center items-center h-[100px pt-[120px">
          <b className="text-[40px] text-white text-left font-inter w-[784px] inline-block">
            Potencia tu productividad con FreePDFs
          </b>
        </div> */}

        {/* Subtítulo */}
        {/* <div className="flex justify-center items-center h-[100px]">
          <p className="w-[776px] text-[18px] text-[#a6a7a9] text-center font-inter mt-[-10px] inline-block">
            Herramientas online y completamente gratuitas para unir PDF, separar PDF, comprimir PDF<br></br>
            convertir documentos Office a PDF, PDF a JPG y JPG  a PDF. No se necesita instalación.
          </p>
        </div> */}

        {/* Botones */}
        {/* <div className="flex justify-center gap-5 mb-[60px]">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all">
            Ayúdanos a mantener el proyecto
          </button>
          <button
            className="px-4 py-2 bg-white text-black border border-gray-300 rounded hover:bg-gray-100 transition-all"
            onClick={() => {
              const destino = document.getElementById('allTools');
              if (destino) destino.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explora todas las herramientas</button>
        </div> */}

        {/* <div className="tituloPDFPopular">
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
                <Card
                  key={index}
                  titulo={card.titulo}
                  descripcion={card.descripcion} 
                  link={card.link}
                  />
              ))
            }
          </div>
        </div> */}
      {/* </main> */}
    </>
  );
} 


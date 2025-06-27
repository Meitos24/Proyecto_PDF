'use client';
import { useState } from "react";
import LargeCard from "@/components/LargeCard";
import Card from "@/components/Card";
import Navbar from "@/components/Navbar";

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

  const goToAllTools = (e) => {
    e.preventDefault();
    const destino = document.getElementById('allTools');
    if (destino) destino.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <Navbar />

      <main className="flex flex-col px-4 sm:px-6 md:px-8 mt-20">
        {/* Título principal */}
        <div className="flex justify-center items-center mt-2 mb-2 px-4">
          <h1 className="text-white font-inter text-xl sm:text-3xl md:text-4xl lg:text-5xl text-center max-w-screen-md leading-snug">
            Potencia tu productividad con FreePDFs
          </h1>
        </div>

        {/* Subtítulo */}
        <div className="flex justify-center mb-4">
          <p className="subtitulo-main text-[#a6a7a9] font-inter text-sm sm:text-base text-center max-w-full sm:max-w-[600px] md:max-w-[776px] px-2">
            Herramientas online y completamente gratuitas para unir PDF, separar PDF, comprimir PDF<br />
            convertir documentos Office a PDF, PDF a JPG y JPG a PDF. No se necesita instalación.
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-center">
          <div className="container-btn flex flex-col sm:flex-row justify-center gap-4 mb-2">
            <button className="btn btn-azul w-full sm:w-auto">
              Ayúdanos a mantener el proyecto
            </button>
            <button
              className="btn btn-blanco w-full sm:w-auto"
              onClick={goToAllTools}
            >
              Explora todas las herramientas
            </button>
          </div>
        </div>

        {/* Título de sección de tarjetas */}
        <div className="flex justify-center">
          <b className="titulo-main-cards text-white text-2xl sm:text-3xl md:text-4xl font-inter text-center mt-4">
            Herramientas PDF más populares
          </b>
        </div>

        {/* Subtítulo */}
        <div className="flex justify-center mt-4 mb-8">
          <p className="titulo-large-card text-[#a6a7a9] text-sm sm:text-base text-center font-inter max-w-[600px]">
            21 herramientas para convertir, comprimir y editar archivos PDF de forma gratuita.<br />
            ¡Pruébalo hoy mismo!
          </p>
        </div>

        {/* Grid de tarjetas centrado y con ancho del 60% en móviles */}
        <div className="largecard-container flex justify-center px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-[80%] sm:w-full max-w-[1000px]">
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

        <section className="borde-prueba w-full relative backdrop-blur bg-black box-border flex flex-col items-center justify-start px-6 py-10 gap-[120px] text-white font-inter border-t border-[#161618] mt-[60px]">
          {/* Título principal */}
          <b className="titulo-despues-card text-[30px] text-center">Un Proyecto Universitario para Todos</b>

          {/* Contenedor de columnas */}
          <div className="prueba-2 flex flex-col md:flex-row justify-center items-start gap-5 w-full max-w-[1200px]">
            {/* ¿Quiénes somos? */}
            <div className="flex flex-col items-center justify-center gap-[15px] w-full md:w-[370px]">
              <b className="text-[30px] text-center">¿Quiénes somos?</b>
              <div className="text-[#a6a7a9] text-sm text-center max-w-[374px]">
                Un equipo de estudiantes comprometidos con la tecnología, ofreciendo{' '}
                <b className="text-white font-medium">herramientas gratuitas y completas </b>
                para que todos puedan trabajar con sus PDFs de manera eficiente.
              </div>
            </div>

            {/* ¿Cuál es nuestra misión? */}
            <div className="flex flex-col items-center justify-center gap-[15px] w-full md:w-[370px]">
              <b className="text-[30px] text-center">¿Cuál es nuestra misión?</b>
              <div className="text-[#a6a7a9] text-sm text-center max-w-[374px]">
                Crear una plataforma que permita{' '}
                <b className="text-white font-medium">convertir, editar y organizar PDFs sin costo alguno </b>
                brindando acceso a funcionalidades avanzadas de forma fácil y accesible para todos.
              </div>
            </div>

            {/* Nuestro equipo */}
            <div className="flex flex-col items-center justify-center gap-[15px] w-full md:w-[370px]">
              <b className="text-[30px] text-center">Nuestro equipo</b>
              <div className="text-[#a6a7a9] text-sm text-center max-w-[374px]">
                <p>
                  Este proyecto es llevado a cabo por:<br />
                  @insta1, @insta2, @insta3, @insta4, @insta5<br />
                  Agradecemos profundamente al profesor:
                  <b className="text-white font-medium"> Gerardo Guzmán</b>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Agradecimiento */}
        <div className="texto-equipo flex flex-col items-center justify-start gap-2 text-center text-[20px] font-inter mt-16">
          <b className="text-white text-[20px]">¡Gracias por ser parte de este proyecto!</b>
          <div className="text-[#a6a7a9] text-sm">
            Tu experiencia con nosotros es lo más importante.
          </div>
        </div>

        {/* Título de herramientas */}
        <div className="texto-all-tools flex justify-center mt-16">
          <div id="allTools" className="text-white text-[36px] text-center sm:text-left font-inter max-w-[620px] w-full">
            Todas las herramientas de FreePDF
          </div>
        </div>

        {/* Subtítulo */}
        <div className="flex justify-center items-center mt-4 mb-6 px-4">
          <p className="text-[#a6a7a9] text-base text-center font-inter max-w-[776px]">
            Usa nuestra colección de herramientas PDF para procesar documentos digitales y facilitar<br />
            el flujo de trabajo sin problemas.
          </p>
        </div>

        {/* Grid de tarjetas */}
        <div className="tarjetas-largas-container flex justify-center px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-[1200px] p-5 justify-items-center">
            {largeCardArrays.map((card, index) => (
              <Card
                key={index}
                titulo={card.titulo}
                descripcion={card.descripcion}
                link={card.link}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

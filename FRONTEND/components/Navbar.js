'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* NAVBAR RESPONSIVE */}
      <div className="fixed w-full h-[62px] z-[1000] flex items-center justify-between px-5 drop-shadow-md backdrop-blur border-b border-[#161618] text-white text-base font-inter bg-black top-0 left-0">
        {/* Logo */}
        <div className="text-lg font-inter text-white cursor-pointer" onClick={() => router.push('/')}>
          FreePDF
        </div>

        {/* Botón hamburguesa visible solo en móvil */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">☰</button>
        </div>

        {/* Menú en desktop */}
        <div className="hidden md:flex items-center gap-5">
          <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/tools/unir-pdf')}>Unir PDF</div>
          <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/tools/dividir-pdf')}>Dividir PDF</div>
          <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/tools/comprimir-pdf')}>Comprimir PDF</div>
          <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/tools/convertir')}>Convertir PDF</div>
          <div className="cursor-pointer hover:text-[#4b68ff]" onClick={() => router.push('/')}>Todas las herramientas</div>
        </div>

        {/* Donar with Heart Icon */}
        <div className="hidden md:flex bg-[#4b68ff] rounded-[10px] px-5 py-2 cursor-pointer hover:bg-[#3c56d4] transition items-center gap-2" onClick={() => router.push('/donar')}>
          <div className="font-semibold text-white">Donar</div>
          {/* Heart Icon */}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>

      {/* Menú en móviles (condicional) */}
      {menuOpen && (
        <div className="md:hidden fixed top-[4rem] left-0 w-full bg-black border-t border-[#161618] flex flex-col items-center gap-4 py-4 z-[999]">
          <div className="cursor-pointer text-white" onClick={() => { router.push('/tools/unir-pdf'); setMenuOpen(false); }}>Unir PDF</div>
          <div className="cursor-pointer text-white" onClick={() => { router.push('/tools/dividir-pdf'); setMenuOpen(false); }}>Dividir PDF</div>
          <div className="cursor-pointer text-white" onClick={() => { router.push('/tools/comprimir-pdf'); setMenuOpen(false); }}>Comprimir PDF</div>
          <div className="cursor-pointer text-white" onClick={() => { router.push('/tools/convertir'); setMenuOpen(false); }}>Convertir PDF</div>
          <div className="cursor-pointer text-white" onClick={() => { router.push('/'); setMenuOpen(false); }}>Todas las herramientas</div>
          {/* Mobile Donar with Heart */}
          <div className="cursor-pointer text-[#4b68ff] font-semibold flex items-center gap-2" onClick={() => { router.push('/donar'); setMenuOpen(false); }}>
            <span>Donar</span>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}

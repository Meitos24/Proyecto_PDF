'use client';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007/api';

export default function ImagesToPDFProcessor({ files, onConversionComplete, onConversionError, onReorderFiles }) {
  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [settings, setSettings] = useState({
    output_filename: 'imagenes_a_pdf.pdf',
    page_size: 'A4',
    orientation: 'portrait'
  });

  const pageSizeOptions = [
    { value: 'A4', label: 'A4 (21 x 29.7 cm)' },
    { value: 'A3', label: 'A3 (29.7 x 42 cm)' },
    { value: 'A5', label: 'A5 (14.8 x 21 cm)' },
    { value: 'Letter', label: 'Carta (21.6 x 27.9 cm)' },
    { value: 'Legal', label: 'Legal (21.6 x 35.6 cm)' }
  ];

  const orientationOptions = [
    { value: 'portrait', label: 'Vertical (Portrait)' },
    { value: 'landscape', label: 'Horizontal (Landscape)' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      onConversionError('No hay imágenes seleccionadas');
      return;
    }

    setConverting(true);
    setConversionResult(null);

    try {
      const requestData = {
        file_ids: files.map(file => file.id),
        output_filename: settings.output_filename,
        page_size: settings.page_size,
        orientation: settings.orientation
      };

      const response = await fetch(`${API_BASE_URL}/pdf/convert/images-to-pdf/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al convertir imágenes');
      }

      setConversionResult(data);
      onConversionComplete(data);

    } catch (error) {
      console.error('Error converting images:', error);
      onConversionError(error.message);
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (conversionResult?.operation?.download_url) {
      const link = document.createElement('a');
      link.href = conversionResult.operation.download_url;
      link.download = settings.output_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canConvert = files.length > 0 && !converting;

  return (
    <div className="w-full max-w-md mt-6">
      {/* Output Filename */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Nombre del archivo PDF:
        </label>
        <input
          type="text"
          value={settings.output_filename}
          onChange={(e) => handleSettingChange('output_filename', e.target.value)}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-4 text-white placeholder-[#a6a7a9] focus:border-[#4b68ff] focus:outline-none transition-colors text-base"
          placeholder="mi_documento.pdf"
          disabled={converting}
        />
        <p className="text-[#a6a7a9] text-xs mt-2">
          Se añadirá automáticamente la extensión .pdf si no la tiene
        </p>
      </div>

      {/* Page Size */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Tamaño de página:
        </label>
        <select
          value={settings.page_size}
          onChange={(e) => handleSettingChange('page_size', e.target.value)}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-4 text-white focus:border-[#4b68ff] focus:outline-none transition-colors text-base"
          disabled={converting}
        >
          {pageSizeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orientation */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Orientación:
        </label>
        <select
          value={settings.orientation}
          onChange={(e) => handleSettingChange('orientation', e.target.value)}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-4 text-white focus:border-[#4b68ff] focus:outline-none transition-colors text-base"
          disabled={converting}
        >
          {orientationOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!canConvert}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all
          ${canConvert
            ? 'bg-[#4b68ff] hover:bg-[#3b55d6] cursor-pointer'
            : 'bg-[#2a2a2a] cursor-not-allowed opacity-50'
          }
        `}
      >
        {converting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Convirtiendo a PDF...</span>
          </div>
        ) : (
          `Convertir ${files.length} imagen${files.length > 1 ? 'es' : ''} a PDF`
        )}
      </button>

      {/* Requirements Message */}
      {files.length === 0 && (
        <p className="text-[#a6a7a9] text-sm mt-4 text-center">
          Sube al menos una imagen para crear el PDF
        </p>
      )}

      {/* Success Result */}
      {conversionResult && conversionResult.success && (
        <div className="mt-8 bg-[#1e3a8a]/30 border border-[#3b82f6]/50 rounded-lg p-5">
          <h4 className="text-[#3b82f6] font-semibold mb-4">PDF creado exitosamente</h4>
          <p className="text-white text-sm mb-4">
            {files.length} imagen{files.length > 1 ? 'es' : ''} convertida{files.length > 1 ? 's' : ''} a PDF
          </p>

          <button
            onClick={handleDownload}
            className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Descargar PDF</span>
          </button>
        </div>
      )}

      {/* Info about order */}
      {files.length > 1 && (
        <div className="mt-6 p-4 bg-[#12172a] rounded-lg border border-[#161618]">
          <p className="text-[#a6a7a9] text-sm text-center">
            Las imágenes se añadirán al PDF en el orden mostrado arriba.
            Puedes arrastrar los archivos para cambiar el orden.
          </p>
        </div>
      )}
    </div>
  );
}

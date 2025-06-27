'use client';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007/api';

export default function PDFToImagesProcessor({ file, onConversionComplete, onConversionError }) {
  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [settings, setSettings] = useState({
    output_format: 'PNG',
    quality: 95,
    dpi: 150,
    output_filename: '',
    start_page: '',
    end_page: '',
    convert_all_pages: true
  });

  const formatOptions = [
    { value: 'PNG', label: 'PNG (Mejor calidad)' },
    { value: 'JPEG', label: 'JPEG (Menor tamaño)' },
    { value: 'WEBP', label: 'WebP (Moderno)' },
    { value: 'TIFF', label: 'TIFF (Profesional)' }
  ];

  const dpiOptions = [
    { value: 72, label: '72 DPI (Web)' },
    { value: 150, label: '150 DPI (Estándar)' },
    { value: 200, label: '200 DPI (Alta calidad)' },
    { value: 300, label: '300 DPI (Impresión)' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePageRangeToggle = (convertAll) => {
    setSettings(prev => ({
      ...prev,
      convert_all_pages: convertAll,
      start_page: convertAll ? '' : prev.start_page,
      end_page: convertAll ? '' : prev.end_page
    }));
  };

  const handleConvert = async () => {
    if (!file) {
      onConversionError('No hay archivo seleccionado');
      return;
    }

    setConverting(true);
    setConversionResult(null);

    try {
      const requestData = {
        file_id: file.id,
        output_format: settings.output_format,
        quality: settings.quality,
        dpi: settings.dpi
      };

      // Add filename if provided
      if (settings.output_filename.trim()) {
        requestData.output_filename = settings.output_filename.trim();
      }

      // Add page range if not converting all pages
      if (!settings.convert_all_pages && settings.start_page && settings.end_page) {
        requestData.start_page = parseInt(settings.start_page);
        requestData.end_page = parseInt(settings.end_page);
      }

      const response = await fetch(`${API_BASE_URL}/pdf/convert/pdf-to-images/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al convertir PDF');
      }

      setConversionResult(data);
      onConversionComplete(data);

    } catch (error) {
      console.error('Error converting PDF:', error);
      onConversionError(error.message);
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (conversionResult?.operation?.download_url) {
      const link = document.createElement('a');
      link.href = conversionResult.operation.download_url;
      link.download = settings.output_filename || 'imagenes.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canConvert = file && !converting;
  const isPageRangeValid = settings.convert_all_pages ||
    (settings.start_page && settings.end_page &&
      parseInt(settings.start_page) <= parseInt(settings.end_page));

  return (
    <div className="w-full max-w-md mt-6">
      {/* Output Format */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Formato de imagen:
        </label>
        <select
          value={settings.output_format}
          onChange={(e) => handleSettingChange('output_format', e.target.value)}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-4 text-white focus:border-[#4b68ff] focus:outline-none transition-colors text-base"
          disabled={converting}
        >
          {formatOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quality (for JPEG/WEBP) */}
      {(settings.output_format === 'JPEG' || settings.output_format === 'WEBP') && (
        <div className="mb-6">
          <label className="block text-white font-medium text-sm mb-3">
            Calidad: {settings.quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={settings.quality}
            onChange={(e) => handleSettingChange('quality', parseInt(e.target.value))}
            className="w-full h-2 bg-[#12172a] rounded-lg appearance-none cursor-pointer slider"
            disabled={converting}
          />
          <div className="flex justify-between text-xs text-[#a6a7a9] mt-1">
            <span>Menor tamaño</span>
            <span>Mejor calidad</span>
          </div>
        </div>
      )}

      {/* DPI */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Resolución:
        </label>
        <select
          value={settings.dpi}
          onChange={(e) => handleSettingChange('dpi', parseInt(e.target.value))}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-4 text-white focus:border-[#4b68ff] focus:outline-none transition-colors text-base"
          disabled={converting}
        >
          {dpiOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Page Range */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Páginas a convertir:
        </label>

        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="pageRange"
              checked={settings.convert_all_pages}
              onChange={() => handlePageRangeToggle(true)}
              className="mr-3 text-[#4b68ff]"
              disabled={converting}
            />
            <span className="text-white">Todas las páginas</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="pageRange"
              checked={!settings.convert_all_pages}
              onChange={() => handlePageRangeToggle(false)}
              className="mr-3 text-[#4b68ff]"
              disabled={converting}
            />
            <span className="text-white">Rango específico</span>
          </label>
        </div>

        {!settings.convert_all_pages && (
          <div className="mt-3 flex space-x-3">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Desde"
                min="1"
                value={settings.start_page}
                onChange={(e) => handleSettingChange('start_page', e.target.value)}
                className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-3 py-2 text-white placeholder-[#a6a7a9] focus:border-[#4b68ff] focus:outline-none transition-colors text-sm"
                disabled={converting}
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Hasta"
                min="1"
                value={settings.end_page}
                onChange={(e) => handleSettingChange('end_page', e.target.value)}
                className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-3 py-2 text-white placeholder-[#a6a7a9] focus:border-[#4b68ff] focus:outline-none transition-colors text-sm"
                disabled={converting}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filename */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Nombre del archivo ZIP (opcional):
        </label>
        <input
          type="text"
          value={settings.output_filename}
          onChange={(e) => handleSettingChange('output_filename', e.target.value)}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-4 text-white placeholder-[#a6a7a9] focus:border-[#4b68ff] focus:outline-none transition-colors text-base"
          placeholder="mis_imagenes.zip"
          disabled={converting}
        />
        <p className="text-[#a6a7a9] text-xs mt-2">
          Se añadirá automáticamente la extensión .zip si no la tiene
        </p>
      </div>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!canConvert || !isPageRangeValid}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all
          ${canConvert && isPageRangeValid
            ? 'bg-[#4b68ff] hover:bg-[#3b55d6] cursor-pointer'
            : 'bg-[#2a2a2a] cursor-not-allowed opacity-50'
          }
        `}
      >
        {converting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Convirtiendo PDF...</span>
          </div>
        ) : (
          `Convertir a ${settings.output_format}`
        )}
      </button>

      {/* Requirements Message */}
      {!file && (
        <p className="text-[#a6a7a9] text-sm mt-4 text-center">
          Sube un archivo PDF para comenzar la conversión
        </p>
      )}

      {/* Page Range Error */}
      {!isPageRangeValid && !settings.convert_all_pages && (
        <p className="text-red-400 text-sm mt-4 text-center">
          El rango de páginas no es válido
        </p>
      )}

      {/* Success Result */}
      {conversionResult && conversionResult.success && (
        <div className="mt-8 bg-[#1e3a8a]/30 border border-[#3b82f6]/50 rounded-lg p-5">
          <h4 className="text-[#3b82f6] font-semibold mb-4">Conversión exitosa</h4>
          <p className="text-white text-sm mb-4">
            PDF convertido a imágenes {settings.output_format}
          </p>

          <button
            onClick={handleDownload}
            className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Descargar Imágenes ZIP</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4b68ff;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4b68ff;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

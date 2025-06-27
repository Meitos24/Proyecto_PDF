'use client';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007/api';

export default function RotateProcessor({ files, onRotateComplete, onRotateError }) {
  const [rotating, setRotating] = useState(false);
  const [rotateResult, setRotateResult] = useState(null);
  const [outputFilename, setOutputFilename] = useState('documento_rotado.pdf');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [selectedPages, setSelectedPages] = useState('all');
  const [pageInput, setPageInput] = useState('');

  const rotationOptions = [
    { value: 90, label: '90° (Sentido horario)', icon: '↻' },
    { value: 180, label: '180° (Media vuelta)', icon: '↕' },
    { value: 270, label: '270° (Sentido antihorario)', icon: '↺' }
  ];

  const handleRotate = async () => {
    if (files.length === 0) {
      onRotateError('Se necesita un archivo PDF para rotar');
      return;
    }

    if (files.length > 1) {
      onRotateError('Solo se puede rotar un archivo a la vez');
      return;
    }

    setRotating(true);
    setRotateResult(null);

    try {
      const file = files[0];
      const pages = selectedPages === 'all' ? 'all' : pageInput;

      const response = await fetch(`${API_BASE_URL}/pdf/rotate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: file.id,
          rotation_angle: rotationAngle,
          pages: pages,
          output_filename: outputFilename
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al rotar PDF');
      }

      setRotateResult(data);
      onRotateComplete(data);

    } catch (error) {
      console.error('Error rotating PDF:', error);
      onRotateError(error.message);
    } finally {
      setRotating(false);
    }
  };

  const handleDownload = () => {
    if (rotateResult?.operation?.download_url) {
      const link = document.createElement('a');
      link.href = rotateResult.operation.download_url;
      link.download = outputFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canRotate = files.length === 1 && !rotating;

  return (
    <div className="w-full max-w-md mt-6">
      {/* Rotation Angle Selection */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Ángulo de rotación:
        </label>
        <div className="grid grid-cols-1 gap-2">
          {rotationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRotationAngle(option.value)}
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-all
                ${rotationAngle === option.value
                  ? 'bg-[#4b68ff] border-[#4b68ff] text-white'
                  : 'bg-[#12172a] border-[#161618] text-white hover:border-[#4b68ff]'
                }
              `}
              disabled={rotating}
            >
              <span>{option.label}</span>
              <span className="text-xl">{option.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Page Selection */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Páginas a rotar:
        </label>
        <div className="space-y-3">
          <button
            onClick={() => setSelectedPages('all')}
            className={`
              w-full p-3 rounded-lg border text-left transition-all
              ${selectedPages === 'all'
                ? 'bg-[#4b68ff] border-[#4b68ff] text-white'
                : 'bg-[#12172a] border-[#161618] text-white hover:border-[#4b68ff]'
              }
            `}
            disabled={rotating}
          >
            Todas las páginas
          </button>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedPages('specific')}
              className={`
                w-full p-3 rounded-lg border text-left transition-all
                ${selectedPages === 'specific'
                  ? 'bg-[#4b68ff] border-[#4b68ff] text-white'
                  : 'bg-[#12172a] border-[#161618] text-white hover:border-[#4b68ff]'
                }
              `}
              disabled={rotating}
            >
              Páginas específicas
            </button>

            {selectedPages === 'specific' && (
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="Ej: 1,3,5"
                className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-3 text-white placeholder-[#a6a7a9] focus:border-[#4b68ff] focus:outline-none transition-colors"
                disabled={rotating}
              />
            )}
          </div>
        </div>
        <p className="text-[#a6a7a9] text-xs mt-2">
          Para páginas específicas, separa con comas: 1,3,5
        </p>
      </div>

      {/* Filename Input */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Nombre del archivo final:
        </label>
        <input
          type="text"
          value={outputFilename}
          onChange={(e) => setOutputFilename(e.target.value)}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-4 text-white placeholder-[#a6a7a9] focus:border-[#4b68ff] focus:outline-none transition-colors text-base"
          placeholder="documento_rotado.pdf"
          disabled={rotating}
        />
        <p className="text-[#a6a7a9] text-xs mt-2">
          Se añadirá automáticamente la extensión .pdf si no la tiene
        </p>
      </div>

      {/* Rotate Button */}
      <button
        onClick={handleRotate}
        disabled={!canRotate}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all
          ${canRotate
            ? 'bg-[#4b68ff] hover:bg-[#3b55d6] cursor-pointer'
            : 'bg-[#2a2a2a] cursor-not-allowed opacity-50'
          }
        `}
      >
        {rotating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Rotando PDF...</span>
          </div>
        ) : (
          `Rotar PDF ${rotationAngle}°`
        )}
      </button>

      {/* Requirements Message */}
      {files.length === 0 && (
        <p className="text-[#a6a7a9] text-sm mt-4 text-center">
          Necesitas subir un archivo PDF para rotarlo
        </p>
      )}

      {files.length > 1 && (
        <p className="text-[#a6a7a9] text-sm mt-4 text-center">
          Solo se puede rotar un archivo a la vez. Por favor selecciona un solo PDF.
        </p>
      )}

      {/* Success Result */}
      {rotateResult && rotateResult.success && (
        <div className="mt-8 bg-[#1e3a8a]/30 border border-[#3b82f6]/50 rounded-lg p-5">
          <h4 className="text-[#3b82f6] font-semibold mb-4">PDF rotado exitosamente</h4>

          <button
            onClick={handleDownload}
            className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Descargar PDF Rotado</span>
          </button>
        </div>
      )}
    </div>
  );
}

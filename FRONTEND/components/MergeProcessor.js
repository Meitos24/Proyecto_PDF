'use client';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007/api';

export default function MergeProcessor({ files, onMergeComplete, onMergeError }) {
  const [merging, setMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState(null);
  const [outputFilename, setOutputFilename] = useState('documento_combinado.pdf');

  const handleMerge = async () => {
    if (files.length < 2) {
      onMergeError('Se necesitan al menos 2 archivos para combinar');
      return;
    }

    setMerging(true);
    setMergeResult(null);

    try {
      const fileIds = files.map(file => file.id);

      const response = await fetch(`${API_BASE_URL}/pdf/merge/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_ids: fileIds,
          output_filename: outputFilename
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al combinar PDFs');
      }

      setMergeResult(data);
      onMergeComplete(data);

    } catch (error) {
      console.error('Error merging PDFs:', error);
      onMergeError(error.message);
    } finally {
      setMerging(false);
    }
  };

  const handleDownload = () => {
    if (mergeResult?.operation?.download_url) {
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = mergeResult.operation.download_url;
      link.download = outputFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canMerge = files.length >= 2 && !merging;

  return (
    <div className="w-full max-w-md mt-6">
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
          placeholder="mi_documento_combinado.pdf"
          disabled={merging}
        />
        <p className="text-[#a6a7a9] text-xs mt-2">
          Se añadirá automáticamente la extensión .pdf si no la tiene
        </p>
      </div>

      {/* Merge Button */}
      <button
        onClick={handleMerge}
        disabled={!canMerge}
        className={`
                    w-full py-4 px-6 rounded-lg font-semibold text-white transition-all
                    ${canMerge
            ? 'bg-[#4b68ff] hover:bg-[#3b55d6] cursor-pointer'
            : 'bg-[#2a2a2a] cursor-not-allowed opacity-50'
          }
                `}
      >
        {merging ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Combinando PDFs...</span>
          </div>
        ) : (
          `Combinar ${files.length} PDF${files.length > 1 ? 's' : ''}`
        )}
      </button>

      {/* Requirements Message */}
      {files.length < 2 && (
        <p className="text-[#a6a7a9] text-sm mt-4 text-center">
          Necesitas subir al menos 2 archivos PDF para combinarlos
        </p>
      )}

      {/* Success Result */}
      {mergeResult && mergeResult.success && (
        <div className="mt-8 bg-[#1e3a8a]/30 border border-[#3b82f6]/50 rounded-lg p-5">
          <h4 className="text-[#3b82f6] font-semibold mb-4">PDF combinado exitosamente</h4>

          <button
            onClick={handleDownload}
            className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Descargar PDF Combinado</span>
          </button>
        </div>
      )}
    </div>
  );
}

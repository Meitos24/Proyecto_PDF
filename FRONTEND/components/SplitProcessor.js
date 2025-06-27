'use client';
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007/api';

export default function SplitProcessor({ file, onSplitComplete, onSplitError }) {
  const [splitting, setSplitting] = useState(false);
  const [splitResult, setSplitResult] = useState(null);
  const [splitMode, setSplitMode] = useState('all_pages');
  const [outputPrefix, setOutputPrefix] = useState('page');
  const [pagesPerSplit, setPagesPerSplit] = useState(1);
  const [pageRanges, setPageRanges] = useState([{ start: 1, end: 1 }]);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Get PDF info when file changes
  useEffect(() => {
    if (file) {
      getPdfInfo();
    }
  }, [file]);

  const getPdfInfo = async () => {
    setLoadingInfo(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/split/info/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_id: file.id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPdfInfo(data.pdf_info);
        // Initialize page ranges with valid values
        setPageRanges([{ start: 1, end: Math.min(5, data.pdf_info.total_pages) }]);
      } else {
        onSplitError(data.message || 'Error obteniendo información del PDF');
      }
    } catch (error) {
      onSplitError('Error conectando con el servidor');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleSplit = async () => {
    if (!file || !pdfInfo) {
      onSplitError('No hay archivo seleccionado');
      return;
    }

    setSplitting(true);
    setSplitResult(null);

    try {
      // Prepare split options based on mode
      const splitData = {
        file_id: file.id,
        mode: splitMode,
        output_prefix: outputPrefix
      };

      if (splitMode === 'page_ranges') {
        splitData.ranges = pageRanges;
      } else if (splitMode === 'every_n_pages') {
        splitData.pages_per_split = pagesPerSplit;
      }

      const response = await fetch(`${API_BASE_URL}/pdf/split/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(splitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al dividir PDF');
      }

      setSplitResult(data);
      onSplitComplete(data);

    } catch (error) {
      console.error('Error splitting PDF:', error);
      onSplitError(error.message);
    } finally {
      setSplitting(false);
    }
  };

  const handleDownload = () => {
    if (splitResult?.operation?.download_url) {
      const link = document.createElement('a');
      link.href = splitResult.operation.download_url;

      // Set appropriate filename based on file type
      if (splitResult.operation.is_single_file) {
        link.download = `${outputPrefix}.pdf`;
      } else {
        link.download = `${outputPrefix}_split.zip`;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const addPageRange = () => {
    if (pageRanges.length < 10) { // Limit to 10 ranges
      const lastRange = pageRanges[pageRanges.length - 1];
      const newStart = Math.min(lastRange.end + 1, pdfInfo?.total_pages || 1);
      setPageRanges([...pageRanges, {
        start: newStart,
        end: Math.min(newStart + 4, pdfInfo?.total_pages || 1)
      }]);
    }
  };

  const removePageRange = (index) => {
    if (pageRanges.length > 1) {
      setPageRanges(pageRanges.filter((_, i) => i !== index));
    }
  };

  const updatePageRange = (index, field, value) => {
    const newRanges = [...pageRanges];
    const numValue = parseInt(value) || 1;
    const maxPage = pdfInfo?.total_pages || 1;

    newRanges[index][field] = Math.max(1, Math.min(numValue, maxPage));

    // Ensure start <= end
    if (field === 'start' && newRanges[index].start > newRanges[index].end) {
      newRanges[index].end = newRanges[index].start;
    } else if (field === 'end' && newRanges[index].end < newRanges[index].start) {
      newRanges[index].start = newRanges[index].end;
    }

    setPageRanges(newRanges);
  };

  if (!file) {
    return null;
  }

  if (loadingInfo) {
    return (
      <div className="w-full max-w-md mt-6 text-center">
        <div className="flex items-center justify-center space-x-2 text-white">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Analizando PDF...</span>
        </div>
      </div>
    );
  }

  if (!pdfInfo) {
    return null;
  }

  if (!pdfInfo.can_split) {
    return (
      <div className="w-full max-w-md mt-6 bg-orange-900/30 border border-orange-500/50 rounded-lg p-4">
        <p className="text-orange-400 text-sm text-center">
          Este PDF no se puede dividir (solo tiene 1 página o está protegido)
        </p>
      </div>
    );
  }

  const canSplit = !splitting && pdfInfo.can_split;

  return (
    <div className="w-full max-w-md mt-2">
      {/* PDF Info */}
      <div className="mb-6 bg-[#12172a] border border-[#161618] rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Información del PDF</h3>
        <div className="space-y-1 text-sm">
          <p className="text-[#a6a7a9]">Archivo: <span className="text-white">{pdfInfo.filename}</span></p>
          <p className="text-[#a6a7a9]">Páginas: <span className="text-white">{pdfInfo.total_pages}</span></p>
        </div>
      </div>

      {/* Split Mode Selection */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Modo de división:
        </label>
        <select
          value={splitMode}
          onChange={(e) => setSplitMode(e.target.value)}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-3 text-white focus:border-[#4b68ff] focus:outline-none"
          disabled={splitting}
        >
          <option value="all_pages">Dividir en páginas individuales</option>
          <option value="page_ranges">Dividir por rangos de páginas</option>
          <option value="every_n_pages">Dividir cada N páginas</option>
        </select>
      </div>

      {/* Mode-specific options */}
      {splitMode === 'page_ranges' && (
        <div className="mb-6">
          <label className="block text-white font-medium text-sm mb-3">
            Rangos de páginas:
          </label>
          <div className="space-y-3">
            {pageRanges.map((range, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="number"
                  value={range.start}
                  onChange={(e) => updatePageRange(index, 'start', e.target.value)}
                  min="1"
                  max={pdfInfo.total_pages}
                  className="w-20 bg-[#12172a] border border-[#161618] rounded px-3 py-2 text-white text-sm focus:border-[#4b68ff] focus:outline-none"
                  disabled={splitting}
                />
                <span className="text-[#a6a7a9]">a</span>
                <input
                  type="number"
                  value={range.end}
                  onChange={(e) => updatePageRange(index, 'end', e.target.value)}
                  min="1"
                  max={pdfInfo.total_pages}
                  className="w-20 bg-[#12172a] border border-[#161618] rounded px-3 py-2 text-white text-sm focus:border-[#4b68ff] focus:outline-none"
                  disabled={splitting}
                />
                {pageRanges.length > 1 && (
                  <button
                    onClick={() => removePageRange(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                    disabled={splitting}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {pageRanges.length < 10 && (
              <button
                onClick={addPageRange}
                className="text-[#4b68ff] hover:text-[#3b55d6] text-sm font-medium"
                disabled={splitting}
              >
                + Agregar rango
              </button>
            )}
          </div>
        </div>
      )}

      {splitMode === 'every_n_pages' && (
        <div className="mb-6">
          <label className="block text-white font-medium text-sm mb-3">
            Páginas por archivo:
          </label>
          <input
            type="number"
            value={pagesPerSplit}
            onChange={(e) => setPagesPerSplit(parseInt(e.target.value) || 1)}
            min="1"
            max={pdfInfo.total_pages - 1}
            className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-3 text-white focus:border-[#4b68ff] focus:outline-none"
            disabled={splitting}
          />
          <p className="text-[#a6a7a9] text-xs mt-2">
            Resultado: {Math.ceil(pdfInfo.total_pages / pagesPerSplit)} archivos
          </p>
        </div>
      )}

      {/* Output Prefix */}
      <div className="mb-6">
        <label className="block text-white font-medium text-sm mb-3">
          Prefijo para archivos:
        </label>
        <input
          type="text"
          value={outputPrefix}
          onChange={(e) => setOutputPrefix(e.target.value)}
          className="w-full bg-[#12172a] border border-[#161618] rounded-lg px-4 py-3 text-white placeholder-[#a6a7a9] focus:border-[#4b68ff] focus:outline-none"
          placeholder="Pagina"
          disabled={splitting}
        />
      </div>

      {/* Split Button */}
      <button
        onClick={handleSplit}
        disabled={!canSplit}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all
          ${canSplit
            ? 'bg-[#4b68ff] hover:bg-[#3b55d6] cursor-pointer'
            : 'bg-[#2a2a2a] cursor-not-allowed opacity-50'
          }
        `}
      >
        {splitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Dividiendo PDF...</span>
          </div>
        ) : (
          'Dividir PDF'
        )}
      </button>

      {/* Success Result */}
      {splitResult && splitResult.success && (
        <div className="mt-8 bg-[#1e3a8a]/30 border border-[#3b82f6]/50 rounded-lg p-5">
          <h4 className="text-[#3b82f6] font-semibold mb-4">
            {splitResult.operation.is_single_file ? 'PDF extraído exitosamente' : 'PDF dividido exitosamente'}
          </h4>

          <div className="space-y-2 text-sm text-[#a6a7a9] mb-4">
            <p>Archivos generados: {splitResult.operation.file_count}</p>
            <p>Tipo: {splitResult.operation.file_type}</p>
          </div>

          <button
            onClick={handleDownload}
            className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>
              Descargar {splitResult.operation.is_single_file ? 'PDF' : 'ZIP'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

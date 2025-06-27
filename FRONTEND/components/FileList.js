'use client';
import { useState } from 'react';

export default function FileList({ files, onRemoveFile, onReorderFiles, showReorder = true }) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderFiles(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const getFileIcon = (mimeType) => {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.startsWith('image/')) return 'IMG';
    if (mimeType.includes('word')) return 'DOC';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'XLS';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PPT';
    return 'FILE';
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold text-lg">
          Archivos cargados ({files.length})
        </h3>
        {files.length > 1 && (
          <button
            onClick={() => files.forEach(file => onRemoveFile(file.id))}
            className="text-[#a6a7a9] hover:text-red-400 text-sm transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div className="space-y-3">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable={showReorder && files.length > 1}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`
                            bg-[#12172a] border border-[#161618] rounded-lg p-3 
                            flex items-center justify-between transition-all
                            ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
                            ${showReorder && files.length > 1 ? 'cursor-move hover:border-[#4b68ff]' : ''}
                        `}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* File Icon */}
              <div className="text-xs font-bold text-[#4b68ff] bg-[#4b68ff]/20 px-1.5 py-0.5 rounded flex-shrink-0 min-w-[35px] text-center">
                {getFileIcon(file.mimeType)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">
                  {file.name}
                </p>
                <p className="text-[#a6a7a9] text-xs">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Order Number */}
              {showReorder && files.length > 1 && (
                <div className="flex-shrink-0 bg-[#4b68ff] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {index + 1}
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemoveFile(file.id)}
              className="ml-3 text-[#a6a7a9] hover:text-red-400 transition-colors flex-shrink-0"
              title="Eliminar archivo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {showReorder && files.length > 1 && (
        <p className="text-[#a6a7a9] text-sm mt-4 text-center">
          Arrastra los archivos para cambiar el orden de combinación
        </p>
      )}
    </div>
  );
}

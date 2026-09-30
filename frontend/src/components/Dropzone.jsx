import React, { useRef } from 'react';
import { Upload, Plus, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Dropzone = ({ tool, onFilesSelected, onGoHome }) => {
  const { t, lang } = useLanguage();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 px-4">
      {/* Back button to Home */}
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="mb-4 inline-flex items-center space-x-2 text-xs font-bold text-gray-500 dark:text-gray-300 hover:text-[#E5322D] dark:hover:text-[#E5322D] bg-white/70 dark:bg-[#1E1E22]/90 hover:bg-white dark:hover:bg-[#1E1E22] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#27272A] shadow-sm transition-all cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>{lang === 'id' ? '← Kembali ke Semua Alat' : '← Back to All Tools'}</span>
        </button>
      )}

      {/* Dropzone Card */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="bg-white dark:bg-[#1E1E22] border-2 border-dashed border-gray-300 dark:border-[#3F3F46] hover:border-[#E5322D] dark:hover:border-[#E5322D] rounded-3xl p-12 text-center shadow-lg transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={tool.multipleFiles}
          accept={tool.accept}
          className="hidden"
        />
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/40 text-[#E5322D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Upload size={36} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          {lang === 'id' ? tool.name : tool.nameEn}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {lang === 'id' ? tool.desc : tool.descEn}
        </p>

        <button className="bg-[#E5322D] hover:bg-[#C62828] active:scale-95 text-white text-lg font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-all inline-flex items-center space-x-3 cursor-pointer">
          <Plus size={24} />
          <span>{t('dropzone.select_files')}</span>
        </button>
        
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 font-medium">
          {t('dropzone.drop_here')}
        </p>
      </div>
    </div>
  );
};

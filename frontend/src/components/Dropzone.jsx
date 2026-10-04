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
    <div className="max-w-3xl mx-auto my-6 sm:my-10 px-4">
      {/* Back button to Home */}
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="aura-pill mb-4 inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary bg-white/80 dark:bg-[#0E1320]/80 px-4 py-2 rounded-full border border-slate-200/80 dark:border-white/10 shadow-2xs transition-all cursor-pointer group active:scale-95"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>{lang === 'id' ? 'Kembali ke Semua Alat' : 'Back to All Tools'}</span>
        </button>
      )}

      {/* Dropzone Card */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="aura-dock bg-white/85 dark:bg-[#0E1320]/85 border-2 border-dashed border-rose-200 dark:border-rose-900/40 hover:border-primary dark:hover:border-primary rounded-3xl p-6 sm:p-12 text-center backdrop-blur-2xl shadow-2xl transition-all cursor-pointer group active:scale-[0.99]"
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
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-crimson-dark via-primary to-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-rose-500/25 group-hover:scale-110 group-hover:shadow-rose-500/40 transition-all duration-300">
          <Upload size={30} className="sm:w-9 sm:h-9" />
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
          {lang === 'id' ? tool.name : tool.nameEn}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
          {lang === 'id' ? tool.desc : tool.descEn}
        </p>

        <button className="btn-shimmer bg-gradient-to-r from-crimson-primary via-primary to-rose-600 hover:from-primary hover:to-crimson-dark active:scale-95 text-white text-sm sm:text-base font-extrabold px-8 py-3.5 sm:py-4 rounded-full shadow-xl shadow-rose-500/25 transition-all inline-flex items-center justify-center space-x-2.5 w-full sm:w-auto cursor-pointer">
          <Plus size={20} className="sm:w-5 sm:h-5" />
          <span>
            {tool.id === 'word-to-pdf'
              ? (lang === 'id' ? 'Pilih Berkas Word' : 'Select Word Files')
              : tool.id === 'image-to-pdf' || tool.id === 'hd-image'
              ? t('dropzone.select_images')
              : t('dropzone.select_files')}
          </span>
        </button>
        
        <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium">
          {tool.id === 'word-to-pdf'
            ? (lang === 'id' ? 'atau ketuk / jatuhkan berkas Word (.docx, .doc) di sini' : 'or tap / drop Word documents here')
            : tool.id === 'image-to-pdf' || tool.id === 'hd-image'
            ? (lang === 'id' ? 'atau ketuk / jatuhkan gambar di sini' : 'or tap / drop images here')
            : t('dropzone.drop_here')}
        </p>
      </div>
    </div>
  );
};

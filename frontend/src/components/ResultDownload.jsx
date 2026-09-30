import React from 'react';
import { CheckCircle2, Download, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ResultDownload = ({ downloadUrl, fileName, onGoHome, onReset }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto my-16 bg-white dark:bg-[#1E1E22] border border-gray-100 dark:border-[#27272A] rounded-3xl p-12 text-center shadow-xl transition-colors duration-200">
      <div className="w-20 h-20 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
        {t('success.title')}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {t('success.subtitle')}
      </p>

      <a
        href={downloadUrl}
        download={fileName || 'klikpdf_output.pdf'}
        className="bg-[#E5322D] hover:bg-[#C62828] active:scale-95 text-white text-xl font-black px-10 py-5 rounded-2xl shadow-2xl transition-all inline-flex items-center space-x-3 mb-8 cursor-pointer"
      >
        <Download size={28} />
        <span>{t('buttons.download')}</span>
      </a>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-100 dark:border-[#27272A]">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-[#E5322D] dark:hover:text-[#E5322D] cursor-pointer"
        >
          <RefreshCw size={16} />
          <span>{t('buttons.process_another')}</span>
        </button>
        <button
          onClick={onGoHome}
          className="flex items-center space-x-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-[#E5322D] dark:hover:text-[#E5322D] cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t('buttons.back_home')}</span>
        </button>
      </div>
    </div>
  );
};

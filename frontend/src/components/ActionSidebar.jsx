import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Settings } from 'lucide-react';

export const ActionSidebar = ({ tool, options, onOptionsChange, onProcess, isProcessing }) => {
  const { t, lang } = useLanguage();

  return (
    <div className="w-full md:w-80 bg-white dark:bg-[#1E1E22] border-l border-gray-200 dark:border-[#27272A] p-6 flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-extrabold text-lg border-b border-gray-200 dark:border-[#27272A] pb-4 mb-6">
          <Settings size={20} className="text-[#E5322D]" />
          <span>Pengaturan {lang === 'id' ? tool.name : tool.nameEn}</span>
        </div>

        {tool.id === 'watermark' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Teks Cap Air</label>
            <input
              type="text"
              value={options.watermarkText || 'KlikPDF'}
              onChange={(e) => onOptionsChange({ ...options, watermarkText: e.target.value })}
              className="w-full bg-white dark:bg-[#161619] border border-gray-300 dark:border-[#3F3F46] text-gray-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
            />
          </div>
        )}

        {tool.id === 'protect' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Kata Sandi Baru</label>
            <input
              type="password"
              value={options.password || ''}
              onChange={(e) => onOptionsChange({ ...options, password: e.target.value })}
              className="w-full bg-white dark:bg-[#161619] border border-gray-300 dark:border-[#3F3F46] text-gray-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
              placeholder="Masukkan password..."
            />
          </div>
        )}

        {tool.id === 'unlock' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Kata Sandi Buka PDF</label>
            <input
              type="password"
              value={options.password || ''}
              onChange={(e) => onOptionsChange({ ...options, password: e.target.value })}
              className="w-full bg-white dark:bg-[#161619] border border-gray-300 dark:border-[#3F3F46] text-gray-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
              placeholder="Masukkan password..."
            />
          </div>
        )}

        {tool.id === 'split' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Rentang Halaman (opsional, misal: 1-3, 5)</label>
            <input
              type="text"
              value={options.ranges || ''}
              onChange={(e) => onOptionsChange({ ...options, ranges: e.target.value })}
              className="w-full bg-white dark:bg-[#161619] border border-gray-300 dark:border-[#3F3F46] text-gray-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
              placeholder="1-5, 8"
            />
          </div>
        )}
      </div>

      <button
        onClick={onProcess}
        disabled={isProcessing}
        className="w-full mt-6 bg-[#E5322D] hover:bg-[#C62828] active:scale-95 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
      >
        <span>{isProcessing ? 'Memproses...' : t('buttons.process_now')}</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

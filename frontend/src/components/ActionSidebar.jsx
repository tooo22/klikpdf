import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Settings } from 'lucide-react';

export const ActionSidebar = ({ tool, options, onOptionsChange, onProcess, isProcessing }) => {
  const { t, lang } = useLanguage();

  return (
    <div className="w-full md:w-80 bg-white/85 dark:bg-[#0E1320]/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold text-lg border-b border-slate-100 dark:border-white/[0.08] pb-4 mb-6">
          <Settings size={20} className="text-primary" />
          <span>{lang === 'id' ? `Pengaturan ${tool.name}` : `${tool.nameEn} Settings`}</span>
        </div>

        {tool.id === 'watermark' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {lang === 'id' ? 'Teks Cap Air' : 'Watermark Text'}
            </label>
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
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {lang === 'id' ? 'Kata Sandi Baru' : 'New Password'}
            </label>
            <input
              type="password"
              value={options.password || ''}
              onChange={(e) => onOptionsChange({ ...options, password: e.target.value })}
              className="w-full bg-white dark:bg-[#161619] border border-gray-300 dark:border-[#3F3F46] text-gray-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
              placeholder={lang === 'id' ? 'Masukkan password...' : 'Enter password...'}
            />
          </div>
        )}

        {tool.id === 'unlock' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {lang === 'id' ? 'Kata Sandi Buka PDF' : 'Unlock Password'}
            </label>
            <input
              type="password"
              value={options.password || ''}
              onChange={(e) => onOptionsChange({ ...options, password: e.target.value })}
              className="w-full bg-white dark:bg-[#161619] border border-gray-300 dark:border-[#3F3F46] text-gray-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none"
              placeholder={lang === 'id' ? 'Masukkan password...' : 'Enter password...'}
            />
          </div>
        )}

        {tool.id === 'compress' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {lang === 'id' ? 'Tingkat Kompresi' : 'Compression Level'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOptionsChange({ ...options, level: 'medium' })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  (options.level || 'medium') === 'medium'
                    ? 'border-[#38B44A] bg-[#38B44A]/10 text-[#38B44A] ring-2 ring-[#38B44A]/30'
                    : 'border-gray-200 dark:border-[#3F3F46] text-gray-600 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                🌱 {lang === 'id' ? 'Sedang' : 'Medium'}
                <span className="block text-[10px] font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                  {lang === 'id' ? 'Kualitas Bagus' : 'Good Quality'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onOptionsChange({ ...options, level: 'high' })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  options.level === 'high'
                    ? 'border-[#38B44A] bg-[#38B44A]/10 text-[#38B44A] ring-2 ring-[#38B44A]/30'
                    : 'border-gray-200 dark:border-[#3F3F46] text-gray-600 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                ⚡ {lang === 'id' ? 'Tinggi' : 'Extreme'}
                <span className="block text-[10px] font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                  {lang === 'id' ? 'Ukuran Terkecil' : 'Smallest Size'}
                </span>
              </button>
            </div>
          </div>
        )}

        {tool.id === 'page-numbers' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {lang === 'id' ? 'Posisi Nomor Halaman' : 'Page Number Position'}
            </label>
            <select
              value={options.position || 'bottom-right'}
              onChange={(e) => onOptionsChange({ ...options, position: e.target.value })}
              className="w-full bg-white dark:bg-[#161619] border border-gray-300 dark:border-[#3F3F46] text-gray-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#E5322D] outline-none cursor-pointer"
            >
              <option value="bottom-right">{lang === 'id' ? 'Kanan Bawah' : 'Bottom Right'}</option>
              <option value="bottom-center">{lang === 'id' ? 'Tengah Bawah' : 'Bottom Center'}</option>
              <option value="bottom-left">{lang === 'id' ? 'Kiri Bawah' : 'Bottom Left'}</option>
              <option value="top-right">{lang === 'id' ? 'Kanan Atas' : 'Top Right'}</option>
              <option value="top-center">{lang === 'id' ? 'Tengah Atas' : 'Top Center'}</option>
            </select>
          </div>
        )}

        {tool.id === 'hd-image' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {lang === 'id' ? 'Tingkat Ketajaman & Resolusi' : 'Sharpness & Resolution'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOptionsChange({ ...options, quality: 'hd', scale: 2 })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  (options.quality || 'hd') === 'hd'
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                    : 'border-gray-200 dark:border-[#3F3F46] text-gray-600 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                ✨ 2x HD
                <span className="block text-[10px] font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                  {lang === 'id' ? 'Jernih & Cepat' : 'Clear & Fast'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onOptionsChange({ ...options, quality: 'ultra', scale: 4 })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  options.quality === 'ultra'
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                    : 'border-gray-200 dark:border-[#3F3F46] text-gray-600 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                💎 4x Ultra HD
                <span className="block text-[10px] font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                  {lang === 'id' ? 'Maksimal Detail' : 'Maximum Detail'}
                </span>
              </button>
            </div>
          </div>
        )}

        {tool.id === 'split' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {lang === 'id' ? 'Rentang Halaman (opsional, misal: 1-3, 5)' : 'Page Range (optional, e.g. 1-3, 5)'}
            </label>
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

      {/* Sticky Bottom Container on Mobile */}
      <div className="sticky bottom-0 left-0 right-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-3.5 sm:p-4 bg-white/95 dark:bg-[#0E1320]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/[0.08] md:static md:mx-0 md:mb-0 md:p-0 md:bg-transparent md:border-0 z-30 mt-6 pb-[max(1rem,env(safe-area-inset-bottom,1rem))]">
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="btn-shimmer w-full bg-gradient-to-r from-crimson-primary via-primary to-rose-600 hover:from-primary hover:to-crimson-dark active:scale-95 text-white font-extrabold py-3.5 sm:py-4 px-6 rounded-full shadow-xl shadow-rose-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <span>
            {isProcessing 
              ? (lang === 'id' ? 'Memproses berkas...' : 'Processing file...') 
              : (lang === 'id' ? 'Proses Sekarang' : 'Process Now')}
          </span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

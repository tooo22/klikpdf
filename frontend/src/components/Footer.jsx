import React from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = ({ onSelectTool, onGoHome }) => {
  const { lang } = useLanguage();

  const handleToolClick = (e, toolId) => {
    e.preventDefault();
    if (onSelectTool) {
      onSelectTool(toolId);
    } else {
      window.location.hash = `#/${toolId}`;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleBrandClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <footer className="w-full bg-slate-50/80 dark:bg-black border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200/80 dark:border-white/[0.06]">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div 
              onClick={handleBrandClick}
              className="flex items-center gap-2 cursor-pointer group w-fit"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-crimson-dark via-primary to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                Klik<span className="text-primary">PDF</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                v2.0
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              {lang === 'id'
                ? 'Solusi produktivitas PDF terdepan untuk profesional, pelajar, dan bisnis modern di Indonesia. Cepat, aman, dan tanpa biaya langganan.'
                : 'Leading PDF productivity suite for professionals, students, and modern businesses. Fast, secure, and free forever.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-white/[0.04] px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 shadow-2xs">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">verified_user</span>
                <span>256-bit SSL</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-white/[0.04] px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 shadow-2xs">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">memory</span>
                <span>{lang === 'id' ? 'Pemrosesan Klien Lokal' : 'Client-Side Sandbox'}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Konversi */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">
              {lang === 'id' ? 'Konversi PDF' : 'Convert PDF'}
            </h4>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/pdf-to-word"
              onClick={(e) => handleToolClick(e, 'pdf-to-word')}
            >
              {lang === 'id' ? 'PDF ke Word' : 'PDF to Word'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/word-to-pdf"
              onClick={(e) => handleToolClick(e, 'word-to-pdf')}
            >
              {lang === 'id' ? 'Word ke PDF' : 'Word to PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/pdf-to-excel"
              onClick={(e) => handleToolClick(e, 'pdf-to-excel')}
            >
              {lang === 'id' ? 'PDF ke Excel' : 'PDF to Excel'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/pdf-to-jpg"
              onClick={(e) => handleToolClick(e, 'pdf-to-jpg')}
            >
              {lang === 'id' ? 'PDF ke JPG' : 'PDF to JPG'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/hd-image"
              onClick={(e) => handleToolClick(e, 'hd-image')}
            >
              {lang === 'id' ? 'HD-kan Foto (AI Upscale)' : 'Enhance Photo HD (AI)'}
            </a>
          </div>

          {/* Col 3: Organisasi */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">
              {lang === 'id' ? 'Organisasi PDF' : 'Organize PDF'}
            </h4>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/merge"
              onClick={(e) => handleToolClick(e, 'merge')}
            >
              {lang === 'id' ? 'Gabungkan PDF' : 'Merge PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/split"
              onClick={(e) => handleToolClick(e, 'split')}
            >
              {lang === 'id' ? 'Pisahkan PDF' : 'Split PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/compress"
              onClick={(e) => handleToolClick(e, 'compress')}
            >
              {lang === 'id' ? 'Kompres PDF' : 'Compress PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/rotate"
              onClick={(e) => handleToolClick(e, 'rotate')}
            >
              {lang === 'id' ? 'Putar Halaman' : 'Rotate Pages'}
            </a>
          </div>

          {/* Col 4: Keamanan & Info */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">
              {lang === 'id' ? 'Keamanan & Bantuan' : 'Security & Help'}
            </h4>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/protect"
              onClick={(e) => handleToolClick(e, 'protect')}
            >
              {lang === 'id' ? 'Kunci PDF' : 'Protect PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/unlock"
              onClick={(e) => handleToolClick(e, 'unlock')}
            >
              {lang === 'id' ? 'Buka Sandi PDF' : 'Unlock PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/watermark"
              onClick={(e) => handleToolClick(e, 'watermark')}
            >
              {lang === 'id' ? 'Watermark Dokumen' : 'Watermark PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors cursor-pointer" 
              href="#/sign"
              onClick={(e) => handleToolClick(e, 'sign')}
            >
              {lang === 'id' ? 'Tanda Tangan Digital' : 'Sign PDF'}
            </a>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-rating-modal'))}
              className="text-left text-xs sm:text-sm text-primary dark:text-rose-400 hover:underline font-bold transition-colors flex items-center gap-1.5 cursor-pointer mt-1"
            >
              <span>⭐</span>
              <span>{lang === 'id' ? 'Beri Rating & Masukan' : 'Rate & Feedback'}</span>
            </button>
          </div>
        </div>

        {/* Copyright & Creator Credit */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} KlikPDF. {lang === 'id' ? 'Dibuat dengan' : 'Crafted with'}</span>
            <Heart size={13} className="text-primary fill-current" />
            <span>{lang === 'id' ? 'oleh' : 'by'}</span>
            <a
              href="https://instagram.com/toooowys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold transition-colors"
            >
              @toooowys
            </a>
            <span className="hidden sm:inline">• {lang === 'id' ? 'Seluruh hak cipta dilindungi.' : 'All rights reserved.'}</span>
          </div>

          <div className="flex items-center gap-4 text-secondary dark:text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{lang === 'id' ? 'Server Normal' : 'Server Online'}</span>
            </span>
            <span>•</span>
            <a className="hover:text-primary transition-colors" href="#">
              {lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
            </a>
            <span>•</span>
            <a className="hover:text-primary transition-colors" href="#">
              {lang === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

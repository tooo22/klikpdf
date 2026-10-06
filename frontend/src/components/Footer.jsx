import React from 'react';
import { Heart, ShieldCheck, Cpu, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
// Hatched Wireframe Logo Mark matching the Stitch / Blueprint aesthetic
const HatchedLogo = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-zinc-900 dark:text-white"
  >
    <mask id="footer-logo-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <path d="M12 2L3 22H7.5L9.5 17H14.5L16.5 22H21L12 2ZM12 7.5L13.8 13H10.2L12 7.5Z" fill="white" />
    </mask>
    <g mask="url(#footer-logo-mask)">
      <line x1="0" y1="2" x2="24" y2="2" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="4" x2="24" y2="4" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="6" x2="24" y2="6" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="18" x2="24" y2="18" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="22" x2="24" y2="22" stroke="currentColor" strokeWidth="1.2" />
    </g>
  </svg>
);

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
    <footer className="w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-zinc-200 dark:border-zinc-800/80">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div 
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 cursor-pointer group w-fit"
              title="KlikPDF - Solusi Dokumen Serba Cepat"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors">
                <HatchedLogo />
              </div>
              <div className="flex items-center tracking-wider font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                <span>KLIKPDF</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 uppercase font-mono font-bold tracking-wider border border-zinc-300/60 dark:border-zinc-700/60">
                v2.4
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              {lang === 'id'
                ? 'Solusi produktivitas PDF terdepan untuk profesional, pelajar, dan bisnis modern di Indonesia. Cepat, aman, dan tanpa biaya langganan.'
                : 'Leading PDF productivity suite for professionals, students, and modern businesses. Fast, secure, and free forever.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                <span>256-BIT SSL</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <Cpu size={13} className="text-emerald-500 shrink-0" />
                <span>{lang === 'id' ? 'KLIEN LOKAL' : 'CLIENT SANDBOX'}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Konversi */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-300 uppercase tracking-widest">
              {lang === 'id' ? 'Konversi PDF' : 'Convert PDF'}
            </h4>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/pdf-to-word"
              onClick={(e) => handleToolClick(e, 'pdf-to-word')}
            >
              {lang === 'id' ? 'PDF ke Word' : 'PDF to Word'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/word-to-pdf"
              onClick={(e) => handleToolClick(e, 'word-to-pdf')}
            >
              {lang === 'id' ? 'Word ke PDF' : 'Word to PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/pdf-to-excel"
              onClick={(e) => handleToolClick(e, 'pdf-to-excel')}
            >
              {lang === 'id' ? 'PDF ke Excel' : 'PDF to Excel'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/pdf-to-jpg"
              onClick={(e) => handleToolClick(e, 'pdf-to-jpg')}
            >
              {lang === 'id' ? 'PDF ke JPG' : 'PDF to JPG'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/hd-image"
              onClick={(e) => handleToolClick(e, 'hd-image')}
            >
              {lang === 'id' ? 'HD-kan Foto (AI Upscale)' : 'Enhance Photo HD (AI)'}
            </a>
          </div>

          {/* Col 3: Organisasi */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-300 uppercase tracking-widest">
              {lang === 'id' ? 'Organisasi PDF' : 'Organize PDF'}
            </h4>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/merge"
              onClick={(e) => handleToolClick(e, 'merge')}
            >
              {lang === 'id' ? 'Gabungkan PDF' : 'Merge PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/split"
              onClick={(e) => handleToolClick(e, 'split')}
            >
              {lang === 'id' ? 'Pisahkan PDF' : 'Split PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/compress"
              onClick={(e) => handleToolClick(e, 'compress')}
            >
              {lang === 'id' ? 'Kompres PDF' : 'Compress PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/rotate"
              onClick={(e) => handleToolClick(e, 'rotate')}
            >
              {lang === 'id' ? 'Putar Halaman' : 'Rotate Pages'}
            </a>
          </div>

          {/* Col 4: Keamanan & Info */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-300 uppercase tracking-widest">
              {lang === 'id' ? 'Keamanan & Bantuan' : 'Security & Help'}
            </h4>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/protect"
              onClick={(e) => handleToolClick(e, 'protect')}
            >
              {lang === 'id' ? 'Kunci PDF' : 'Protect PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/unlock"
              onClick={(e) => handleToolClick(e, 'unlock')}
            >
              {lang === 'id' ? 'Buka Sandi PDF' : 'Unlock PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/watermark"
              onClick={(e) => handleToolClick(e, 'watermark')}
            >
              {lang === 'id' ? 'Watermark Dokumen' : 'Watermark PDF'}
            </a>
            <a 
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer" 
              href="#/sign"
              onClick={(e) => handleToolClick(e, 'sign')}
            >
              {lang === 'id' ? 'Tanda Tangan Digital' : 'Sign PDF'}
            </a>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-rating-modal'))}
              className="text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:underline font-medium transition-colors flex items-center gap-1.5 cursor-pointer mt-1"
            >
              <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
              <span>{lang === 'id' ? 'Beri Rating & Masukan' : 'Rate & Feedback'}</span>
            </button>
          </div>
        </div>

        {/* Copyright & Creator Credit */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>© {new Date().getFullYear()} KLIKPDF. {lang === 'id' ? 'Dibuat dengan' : 'Crafted with'}</span>
            <Heart size={12} className="text-rose-500 fill-current inline-block mx-0.5" />
            <span>{lang === 'id' ? 'oleh' : 'by'}</span>
            <a
              href="https://instagram.com/toooowys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 dark:text-zinc-200 hover:text-black dark:hover:text-white font-medium underline underline-offset-2 transition-colors"
            >
              @toooowys
            </a>
            <span className="hidden sm:inline">• {lang === 'id' ? 'Seluruh hak cipta dilindungi.' : 'All rights reserved.'}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{lang === 'id' ? 'Server Normal' : 'Server Online'}</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <a className="hover:text-black dark:hover:text-white transition-colors" href="#">
              {lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
            </a>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <a className="hover:text-black dark:hover:text-white transition-colors" href="#">
              {lang === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

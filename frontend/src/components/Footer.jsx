import React from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { lang } = useLanguage();
  return (
    <footer className="w-full bg-slate-50 dark:bg-[#0c0e14] border-t border-border-subtle/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-border-subtle/80 dark:border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-text-primary dark:text-white">
                Klik<span className="text-primary">PDF</span>
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-secondary dark:text-slate-400 leading-relaxed max-w-sm">
              Solusi produktivitas PDF terdepan untuk profesional, pelajar, dan bisnis modern di Indonesia. Cepat, aman, dan tanpa biaya langganan.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-secondary dark:text-slate-300 bg-white dark:bg-[#18181B] px-3 py-1 rounded-full border border-border-subtle/80 dark:border-slate-700 shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-emerald-500">verified_user</span>
                <span>256-bit SSL</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-secondary dark:text-slate-300 bg-white dark:bg-[#18181B] px-3 py-1 rounded-full border border-border-subtle/80 dark:border-slate-700 shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-emerald-500">auto_delete</span>
                <span>Otomatis Dihapus (2 Jam)</span>
              </span>
            </div>
          </div>

          {/* Col 2: Konversi */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">
              Konversi PDF
            </h4>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/pdf-to-word">
              PDF ke Word
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/word-to-pdf">
              Word ke PDF
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/pdf-to-excel">
              PDF ke Excel
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/pdf-to-jpg">
              PDF ke JPG
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/hd-image">
              HD-kan Foto (AI Upscale)
            </a>
          </div>

          {/* Col 3: Organisasi */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">
              Organisasi PDF
            </h4>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/merge">
              Gabungkan PDF
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/split">
              Pisahkan PDF
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/compress">
              Kompres PDF
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/rotate">
              Putar Halaman
            </a>
          </div>

          {/* Col 4: Keamanan & Info */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">
              Keamanan & Bantuan
            </h4>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/protect">
              Kunci PDF
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/unlock">
              Buka Sandi PDF
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/watermark">
              Watermark Dokumen
            </a>
            <a className="text-xs sm:text-sm text-secondary dark:text-slate-400 hover:text-primary transition-colors" href="#/sign">
              Tanda Tangan Digital
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
            <span>© 2026 KlikPDF. Dibuat dengan</span>
            <Heart size={13} className="text-primary fill-current" />
            <span>oleh</span>
            <a
              href="https://instagram.com/toooowys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold transition-colors"
            >
              @toooowys
            </a>
            <span className="hidden sm:inline">• Seluruh hak cipta dilindungi.</span>
          </div>

          <div className="flex items-center gap-4 text-secondary dark:text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Server Normal</span>
            </span>
            <span>•</span>
            <a className="hover:text-primary transition-colors" href="#">
              Kebijakan Privasi
            </a>
            <span>•</span>
            <a className="hover:text-primary transition-colors" href="#">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

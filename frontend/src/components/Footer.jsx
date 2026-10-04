import React from 'react';
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
    <footer className="w-full bg-slate-900 text-slate-400 mt-12 border-t border-slate-800 text-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 pb-8">
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Summary */}
          <div className="col-span-2 space-y-3">
            <div 
              onClick={handleBrandClick}
              className="flex items-center gap-2 cursor-pointer group w-fit"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              </div>
              <span className="text-lg font-extrabold text-white">
                Klik<span className="text-primary">PDF</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                v2.6 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {lang === 'id' 
                ? 'Platform pengolah PDF mandiri berorientasi aksi langsung untuk para profesional kantor, instansi, mahasiswa, dan industri digital di Indonesia.'
                : 'Direct action PDF productivity suite designed for office professionals, organizations, students, and digital creators.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-emerald-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Server ID-West: 99.98% Uptime</span>
              </div>
            </div>
          </div>

          {/* Column 1: Aksi Kompresi & Gabung */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3 font-mono">
              {lang === 'id' ? 'Modifikasi' : 'Organize'}
            </h5>
            <ul className="space-y-2">
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'compress')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/compress"
                >
                  {lang === 'id' ? 'Kompres PDF Kilat' : 'Compress PDF'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'merge')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/merge"
                >
                  {lang === 'id' ? 'Gabungkan Beberapa PDF' : 'Merge PDFs'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'split')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/split"
                >
                  {lang === 'id' ? 'Pisahkan Halaman Dokumen' : 'Split PDF Pages'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'rotate')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/rotate"
                >
                  {lang === 'id' ? 'Putar / Rotasi Lembar' : 'Rotate Pages'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'page-numbers')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/page-numbers"
                >
                  {lang === 'id' ? 'Urutkan & Beri Nomor' : 'Page Numbers'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'split')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/split"
                >
                  {lang === 'id' ? 'Hapus Halaman Tertentu' : 'Delete Pages'}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Konversi Lengkap */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3 font-mono">
              {lang === 'id' ? 'Konversi Format' : 'Convert'}
            </h5>
            <ul className="space-y-2">
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'pdf-to-word')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/pdf-to-word"
                >
                  {lang === 'id' ? 'PDF ke Word (DOCX)' : 'PDF to Word (DOCX)'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'pdf-to-excel')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/pdf-to-excel"
                >
                  {lang === 'id' ? 'PDF ke Excel (XLSX)' : 'PDF to Excel (XLSX)'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'pdf-to-image')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/pdf-to-image"
                >
                  {lang === 'id' ? 'PDF ke Gambar (JPG/PNG)' : 'PDF to JPG/PNG'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'word-to-pdf')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/word-to-pdf"
                >
                  {lang === 'id' ? 'Word ke PDF Online' : 'Word to PDF'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'image-to-pdf')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/image-to-pdf"
                >
                  {lang === 'id' ? 'Foto / Scan ke PDF' : 'Images to PDF'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'hd-image')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/hd-image"
                >
                  {lang === 'id' ? 'HD-kan Foto (AI Upscale)' : 'Enhance Photo HD'}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Privasi & Bantuan */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3 font-mono">
              {lang === 'id' ? 'Sistem & Bantuan' : 'Security & Help'}
            </h5>
            <ul className="space-y-2">
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'protect')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/protect"
                >
                  {lang === 'id' ? 'Kunci & Proteksi Sandi' : 'Protect PDF'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'unlock')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/unlock"
                >
                  {lang === 'id' ? 'Buka Sandi Dokumen' : 'Unlock PDF'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'watermark')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/watermark"
                >
                  {lang === 'id' ? 'Beri Watermark / Cap' : 'Watermark PDF'}
                </a>
              </li>
              <li>
                <a 
                  onClick={(e) => handleToolClick(e, 'ocr')} 
                  className="hover:text-white transition-colors cursor-pointer" 
                  href="#/ocr"
                >
                  {lang === 'id' ? 'PDF OCR Scan Teks' : 'OCR Scan PDF'}
                </a>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-rating-modal'))} 
                  className="hover:text-white transition-colors cursor-pointer text-left" 
                  type="button"
                >
                  {lang === 'id' ? 'Beri Penilaian & Review' : 'Rate & Review'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('faq-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-white transition-colors cursor-pointer text-left" 
                  type="button"
                >
                  {lang === 'id' ? 'Pusat Panduan & FAQ' : 'Help & FAQ'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} KlikPDF. {lang === 'id' ? 'Dilindungi Hak Cipta. Infrastruktur Cloud Berlokasi di Indonesia.' : 'All Rights Reserved. High-Performance Indonesian Cloud.'}
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition-colors">Privasi SSL 256-Bit</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Zero Data Storage</span>
            <span>•</span>
            <a 
              href="https://instagram.com/toooowys"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Dukungan: @toooowys
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

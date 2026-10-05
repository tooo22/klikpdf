import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CONVERT_COLUMNS, ALL_TOOLS_COLUMNS } from '../menuData';
import * as Icons from 'lucide-react';

// Hatched Wireframe Logo Mark matching the Stitch / Blueprint aesthetic
const HatchedLogo = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-zinc-100 dark:text-white"
  >
    <mask id="stitch-logo-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <path d="M12 2L3 22H7.5L9.5 17H14.5L16.5 22H21L12 2ZM12 7.5L13.8 13H10.2L12 7.5Z" fill="white" />
    </mask>
    <g mask="url(#stitch-logo-mask)">
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

export const Navbar = ({ onSelectTool, onGoHome }) => {
  const { lang, toggleLanguage } = useLanguage();
  const { mode, setMode } = useTheme();
  const { user, logout, setIsLoginModalOpen, setIsRecentModalOpen } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null); // 'convert' | 'all' | null
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showDesignMdModal, setShowDesignMdModal] = useState(false);
  const timeoutRef = useRef(null);
  const userMenuRef = useRef(null);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (menuName) => {
    clearTimeout(timeoutRef.current);
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  const handleItemClick = (toolId) => {
    clearTimeout(timeoutRef.current);
    setActiveMenu(null);
    setIsMobileDrawerOpen(false);
    onSelectTool(toolId);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleBrandClick = () => {
    clearTimeout(timeoutRef.current);
    setActiveMenu(null);
    setIsMobileDrawerOpen(false);
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleScrollToTools = () => {
    clearTimeout(timeoutRef.current);
    setActiveMenu(null);
    setIsMobileDrawerOpen(false);
    if (window.location.hash) {
      if (onGoHome) onGoHome();
      setTimeout(() => {
        const el = document.getElementById('semua-alat');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('semua-alat');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isConvertOpen = activeMenu === 'convert';
  const isAllOpen = activeMenu === 'all';

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 select-none pt-[env(safe-area-inset-top,0px)]">
      <div className="h-14 sm:h-16 max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left Section: Blueprint Vertical Line + Hatched Logo + Brand */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Blueprint Vertical Guide Line & Top Triangle Caret */}
          <div className="hidden sm:flex items-center gap-2 pl-1 pr-2 border-r border-zinc-300 dark:border-zinc-800 h-10">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono select-none">▲</span>
          </div>

          {/* Logo Mark & Name */}
          <div
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 group cursor-pointer"
            title="KlikPDF - Solusi Dokumen Serba Cepat"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors">
              <HatchedLogo />
            </div>
            <div className="flex items-center tracking-wider font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
              <span>KLIKPDF</span>
            </div>
          </div>
        </div>

        {/* Center Section: Stitch Uppercase Minimalist Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-8 font-mono text-[11px] font-medium tracking-widest uppercase">
          {/* CREATE / SEMUA ALAT */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('all')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleScrollToTools}
              className={`hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1 flex items-center gap-1 ${
                isAllOpen ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <span>{lang === 'id' ? 'CREATE' : 'CREATE'}</span>
              <Icons.ChevronDown size={11} className={`transition-transform duration-200 ${isAllOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* All Tools Quick Panel */}
            {isAllOpen && (
              <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-64 bg-white dark:bg-zinc-950 rounded-xl p-2 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 px-3 py-1.5 tracking-wider border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                    Aksi PDF Utama
                  </div>
                  <button
                    onClick={() => handleItemClick('merge')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Icons.Layers size={14} />
                    <span>Gabung PDF</span>
                  </button>
                  <button
                    onClick={() => handleItemClick('compress')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Icons.Minimize2 size={14} />
                    <span>Kompres PDF</span>
                  </button>
                  <button
                    onClick={() => handleItemClick('pdf-to-word')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Icons.FileText size={14} />
                    <span>PDF ke Word</span>
                  </button>
                  <button
                    onClick={() => handleItemClick('sign')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Icons.PenTool size={14} />
                    <span>Tanda Tangan</span>
                  </button>
                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 mt-1 pt-1">
                    <button
                      onClick={handleScrollToTools}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>Lihat Semua 24+ Alat</span>
                      <Icons.ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TEMPLATES (Gabung & Organisir) */}
          <button
            onClick={() => handleItemClick('merge')}
            className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            TEMPLATES
          </button>

          {/* COMPONENTS (Kompres & Editor) */}
          <button
            onClick={() => handleItemClick('compress')}
            className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            COMPONENTS
          </button>

          {/* ASSETS (Konversi Multi-Format) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('convert')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleItemClick('pdf-to-word')}
              className={`hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1 flex items-center gap-1 ${
                isConvertOpen ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <span>ASSETS</span>
              <Icons.ChevronDown size={11} className={`transition-transform duration-200 ${isConvertOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Assets Dropdown */}
            {isConvertOpen && (
              <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-56 bg-white dark:bg-zinc-950 rounded-xl p-2 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => handleItemClick('pdf-to-word')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>PDF ke Word (.docx)</span>
                  </button>
                  <button
                    onClick={() => handleItemClick('word-to-pdf')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Word ke PDF</span>
                  </button>
                  <button
                    onClick={() => handleItemClick('pdf-to-jpg')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>PDF ke Gambar (JPG)</span>
                  </button>
                  <button
                    onClick={() => handleItemClick('hd-image')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>HD-kan Foto (AI Upscale)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SKILLS */}
          <a
            href="/skills-flowchart.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            SKILLS
          </a>

          {/* DESIGN.MD */}
          <button
            onClick={() => setShowDesignMdModal(true)}
            className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            DESIGN.MD
          </button>

          {/* LEARN */}
          <a
            href="/flowchart.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            LEARN
          </a>

          {/* PRICING */}
          <button
            onClick={() => {
              const el = document.getElementById('semua-alat');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            PRICING
          </button>
        </nav>

        {/* Right Section: Theme Toggle Capsule + Teal User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Capsule Switcher: [ Sun | Monitor | Moon ] */}
          <div className="flex items-center p-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {/* Light Mode */}
            <button
              onClick={() => setMode('light')}
              title="Light Mode"
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                mode === 'light'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Icons.Sun size={13} />
            </button>

            {/* System Mode */}
            <button
              onClick={() => setMode('system')}
              title="System Preference"
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                mode === 'system'
                  ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Icons.Monitor size={13} />
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setMode('dark')}
              title="Dark Mode"
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                mode === 'dark'
                  ? 'bg-zinc-800 text-white shadow-xs font-bold'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Icons.Moon size={13} />
            </button>
          </div>

          {/* Teal Circular User Avatar matching screenshot */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                if (user) {
                  setIsUserMenuOpen(!isUserMenuOpen);
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              title={user ? user.name : 'Profil / Masuk'}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#008080] hover:bg-[#009688] text-white flex items-center justify-center font-bold font-mono text-xs ring-1 ring-white/20 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {user?.name ? user.name.charAt(0).toLowerCase() : 'y'}
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && user && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-950 backdrop-blur-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-mono">
                    {user.email}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {user.isDemo ? 'Akun Demo' : 'Akun Google Terverifikasi'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsRecentModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                  >
                    <Icons.History size={15} />
                    <span>{lang === 'id' ? 'Riwayat File Saya' : 'My Recent Files'}</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleLanguage();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                  >
                    <Icons.Globe size={15} />
                    <span>{lang === 'id' ? 'Bahasa: Indonesia (Ganti ke EN)' : 'Language: English (Switch to ID)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                  >
                    <Icons.LogOut size={15} />
                    <span>{lang === 'id' ? 'Keluar' : 'Sign out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Drawer Toggle Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            aria-label="Menu"
            className="xl:hidden w-8 h-8 rounded-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            type="button"
          >
            {isMobileDrawerOpen ? <Icons.X size={18} /> : <Icons.Menu size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER (Matches Dark Blueprint Theme) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden">
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-fade-in z-10"
          />

          <div className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[320px] bg-white dark:bg-zinc-950 shadow-2xl flex flex-col justify-between z-20 overflow-hidden border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-200 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex flex-col flex-1 overflow-y-auto p-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <HatchedLogo />
                  </div>
                  <span className="font-mono font-bold text-sm tracking-wider text-zinc-900 dark:text-white">KLIKPDF</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  <Icons.X size={18} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex flex-col gap-1 font-mono text-xs uppercase tracking-wider">
                <button
                  onClick={handleScrollToTools}
                  className="text-left px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                >
                  CREATE (SEMUA ALAT)
                </button>
                <button
                  onClick={() => handleItemClick('merge')}
                  className="text-left px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                >
                  TEMPLATES (GABUNG)
                </button>
                <button
                  onClick={() => handleItemClick('compress')}
                  className="text-left px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                >
                  COMPONENTS (KOMPRES)
                </button>
                <button
                  onClick={() => handleItemClick('pdf-to-word')}
                  className="text-left px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                >
                  ASSETS (KONVERSI)
                </button>
                <a
                  href="/skills-flowchart.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-left px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                >
                  SKILLS
                </a>
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setShowDesignMdModal(true);
                  }}
                  className="text-left px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                >
                  DESIGN.MD
                </button>
                <a
                  href="/flowchart.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-left px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                >
                  LEARN (FLOWCHART)
                </a>
                <button
                  onClick={handleScrollToTools}
                  className="text-left px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                >
                  PRICING (GRATIS)
                </button>
              </div>

              {/* Language Switcher in Drawer */}
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={toggleLanguage}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-xs font-mono text-zinc-800 dark:text-zinc-200 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Icons.Globe size={14} />
                    <span>BAHASA</span>
                  </span>
                  <span className="font-bold">{lang === 'id' ? 'ID (INDONESIA)' : 'EN (ENGLISH)'}</span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-[11px] font-mono text-zinc-500 text-center">
                KLIKPDF v2.4 • AURA STITCH
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESIGN.MD Information Modal */}
      {showDesignMdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-zinc-900 dark:text-white">description</span>
                <h3 className="font-mono font-bold text-sm tracking-wider uppercase text-zinc-900 dark:text-white">
                  GOOGLE STITCH DESIGN.MD
                </h3>
              </div>
              <button
                onClick={() => setShowDesignMdModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300 font-mono space-y-3 leading-relaxed">
              <p>
                Konsep antarmuka ini mengadopsi standar <strong>Google Stitch DESIGN.md</strong> dengan sistem desain minimalis monokrom bergaris presisi (*hairline borders*, kanvas grid, dan palet hitam obsidian).
              </p>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">
                <code>• Background: #000000 (Pure Black)</code><br />
                <code>• Typography: Plain White (#FFFFFF)</code><br />
                <code>• Grid Guide: 32px Canvas Blueprint</code><br />
                <code>• Theme Capsule: 3-State (Sun/Sys/Moon)</code>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowDesignMdModal(false)}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-mono text-xs font-bold"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
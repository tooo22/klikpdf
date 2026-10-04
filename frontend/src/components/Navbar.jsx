import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CONVERT_COLUMNS, ALL_TOOLS_COLUMNS } from '../menuData';
import { TOOLS } from '../toolsConfig';
import * as Icons from 'lucide-react';

export const Navbar = ({ onSelectTool, onGoHome }) => {
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, setIsLoginModalOpen, setIsRecentModalOpen } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null); // 'convert' | 'all' | null
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 220);
  };

  const handleItemClick = (toolId) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(null);
    setIsMobileDrawerOpen(false);
    onSelectTool(toolId);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleBrandClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(null);
    setIsMobileDrawerOpen(false);
    onGoHome();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleScrollToTools = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(null);
    setIsMobileDrawerOpen(false);
    if (window.location.hash) {
      onGoHome();
      setTimeout(() => {
        const el = document.getElementById('semua-alat') || document.getElementById('bento-grid');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById('semua-alat') || document.getElementById('bento-grid');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Global Ctrl+K shortcut listener for the search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('globalToolSearch');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGlobalSearchChange = (val) => {
    window.dispatchEvent(new CustomEvent('klikpdf-search-tools', { detail: { query: val } }));
    if (window.location.hash) {
      handleBrandClick();
    }
  };

  const isConvertOpen = activeMenu === 'convert';
  const isAllOpen = activeMenu === 'all';

  return (
    <header className="sticky top-0 w-full z-50 bg-surface-card/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200 select-none">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Status Tag */}
        <div className="flex items-center gap-4 shrink-0">
          <div 
            onClick={handleBrandClick}
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-[19px] sm:text-[22px]">picture_as_pdf</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-navy-deep dark:text-white leading-none flex items-center gap-1.5">
                Klik<span className="text-primary">PDF</span>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-crimson-glow text-primary uppercase font-mono tracking-wider">PRO TOOLS</span>
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Direct Action Matrix</span>
            </div>
          </div>
        </div>

        {/* Quick Search Bar (Direct Filter for 30+ Tools) */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              id="globalToolSearch"
              type="text"
              placeholder={lang === 'id' ? "Cari alat kilat (contoh: kompres, excel, gabung, tanda tangan)..." : "Search instant tools (e.g. compress, excel, merge, sign)..."}
              onChange={(e) => handleGlobalSearchChange(e.target.value)}
              className="w-full pl-10 pr-20 py-2 text-sm bg-surface-container-low/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-on-surface dark:text-white placeholder:text-slate-400"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">K</kbd>
            </div>
          </div>
        </div>

        {/* Actions & Server Ping */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Cloud Engine Aktif (~12ms)</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          {/* Quick Search on Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Cari Alat"
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Icons.Search size={18} />
          </button>

          {/* Riwayat File */}
          <button 
            type="button"
            onClick={() => setIsRecentModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>{lang === 'id' ? 'Riwayat File' : 'File History'}</span>
          </button>

          {/* Alat Kilat Button */}
          <button 
            type="button"
            onClick={() => {
              if (window.location.hash) {
                handleBrandClick();
                setTimeout(() => {
                  const el = document.getElementById('matrixGrid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              } else {
                const el = document.getElementById('matrixGrid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary hover:bg-crimson-dark text-white text-[11px] sm:text-xs font-bold shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[17px]">flash_on</span>
            <span className="hidden sm:inline">{lang === 'id' ? 'Alat Kilat' : 'Instant Tools'}</span>
            <span className="sm:hidden">{lang === 'id' ? 'Kilat' : 'Tools'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-amber-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            type="button"
          >
            {theme === 'dark' ? (
              <span className="material-symbols-outlined text-[18px]">light_mode</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title="Ganti Bahasa / Switch Language"
            className="hidden sm:inline-flex items-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <span>{String(lang || 'ID').toUpperCase()}</span>
          </button>

          {/* Auth Button or User Menu (Google Login) */}
          {user ? (
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-full border border-border-subtle dark:border-slate-700 hover:border-primary/50 bg-white dark:bg-[#18181B] transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
                <Icons.ChevronDown size={13} className="text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#18181B] rounded-2xl shadow-xl border border-border-subtle dark:border-slate-800 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-border-subtle dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      {user.isDemo
                        ? (lang === 'id' ? 'Akun Demo' : 'Demo Account')
                        : (lang === 'id' ? 'Akun Google Terverifikasi' : 'Verified Google Account')}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsRecentModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-surface-subtle dark:hover:bg-slate-800 hover:text-primary transition-colors text-left cursor-pointer"
                    >
                      <Icons.History size={15} className="text-slate-400" />
                      <span>{lang === 'id' ? 'Riwayat File Saya' : 'My Recent Files'}</span>
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
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              title={lang === 'id' ? 'Masuk dengan Google' : 'Sign in with Google'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{lang === 'id' ? 'Masuk' : 'Sign in'}</span>
            </button>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            aria-label="Buka Menu"
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            type="button"
          >
            {isMobileDrawerOpen ? (
              <Icons.X size={20} className="text-primary" />
            ) : (
              <Icons.Menu size={20} />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer Sheet */}
          <div className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[340px] bg-white dark:bg-[#151722] shadow-2xl flex flex-col justify-between z-10 overflow-hidden border-l border-border-subtle dark:border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Scrollable Content */}
            <div className="flex flex-col flex-1 overflow-y-auto">
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-border-subtle/80 dark:border-slate-800 flex items-center justify-between">
                <div 
                  onClick={handleBrandClick}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">layers</span>
                  </div>
                  <div className="font-extrabold text-lg tracking-tight">
                    <span className="text-text-primary dark:text-white">Klik</span>
                    <span className="text-primary ml-0.5">PDF</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Tutup Menu"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Icons.X size={18} />
                </button>
              </div>

              {/* User Account / Auth Card in Drawer */}
              <div className="p-4 border-b border-border-subtle/80 dark:border-slate-800 bg-surface-subtle/50 dark:bg-slate-900/40">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full ring-2 ring-primary/40 object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          setIsRecentModalOpen(true);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Icons.History size={13} className="text-primary" />
                        <span>{lang === 'id' ? 'Riwayat' : 'Recent'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          logout();
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Icons.LogOut size={13} />
                        <span>{lang === 'id' ? 'Keluar' : 'Sign out'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-border-subtle dark:border-slate-700 hover:border-primary/40 text-xs font-bold shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>{lang === 'id' ? 'Masuk dengan Google' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Search Input for 24+ Tools */}
              <div className="p-3 border-b border-border-subtle/80 dark:border-slate-800 bg-surface-subtle/40 dark:bg-slate-900/30">
                <div className="relative">
                  <Icons.Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    placeholder={lang === 'id' ? "Cari dari 24+ alat PDF..." : "Search 24+ PDF tools..."}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  {mobileSearchQuery && (
                    <button
                      onClick={() => setMobileSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                    >
                      <Icons.X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Tools List or Search Results */}
              <div className="p-4 space-y-4">
                {mobileSearchQuery.trim() ? (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                      {lang === 'id' ? `Hasil Pencarian (${TOOLS.filter(t => t.name?.toLowerCase().includes(mobileSearchQuery.toLowerCase()) || t.nameEn?.toLowerCase().includes(mobileSearchQuery.toLowerCase()) || t.desc?.toLowerCase().includes(mobileSearchQuery.toLowerCase())).length})` : `Search Results (${TOOLS.filter(t => t.name?.toLowerCase().includes(mobileSearchQuery.toLowerCase()) || t.nameEn?.toLowerCase().includes(mobileSearchQuery.toLowerCase()) || t.desc?.toLowerCase().includes(mobileSearchQuery.toLowerCase())).length})`}
                    </span>
                    <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                      {TOOLS.filter(t => 
                        (t.name && t.name.toLowerCase().includes(mobileSearchQuery.toLowerCase())) ||
                        (t.nameEn && t.nameEn.toLowerCase().includes(mobileSearchQuery.toLowerCase())) ||
                        (t.desc && t.desc.toLowerCase().includes(mobileSearchQuery.toLowerCase()))
                      ).map((item) => {
                        const ItemIcon = Icons[item.icon] || Icons.FileText;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setMobileSearchQuery('');
                              handleItemClick(item.id);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 hover:text-primary transition-all text-left cursor-pointer active:scale-98"
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${item.color || '#E5322D'}18`, color: item.color || '#E5322D' }}
                            >
                              <ItemIcon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold">{lang === 'id' ? item.name : item.nameEn}</p>
                              <p className="text-[10px] text-slate-400 truncate">{lang === 'id' ? item.desc : item.descEn}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                        {lang === 'id' ? 'Alat Populer' : 'Popular Tools'}
                      </span>
                      <div className="space-y-1">
                        {[
                          { id: 'merge', name: lang === 'id' ? 'Gabungkan PDF' : 'Merge PDF', icon: Icons.Layers, color: '#E5322D' },
                          { id: 'split', name: lang === 'id' ? 'Pisahkan PDF' : 'Split PDF', icon: Icons.Scissors, color: '#FF7B00' },
                          { id: 'compress', name: lang === 'id' ? 'Kompres PDF' : 'Compress PDF', icon: Icons.Minimize2, color: '#38B44A' },
                          { id: 'word-to-pdf', name: lang === 'id' ? 'Word ke PDF' : 'Word to PDF', icon: Icons.FileCheck, color: '#2072B8' },
                          { id: 'pdf-to-word', name: lang === 'id' ? 'PDF ke Word' : 'PDF to Word', icon: Icons.FileText, color: '#2072B8' },
                          { id: 'hd-image', name: lang === 'id' ? 'HD-kan Foto (AI)' : 'Enhance Photo HD', icon: Icons.Sparkles, color: '#8B5CF6' },
                          { id: 'image-to-pdf', name: lang === 'id' ? 'Gambar ke PDF' : 'Image to PDF', icon: Icons.Image, color: '#F7A600' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 hover:text-primary transition-all text-left cursor-pointer group active:scale-98"
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: `${item.color}15`, color: item.color }}
                            >
                              <item.icon size={14} />
                            </div>
                            <span className="truncate">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Browse all tools CTA in drawer */}
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        handleScrollToTools();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl border border-primary/30 bg-rose-50/50 dark:bg-rose-950/20 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                      <span>{lang === 'id' ? 'Jelajahi Semua 24+ Alat' : 'Browse All 24+ Tools'}</span>
                      <Icons.ArrowRight size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Drawer Bottom Controls (Language + Theme) */}
            <div className="p-4 border-t border-border-subtle/80 dark:border-slate-800 bg-surface-subtle/60 dark:bg-[#11131c] pb-[max(1rem,env(safe-area-inset-bottom,1rem))]">
              {/* Language & Theme Controls Row */}
              <div className="flex items-center justify-between gap-2">
                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-border-subtle dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">language</span>
                  <span>Bahasa: <strong>{String(lang || 'ID').toUpperCase()}</strong></span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-border-subtle dark:border-slate-700 text-slate-700 dark:text-amber-400 hover:text-primary transition-colors cursor-pointer active:scale-95"
                  title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                  type="button"
                >
                  {theme === 'dark' ? (
                    <span className="material-symbols-outlined text-[18px] text-amber-400">light_mode</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

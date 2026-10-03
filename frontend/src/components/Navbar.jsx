import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CONVERT_COLUMNS, ALL_TOOLS_COLUMNS } from '../menuData';
import * as Icons from 'lucide-react';

export const Navbar = ({ onSelectTool, onGoHome, onOpenAdmin }) => {
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, setIsLoginModalOpen, setIsRecentModalOpen } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null); // 'convert' | 'all' | null
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
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

  const isConvertOpen = activeMenu === 'convert';
  const isAllOpen = activeMenu === 'all';

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-xl border-b border-border-subtle/80 dark:border-slate-800 transition-colors duration-200 select-none">
      <div className="h-16 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Left Admin Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Admin Menu Button on the Left (Desktop only, mobile has it inside drawer) */}
          <button
            onClick={onOpenAdmin}
            title={lang === 'id' ? 'Menu Admin (Password: 2899)' : 'Admin Menu (Password: 2899)'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-rose-400 text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95 group"
          >
            <Icons.ShieldCheck size={14} className="text-primary group-hover:scale-110 transition-transform" />
            <span>Admin</span>
          </button>

          {/* Brand Logo */}
          <div 
            onClick={handleBrandClick}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </div>
            <div className="flex items-center tracking-tight font-extrabold text-xl sm:text-2xl">
              <span className="text-text-primary dark:text-white group-hover:text-primary transition-colors">Klik</span>
              <span className="text-primary ml-0.5">PDF</span>
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={handleScrollToTools}
            className="text-sm font-semibold text-secondary dark:text-slate-300 hover:text-text-primary dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-surface-subtle dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'id' ? 'Semua Alat' : 'All Tools'}
          </button>

          <button
            onClick={() => handleItemClick('merge')}
            className="text-sm font-semibold text-secondary dark:text-slate-300 hover:text-primary dark:hover:text-primary px-3 py-1.5 rounded-lg hover:bg-surface-subtle dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'id' ? 'Gabungkan PDF' : 'Merge PDF'}
          </button>

          <button
            onClick={() => handleItemClick('split')}
            className="text-sm font-semibold text-secondary dark:text-slate-300 hover:text-primary dark:hover:text-primary px-3 py-1.5 rounded-lg hover:bg-surface-subtle dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'id' ? 'Pisahkan PDF' : 'Split PDF'}
          </button>

          <button
            onClick={() => handleItemClick('compress')}
            className="text-sm font-semibold text-secondary dark:text-slate-300 hover:text-primary dark:hover:text-primary px-3 py-1.5 rounded-lg hover:bg-surface-subtle dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'id' ? 'Kompres PDF' : 'Compress PDF'}
          </button>

          {/* Hover Dropdown: Konversi */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('convert')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                isConvertOpen
                  ? 'text-primary bg-surface-subtle dark:bg-slate-800'
                  : 'text-secondary dark:text-slate-300 hover:text-text-primary dark:hover:text-white hover:bg-surface-subtle dark:hover:bg-slate-800'
              }`}
            >
              <span>{lang === 'id' ? 'Konversi' : 'Convert'}</span>
              <Icons.ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isConvertOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`}
              />
            </button>

            {/* Dropdown Container */}
            <div
              className={`absolute left-0 top-full pt-2 z-50 transition-all duration-200 ease-out transform ${
                isConvertOpen
                  ? 'opacity-100 translate-y-0 visible pointer-events-auto'
                  : 'opacity-0 -translate-y-2 invisible pointer-events-none'
              }`}
            >
              <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border-subtle dark:border-slate-800 p-6 flex gap-8 min-w-[500px]">
                {CONVERT_COLUMNS.map((col, idx) => (
                  <div key={idx} className="flex-1">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-3 pb-1 border-b border-border-subtle dark:border-slate-800 uppercase">
                      {lang === 'id' ? col.titleId : col.title}
                    </div>
                    <div className="space-y-1">
                      {col.items.map((item, itemIdx) => {
                        const ItemIcon = Icons[item.icon] || Icons.FileText;
                        return (
                          <button
                            key={itemIdx}
                            onClick={() => handleItemClick(item.id)}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-rose-50/80 dark:hover:bg-rose-950/30 hover:translate-x-1 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-all duration-150 group cursor-pointer"
                          >
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                              style={{ backgroundColor: `${item.color}15`, color: item.color }}
                            >
                              <ItemIcon size={14} />
                            </div>
                            <span className="truncate">{lang === 'id' ? item.nameId : item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hover Dropdown: Semua Alat Mega Menu */}
          <div
            className="static"
            onMouseEnter={() => handleMouseEnter('all')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                isAllOpen
                  ? 'text-primary bg-surface-subtle dark:bg-slate-800'
                  : 'text-secondary dark:text-slate-300 hover:text-text-primary dark:hover:text-white hover:bg-surface-subtle dark:hover:bg-slate-800'
              }`}
            >
              <span>{lang === 'id' ? 'Menu Lengkap' : 'Full Menu'}</span>
              <Icons.ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isAllOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`}
              />
            </button>

            {/* Mega Dropdown Container */}
            <div
              className={`absolute left-0 right-0 top-full pt-2 px-4 sm:px-6 lg:px-8 z-50 transition-all duration-200 ease-out transform ${
                isAllOpen
                  ? 'opacity-100 translate-y-0 visible pointer-events-auto'
                  : 'opacity-0 -translate-y-2 invisible pointer-events-none'
              }`}
            >
              <div className="max-w-[1280px] mx-auto bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border-subtle dark:border-slate-800 p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5">
                {ALL_TOOLS_COLUMNS.map((col, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-3 pb-1 border-b border-border-subtle dark:border-slate-800 uppercase">
                      {lang === 'id' ? col.titleId : col.title}
                    </div>
                    <div className="space-y-1">
                      {col.items.map((item, itemIdx) => {
                        const ItemIcon = Icons[item.icon] || Icons.FileText;
                        return (
                          <button
                            key={itemIdx}
                            onClick={() => handleItemClick(item.id)}
                            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-rose-50/80 dark:hover:bg-rose-950/30 hover:translate-x-0.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-all duration-150 group cursor-pointer"
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                              style={{ backgroundColor: `${item.color}15`, color: item.color }}
                            >
                              <ItemIcon size={12} />
                            </div>
                            <span className="truncate text-[11px] leading-tight font-medium">
                              {lang === 'id' ? item.nameId : item.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={handleScrollToTools}
            aria-label="Cari alat"
            title="Cari semua alat PDF"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary dark:text-slate-300 hover:text-primary hover:bg-surface-subtle dark:hover:bg-slate-800 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary dark:text-amber-400 hover:text-primary hover:bg-surface-subtle dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-90"
            type="button"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <span className="material-symbols-outlined text-[19px] text-amber-400">light_mode</span>
            ) : (
              <span className="material-symbols-outlined text-[19px]">dark_mode</span>
            )}
          </button>

          {/* Language Switcher (Desktop only, mobile has it inside drawer) */}
          <button
            onClick={() => toggleLanguage()}
            title="Ganti Bahasa / Switch Language"
            className="hidden sm:inline-flex items-center text-xs font-bold text-secondary dark:text-slate-300 hover:text-primary bg-surface-subtle dark:bg-slate-800/80 px-2.5 py-1 rounded-full gap-1 border border-border-subtle/80 dark:border-slate-700/60 transition-colors cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">language</span>
            <span>{String(lang || 'ID').toUpperCase()}</span>
          </button>

          {/* Auth Button or User Menu (Desktop only, mobile has it inside drawer) */}
          {user ? (
            <div className="hidden sm:inline-block relative" ref={userMenuRef}>
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
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
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
                      {user.isDemo ? 'Akun Demo' : 'Akun Google Terverifikasi'}
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
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'id' ? 'Masuk' : 'Sign in'}
              </button>
              <button
                onClick={() => {
                  const dropzone = document.getElementById('dropzone-box');
                  if (dropzone) {
                    dropzone.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-primary hover:bg-primary-container text-white px-3.5 sm:px-4 py-2 rounded-xl shadow-sm shadow-primary/25 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{lang === 'id' ? 'Mulai Gratis' : 'Start Free'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            aria-label="Buka Menu Navigasi"
            title={lang === 'id' ? 'Menu Navigasi' : 'Navigation Menu'}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-surface-subtle dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-90"
            type="button"
          >
            {isMobileDrawerOpen ? (
              <Icons.X size={22} className="text-primary" />
            ) : (
              <Icons.Menu size={22} />
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
                      className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Icons.LogIn size={15} />
                      <span>{lang === 'id' ? 'Masuk / Daftar Akun' : 'Sign In / Register'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Navigation Tools */}
              <div className="p-4 space-y-4">
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
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 hover:text-primary transition-all text-left cursor-pointer group"
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${item.color}15`, color: item.color }}
                        >
                          <item.icon size={13} />
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
                  className="w-full py-2.5 px-3 rounded-xl border border-primary/30 bg-rose-50/50 dark:bg-rose-950/20 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all cursor-pointer"
                >
                  <span>{lang === 'id' ? 'Jelajahi Semua 24+ Alat' : 'Browse All 24+ Tools'}</span>
                  <Icons.ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Drawer Bottom Controls (Admin + Language + Theme) */}
            <div className="p-4 border-t border-border-subtle/80 dark:border-slate-800 bg-surface-subtle/60 dark:bg-[#11131c] space-y-3">
              {/* Admin Menu Access in Mobile Drawer */}
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-primary border border-border-subtle dark:border-slate-700 text-xs font-bold shadow-2xs cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Icons.ShieldCheck size={15} className="text-primary" />
                  <span>{lang === 'id' ? 'Menu Admin KlikPDF' : 'Admin Portal'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">PIN: 2899</span>
              </button>

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

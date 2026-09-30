import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { CONVERT_COLUMNS, ALL_TOOLS_COLUMNS } from '../menuData';
import * as Icons from 'lucide-react';

export const Navbar = ({ onSelectTool, onGoHome }) => {
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState(null); // 'convert' | 'all' | null
  const timeoutRef = useRef(null);

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
    onSelectTool(toolId);
  };

  const isConvertOpen = activeMenu === 'convert';
  const isAllOpen = activeMenu === 'all';

  return (
    <header className="bg-white dark:bg-[#18181B] border-b border-gray-200 dark:border-[#27272A] sticky top-0 z-50 select-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={onGoHome} 
          className="flex items-center space-x-1.5 cursor-pointer group"
        >
          <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#E5322D] transition-colors">
            Klik
          </span>
          <div className="bg-[#E5322D] text-white p-1 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm">
            <Icons.MousePointerClick size={18} />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#E5322D]">
            PDF
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-extrabold tracking-wider uppercase text-gray-700 dark:text-gray-200">
          <button 
            onClick={() => onSelectTool('merge')} 
            className="hover:text-[#E5322D] dark:hover:text-[#E5322D] transition-colors py-5"
          >
            {lang === 'id' ? 'GABUNGKAN PDF' : 'MERGE PDF'}
          </button>
          
          <button 
            onClick={() => onSelectTool('split')} 
            className="hover:text-[#E5322D] dark:hover:text-[#E5322D] transition-colors py-5"
          >
            {lang === 'id' ? 'PISAHKAN PDF' : 'SPLIT PDF'}
          </button>
          
          <button 
            onClick={() => onSelectTool('compress')} 
            className="hover:text-[#E5322D] dark:hover:text-[#E5322D] transition-colors py-5"
          >
            {lang === 'id' ? 'KOMPRES PDF' : 'COMPRESS PDF'}
          </button>

          {/* CONVERT PDF Hover Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('convert')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className={`flex items-center space-x-1 py-5 transition-colors font-extrabold cursor-pointer ${
                isConvertOpen ? 'text-[#E5322D]' : 'hover:text-[#E5322D] dark:hover:text-[#E5322D]'
              }`}
            >
              <span>{lang === 'id' ? 'KONVERSI PDF' : 'CONVERT PDF'}</span>
              <Icons.ChevronDown 
                size={14} 
                className={`transition-transform duration-300 ease-out ${
                  isConvertOpen ? 'rotate-180 text-[#E5322D]' : 'text-gray-400 dark:text-gray-500'
                }`} 
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
              {/* Invisible Hover Bridge */}
              <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

              <div className="bg-white/98 dark:bg-[#1E1E22]/98 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-gray-100 dark:border-[#2E2E33] p-6 flex gap-8 min-w-[500px]">
                {CONVERT_COLUMNS.map((col, idx) => (
                  <div key={idx} className="flex-1">
                    <div className="text-[11px] font-black text-gray-400 dark:text-gray-500 tracking-wider mb-3 pb-1 border-b border-gray-100 dark:border-[#2E2E33] uppercase">
                      {lang === 'id' ? col.titleId : col.title}
                    </div>
                    <div className="space-y-1">
                      {col.items.map((item, itemIdx) => {
                        const ItemIcon = Icons[item.icon] || Icons.FileText;
                        return (
                          <button
                            key={itemIdx}
                            onClick={() => handleItemClick(item.id)}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-red-50/60 dark:hover:bg-red-950/30 hover:translate-x-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#E5322D] dark:hover:text-[#FF6B66] transition-all duration-150 group cursor-pointer"
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

          {/* ALL PDF TOOLS Mega Hover Dropdown */}
          <div 
            className="static"
            onMouseEnter={() => handleMouseEnter('all')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className={`flex items-center space-x-1 py-5 transition-colors font-extrabold cursor-pointer ${
                isAllOpen ? 'text-[#E5322D]' : 'hover:text-[#E5322D] dark:hover:text-[#E5322D]'
              }`}
            >
              <span>{lang === 'id' ? 'SEMUA ALAT PDF' : 'ALL PDF TOOLS'}</span>
              <Icons.ChevronDown 
                size={14} 
                className={`transition-transform duration-300 ease-out ${
                  isAllOpen ? 'rotate-180 text-[#E5322D]' : 'text-gray-400 dark:text-gray-500'
                }`} 
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
              {/* Invisible Hover Bridge */}
              <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

              <div className="max-w-7xl mx-auto bg-white/98 dark:bg-[#1E1E22]/98 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-[#2E2E33] p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5">
                {ALL_TOOLS_COLUMNS.map((col, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-wider mb-3 pb-1 border-b border-gray-100 dark:border-[#2E2E33] uppercase">
                      {lang === 'id' ? col.titleId : col.title}
                    </div>
                    <div className="space-y-1">
                      {col.items.map((item, itemIdx) => {
                        const ItemIcon = Icons[item.icon] || Icons.FileText;
                        return (
                          <button
                            key={itemIdx}
                            onClick={() => handleItemClick(item.id)}
                            className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg hover:bg-red-50/60 dark:hover:bg-red-950/30 hover:translate-x-0.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#E5322D] dark:hover:text-[#FF6B66] transition-all duration-150 group cursor-pointer"
                          >
                            <div 
                              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                              style={{ backgroundColor: `${item.color}15`, color: item.color }}
                            >
                              <ItemIcon size={13} />
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

        {/* Right Controls: Theme Toggle & Language Switcher */}
        <div className="flex items-center space-x-2.5">
          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-amber-400 hover:bg-gray-100 dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer shadow-sm active:scale-90"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Icons.Sun size={16} className="text-amber-400" />
            ) : (
              <Icons.Moon size={16} className="text-gray-700" />
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => toggleLanguage()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#27272A] transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
          >
            <Icons.Globe size={14} className="text-[#E5322D]" />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

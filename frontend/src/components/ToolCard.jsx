import React from 'react';
import * as Icons from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ToolCard = ({ tool, onClick }) => {
  const { lang } = useLanguage();
  const IconComponent = Icons[tool.icon] || Icons.FileText;

  return (
    <div
      onClick={onClick}
      className="aura-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0E1320]/75 backdrop-blur-xl shadow-xs hover:shadow-xl hover:border-rose-500/40 dark:hover:border-rose-500/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs"
            style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
          >
            <IconComponent size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-rose-500 transition-colors">
            {tool.category || 'PDF'}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1.5 group-hover:text-primary dark:group-hover:text-rose-400 transition-colors">
          {lang === 'id' ? tool.name : tool.nameEn}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {lang === 'id' ? tool.desc : tool.descEn}
        </p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-primary dark:text-rose-400">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-rose-400 transition-colors">
          {lang === 'id' ? 'Buka Alat' : 'Open Tool'}
        </span>
        <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-1.5 transition-transform duration-200">
          arrow_forward
        </span>
      </div>
    </div>
  );
};

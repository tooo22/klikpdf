import React from 'react';
import * as Icons from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ToolCard = ({ tool, onClick }) => {
  const { lang } = useLanguage();
  const IconComponent = Icons[tool.icon] || Icons.FileText;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#1E1E22] rounded-2xl p-6 border border-gray-100 dark:border-[#27272A] shadow-sm hover:shadow-xl dark:hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
        >
          <IconComponent size={26} />
        </div>
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-[#E5322D] transition-colors">
          {lang === 'id' ? tool.name : tool.nameEn}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {lang === 'id' ? tool.desc : tool.descEn}
        </p>
      </div>
    </div>
  );
};

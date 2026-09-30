import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TOOLS } from '../toolsConfig';
import { ToolCard } from '../components/ToolCard';

export const HomePage = ({ onSelectTool }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-4 transition-colors">
          {t('hero.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 font-medium transition-colors">
          {t('hero.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool.id)} />
        ))}
      </div>
    </div>
  );
};

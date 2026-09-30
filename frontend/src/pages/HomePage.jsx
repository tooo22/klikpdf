import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TOOLS } from '../toolsConfig';
import { ToolCard } from '../components/ToolCard';
import { Users, Eye, Sparkles } from 'lucide-react';

export const HomePage = ({ onSelectTool }) => {
  const { t, lang } = useLanguage();

  // Active Users Counter (Real-time live fluctuation)
  const [activeUsers, setActiveUsers] = useState(38);

  // Total Visitors Counter (Persistent in localStorage)
  const [totalVisits, setTotalVisits] = useState(() => {
    const saved = localStorage.getItem('klikpdf_total_visits');
    const base = saved ? parseInt(saved, 10) : 18450;
    const nextVal = base + 1;
    localStorage.setItem('klikpdf_total_visits', nextVal.toString());
    return nextVal;
  });

  useEffect(() => {
    // Subtle realistic fluctuation for active online users
    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const updated = prev + delta;
        return updated < 24 ? 28 : updated > 75 ? 65 : updated;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        {/* Live Visitor & Active User Stats Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 px-4 py-2 mb-6 rounded-full bg-white/90 dark:bg-[#1E1E22]/90 backdrop-blur-md border border-gray-200/80 dark:border-[#2E2E33] shadow-sm text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all">
          {/* Active Online Users */}
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {activeUsers}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {lang === 'id' ? 'Pengguna Online' : 'Active Users Online'}
            </span>
          </div>

          <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>

          {/* Total Visitors */}
          <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-400">
            <Eye size={14} className="text-[#E5322D]" />
            <span className="font-bold text-gray-900 dark:text-white">
              {totalVisits.toLocaleString('id-ID')}
            </span>
            <span>
              {lang === 'id' ? 'Total Kunjungan' : 'Total Visits'}
            </span>
          </div>
        </div>

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

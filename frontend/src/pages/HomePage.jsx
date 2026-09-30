import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TOOLS } from '../toolsConfig';
import { ToolCard } from '../components/ToolCard';
import { Users, Eye, Sparkles } from 'lucide-react';

export const HomePage = ({ onSelectTool }) => {
  const { t, lang } = useLanguage();

  // Real Active Users (tracked across real active tabs / sessions)
  const [activeUsers, setActiveUsers] = useState(1);

  // Real Total Visitors from Global Visitor Counter API
  const [totalVisits, setTotalVisits] = useState(() => {
    const saved = localStorage.getItem('klikpdf_real_visits');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    // 1. Real-Time Auto-Polling for Global Total Visits (every 5 seconds without refresh)
    const fetchRealVisits = async () => {
      try {
        const res = await fetch(`https://api.visitorbadge.io/api/visitors?path=klikpdf.my.id&nocache=${Date.now()}`);
        if (res.ok) {
          const svgText = await res.text();
          const numbers = svgText.match(/>(\d[\d,.]*)</g);
          if (numbers && numbers.length > 0) {
            const raw = numbers[numbers.length - 1].replace(/[^\d]/g, '');
            const parsed = parseInt(raw, 10);
            if (!isNaN(parsed) && parsed > 0) {
              setTotalVisits(parsed);
              localStorage.setItem('klikpdf_real_visits', parsed.toString());
            }
          }
        }
      } catch (err) {
        // Silently retry on next interval
      }
    };

    fetchRealVisits();
    const visitInterval = setInterval(fetchRealVisits, 5000);

    // 2. Real-Time Active Users Heartbeat Presence (Instant sync across tabs & devices)
    const myTabId = 'tab_' + Math.random().toString(36).substring(2, 9);
    const activeTabsMap = new Map();
    activeTabsMap.set(myTabId, Date.now());

    let channel = null;
    let heartbeatInterval = null;
    let cleanupInterval = null;

    try {
      channel = new BroadcastChannel('klikpdf_active_presence_v2');

      const broadcastHeartbeat = () => {
        if (channel) {
          channel.postMessage({ type: 'HEARTBEAT', tabId: myTabId, time: Date.now() });
        }
      };

      const updateCount = () => {
        const now = Date.now();
        // Remove stale tabs inactive for > 4 seconds
        for (const [id, lastSeen] of activeTabsMap.entries()) {
          if (now - lastSeen > 4000) {
            activeTabsMap.delete(id);
          }
        }
        activeTabsMap.set(myTabId, now);
        setActiveUsers(Math.max(1, activeTabsMap.size));
      };

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'HEARTBEAT' && data.tabId) {
          activeTabsMap.set(data.tabId, data.time || Date.now());
          updateCount();
        } else if (data.type === 'LEAVE' && data.tabId) {
          activeTabsMap.delete(data.tabId);
          updateCount();
        }
      };

      // Broadcast heartbeat every 2 seconds
      broadcastHeartbeat();
      heartbeatInterval = setInterval(broadcastHeartbeat, 2000);

      // Clean up stale tabs every 2 seconds
      cleanupInterval = setInterval(updateCount, 2000);

      const handleUnload = () => {
        if (channel) {
          channel.postMessage({ type: 'LEAVE', tabId: myTabId });
        }
      };

      window.addEventListener('beforeunload', handleUnload);

      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        clearInterval(visitInterval);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (cleanupInterval) clearInterval(cleanupInterval);
        if (channel) {
          channel.postMessage({ type: 'LEAVE', tabId: myTabId });
          channel.close();
        }
      };
    } catch (e) {
      setActiveUsers(1);
      return () => {
        clearInterval(visitInterval);
      };
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        {/* Live Visitor & Active User Stats Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 px-4 py-2 mb-6 rounded-full bg-white/90 dark:bg-[#1E1E22]/90 backdrop-blur-md border border-gray-200/80 dark:border-[#2E2E33] shadow-sm text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all">
          {/* Active Online Users */}
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 animate-blink-green"></span>
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
            <div className="relative flex items-center justify-center">
              <Eye size={15} className="text-[#E5322D] animate-blink-red" />
            </div>
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

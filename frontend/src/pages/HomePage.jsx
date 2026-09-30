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

  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const filteredTools = activeCategory === 'all'
    ? TOOLS
    : activeCategory === 'popular'
    ? TOOLS.filter(t => ['merge', 'split', 'compress', 'pdf-to-word', 'hd-image', 'image-to-pdf'].includes(t.id))
    : TOOLS.filter(t => t.category === activeCategory || (activeCategory === 'convert' && t.id === 'hd-image'));

  const faqs = [
    {
      q: lang === 'id' ? 'Apakah semua alat di KlikPDF 100% gratis?' : 'Are all tools on KlikPDF 100% free?',
      a: lang === 'id' ? 'Ya! Seluruh fitur pengolahan PDF dan HD-kan Foto di KlikPDF dapat digunakan secara gratis tanpa perlu registrasi atau berlangganan.' : 'Yes! All PDF processing tools and HD Photo Enhancer on KlikPDF are completely free to use without registration.'
    },
    {
      q: lang === 'id' ? 'Apakah berkas dan dokumen saya aman?' : 'Are my files and documents secure?',
      a: lang === 'id' ? 'Sangat aman. Seluruh proses pengolahan dokumen dilakukan melalui jalur terenkripsi HTTPS/SSL berstandar tinggi, dan berkas sementara akan dihapus secara otomatis dari server segera setelah pemrosesan selesai.' : 'Extremely secure. All processing is transmitted via high-grade HTTPS/SSL encryption and temporary files are automatically deleted.'
    },
    {
      q: lang === 'id' ? 'Bagaimana cara menggabungkan beberapa file PDF?' : 'How do I merge multiple PDF files?',
      a: lang === 'id' ? 'Cukup pilih alat "Gabungkan PDF", unggah dua atau lebih dokumen PDF Anda, atur urutan halaman sesuai keinginan, lalu klik "Proses Sekarang" untuk mengunduh hasilnya.' : 'Select the "Merge PDF" tool, upload 2 or more files, arrange order, and click "Process Now".'
    },
    {
      q: lang === 'id' ? 'Bagaimana cara menjernihkan atau meng-HD-kan foto?' : 'How do I enhance/upscale photos to HD?',
      a: lang === 'id' ? 'Pilih alat "HD-kan Foto (Upscale)", pilih gambar JPG/PNG Anda, tentukan tingkat kualitas (2x HD atau 4x Ultra HD), lalu klik proses untuk mendapatkan foto beresolusi tajam.' : 'Select "Enhance Photo HD", choose your image, select quality (2x or 4x Ultra HD), and download your crystal-clear image.'
    },
    {
      q: lang === 'id' ? 'Bisa digunakan di perangkat apa saja?' : 'What devices are supported?',
      a: lang === 'id' ? 'KlikPDF dirancang responsif sehingga dapat diakses lancar melalui Laptop, PC, Tablet, maupun Smartphone (Android & iPhone).' : 'KlikPDF works seamlessly across all devices including Laptops, PCs, Tablets, and Smartphones.'
    }
  ];

  const guideSteps = [
    {
      title: lang === 'id' ? 'Gabungkan PDF' : 'Merge PDF',
      steps: [
        lang === 'id' ? 'Klik alat Gabungkan PDF' : 'Select Merge PDF tool',
        lang === 'id' ? 'Upload 2 atau lebih file PDF' : 'Upload 2 or more PDF files',
        lang === 'id' ? 'Atur urutan dokumen' : 'Arrange document order',
        lang === 'id' ? 'Download file hasil gabungan' : 'Download merged document'
      ]
    },
    {
      title: lang === 'id' ? 'Kompres PDF' : 'Compress PDF',
      steps: [
        lang === 'id' ? 'Pilih alat Kompres PDF' : 'Select Compress PDF',
        lang === 'id' ? 'Upload file PDF berukuran besar' : 'Upload large PDF file',
        lang === 'id' ? 'Sistem mengoptimalkan ukuran' : 'System optimizes size automatically',
        lang === 'id' ? 'Download PDF dengan ukuran lebih kecil' : 'Download compressed file'
      ]
    },
    {
      title: lang === 'id' ? 'HD-kan Foto (Upscale)' : 'Enhance Photo HD',
      steps: [
        lang === 'id' ? 'Pilih menu HD-kan Foto' : 'Select Enhance Photo HD',
        lang === 'id' ? 'Upload foto JPG/PNG/WebP' : 'Upload JPG/PNG/WebP photo',
        lang === 'id' ? 'Pilih 2x HD atau 4x Ultra HD' : 'Choose 2x HD or 4x Ultra HD',
        lang === 'id' ? 'Download gambar beresolusi tinggi' : 'Download high-res enhanced photo'
      ]
    },
    {
      title: lang === 'id' ? 'Konversi PDF ke Word' : 'PDF to Word',
      steps: [
        lang === 'id' ? 'Pilih PDF ke Word' : 'Select PDF to Word',
        lang === 'id' ? 'Upload dokumen PDF Anda' : 'Upload your PDF document',
        lang === 'id' ? 'Ekstraksi teks & tabel instan' : 'Instant text & table conversion',
        lang === 'id' ? 'Download berkas DOCX Word' : 'Download editable DOCX'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-12">
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#E5322D] dark:text-[#ff6b66] font-bold text-xs uppercase tracking-wider mb-4 border border-red-200 dark:border-red-900/40 shadow-xs">
          <Sparkles size={14} />
          <span>{t('hero.badge')}</span>
        </div>

        {/* Live Visitor & Active User Stats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 px-4 py-2 mb-6 rounded-full bg-white/90 dark:bg-[#1E1E22]/90 backdrop-blur-md border border-gray-200/80 dark:border-[#2E2E33] shadow-sm text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all max-w-fit mx-auto">
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

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-4 transition-colors">
          {t('hero.title')}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-500 dark:text-gray-400 font-medium transition-colors max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {[
            { id: 'all', label: lang === 'id' ? 'Semua Alat' : 'All Tools' },
            { id: 'popular', label: lang === 'id' ? '🔥 Populer' : '🔥 Popular' },
            { id: 'organize', label: lang === 'id' ? 'Atur PDF' : 'Organize' },
            { id: 'convert', label: lang === 'id' ? 'Konversi & HD Foto' : 'Convert & HD' },
            { id: 'security', label: lang === 'id' ? 'Keamanan' : 'Security' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#E5322D] text-white shadow-md shadow-red-500/20 scale-105'
                  : 'bg-white dark:bg-[#1E1E22] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#27272A] border border-gray-200 dark:border-[#2E2E33]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool.id)} />
        ))}
      </div>

      {/* Cara Menggunakan KlikPDF Section */}
      <div className="bg-white dark:bg-[#18181B] rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-[#27272A] shadow-sm mb-16 transition-colors">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            {lang === 'id' ? 'Cara Menggunakan KlikPDF' : 'How to Use KlikPDF'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {lang === 'id' ? 'Panduan cepat dan mudah untuk mengolah berkas PDF & foto Anda dalam 4 langkah instan.' : 'Quick and easy guide to process your PDFs and photos in 4 simple steps.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guideSteps.map((guide, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-[#1E1E22] rounded-2xl p-6 border border-gray-100 dark:border-[#2A2A30] flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E5322D] text-white text-xs flex items-center justify-center font-black">
                    {idx + 1}
                  </span>
                  <span>{guide.title}</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                  {guide.steps.map((st, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="text-[#E5322D] font-bold">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {lang === 'id' ? 'Pertanyaan yang sering diajukan mengenai layanan KlikPDF.' : 'Common questions about KlikPDF services.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#18181B] rounded-2xl border border-gray-200 dark:border-[#27272A] overflow-hidden shadow-xs transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-gray-900 dark:text-white hover:text-[#E5322D] dark:hover:text-[#ff6b66] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-lg font-black ml-4 text-gray-400">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-[#27272A] pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

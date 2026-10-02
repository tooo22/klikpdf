import React, { useState, useEffect, useRef } from 'react';
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
    // 1. Record visit ONCE per browser session
    const recordVisitOncePerSession = async () => {
      if (sessionStorage.getItem('klikpdf_session_visited')) return;
      sessionStorage.setItem('klikpdf_session_visited', 'true');

      try {
        const res = await fetch(`https://api.visitorbadge.io/api/visitors?path=klikpdf.my.id`);
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
        // Silently ignore if offline
      }
    };

    recordVisitOncePerSession();

    // 2. Real-Time Active Users Heartbeat Presence
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

      broadcastHeartbeat();
      heartbeatInterval = setInterval(broadcastHeartbeat, 2000);
      cleanupInterval = setInterval(updateCount, 2000);

      const handleUnload = () => {
        if (channel) {
          channel.postMessage({ type: 'LEAVE', tabId: myTabId });
        }
      };

      window.addEventListener('beforeunload', handleUnload);

      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (cleanupInterval) clearInterval(cleanupInterval);
        if (channel) {
          channel.postMessage({ type: 'LEAVE', tabId: myTabId });
          channel.close();
        }
      };
    } catch (e) {
      setActiveUsers(1);
      return () => {};
    }
  }, []);

  const [isHeroDragging, setIsHeroDragging] = useState(false);
  const heroFileInputRef = useRef(null);

  // Before / After Comparison Slider Value (0 to 100)
  const [comparisonValue, setComparisonValue] = useState(50);

  // Category and Tools Filter
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAllTools, setShowAllTools] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  // Smart Contextual Action Modal for Dropped/Selected Files
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);

  const handleHeroFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setDroppedFiles(fileList);
    setShowActionModal(true);
  };

  const handleQuickModalAction = (toolId) => {
    setShowActionModal(false);
    onSelectTool(toolId, droppedFiles);
  };

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
      a: lang === 'id' ? 'Sangat aman. Seluruh proses pengolahan dokumen dilakukan melalui jalur terenkripsi HTTPS/SSL 256-bit berstandar tinggi, dan berkas sementara akan dihapus secara otomatis dari server segera setelah pemrosesan selesai.' : 'Extremely secure. All processing is transmitted via high-grade 256-bit HTTPS/SSL encryption and temporary files are automatically deleted.'
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

  return (
    <div className="w-full">
      {/* SECTION 1: SPLIT HERO & COMPACT DROPZONE */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-white via-surface-canvas to-surface-low/30 dark:from-[#0f1117] dark:via-[#12151f] dark:to-[#0f1117] pt-8 pb-16 lg:py-16 transition-colors duration-200">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-20 w-[420px] h-[420px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Headline & Copy & Social Proof */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Trust Badge with Live Active Users */}
              <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#18181B] border border-border-subtle/80 dark:border-slate-800 shadow-xs mb-6 text-xs">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                </span>
                <span className="font-bold text-text-primary dark:text-white">
                  100% Gratis & Tanpa Batas
                </span>
                <span className="w-1 h-1 rounded-full bg-border-strong dark:bg-slate-700"></span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span> Bebas Watermark
                </span>
                <span className="w-1 h-1 rounded-full bg-border-strong dark:bg-slate-700 hidden sm:inline"></span>
                {/* Live Online Indicator */}
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{activeUsers} Online</span>
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-text-primary dark:text-white tracking-tight leading-[1.12] mb-5">
                Olah Dokumen PDF <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-500 to-red-600">
                  Lebih Cepat & Praktis
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-secondary dark:text-slate-300 leading-relaxed mb-8 max-w-xl">
                Gabungkan berkas, kompres hingga 85%, atau ubah format PDF ke Word dalam hitungan detik. Cukup seret file Anda langsung ke kotak di samping.
              </p>

              {/* Quick CTA buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-10">
                <button
                  onClick={() => {
                    const el = document.getElementById('dropzone-box');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  <span>Unggah Dokumen Sekarang</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('bento-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-surface-subtle dark:hover:bg-slate-800 text-text-primary dark:text-white border border-border-subtle dark:border-slate-800 font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Jelajahi 24+ Alat</span>
                  <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                </button>
              </div>

              {/* Social proof & rating */}
              <div className="pt-6 border-t border-border-subtle/80 dark:border-slate-800 flex items-center gap-6 w-full">
                <div className="flex items-center -space-x-2">
                  <div className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-[#18181B] bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                    AK
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-[#18181B] bg-rose-200 dark:bg-rose-950 flex items-center justify-center font-bold text-xs text-rose-800 dark:text-rose-200">
                    DR
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-[#18181B] bg-amber-200 dark:bg-amber-950 flex items-center justify-center font-bold text-xs text-amber-800 dark:text-amber-200">
                    RP
                  </div>
                  <div className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-[#18181B] bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-xs font-black text-primary">
                    +{totalVisits > 1000 ? `${Math.floor(totalVisits / 1000)}k` : totalVisits}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-text-primary dark:text-white">4.9 / 5.0</span>
                  </div>
                  <span className="text-xs text-secondary dark:text-slate-400">
                    Dipercaya oleh {totalVisits.toLocaleString('id-ID')}+ kunjungan pengguna di Indonesia
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Compact Interactive Tool Box & Action Selector */}
            <div className="lg:col-span-6 w-full" id="dropzone-box">
              <div className="relative bg-white dark:bg-[#18181B] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-border-subtle/90 dark:border-slate-800 p-5 sm:p-7 transition-all duration-300">
                {/* Dropzone Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle/80 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">upload_file</span>
                    <span>Upload & Pengolahan Dokumen</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Server Ready</span>
                  </span>
                </div>

                {/* Compact Dropzone Area */}
                <input
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  id="hero-file-input"
                  ref={heroFileInputRef}
                  multiple
                  type="file"
                  onChange={(e) => handleHeroFiles(e.target.files)}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsHeroDragging(true);
                  }}
                  onDragLeave={() => setIsHeroDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsHeroDragging(false);
                    handleHeroFiles(e.dataTransfer.files);
                  }}
                  onClick={() => heroFileInputRef.current?.click()}
                  className={`w-full rounded-2xl border-2 border-dashed p-7 sm:p-9 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
                    isHeroDragging
                      ? 'border-primary bg-rose-50/70 dark:bg-rose-950/40 ring-4 ring-rose-500/20 scale-[1.01]'
                      : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/15 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 hover:border-primary'
                  }`}
                >
                  {/* Central Icon Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#232733] shadow-md text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-[32px]">
                      cloud_upload
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-text-primary dark:text-white mb-1">
                    Tarik & Lepaskan File Anda Di Sini
                  </h3>

                  <p className="text-xs sm:text-sm text-text-muted dark:text-slate-400 mb-5 max-w-sm">
                    Mendukung file PDF, Word (.docx), Excel, PowerPoint, atau Foto (JPG/PNG). Pilih file untuk opsi pengolahan instan.
                  </p>

                  <button
                    className="h-11 px-6 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm shadow-primary/20 transition-transform active:scale-95 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Pilih Berkas Dokumen</span>
                  </button>
                </div>

                {/* Cloud Import and Security Badges */}
                <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Impor:</span>
                    <button
                      onClick={() => heroFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-subtle dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-text-primary dark:text-slate-200 transition-colors cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#4285F4]">cloud</span>
                      <span>Drive</span>
                    </button>
                    <button
                      onClick={() => heroFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-subtle dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-text-primary dark:text-slate-200 transition-colors cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#0061FE]">folder_shared</span>
                      <span>Dropbox</span>
                    </button>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>Enkripsi SSL 256-bit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BENTO PRODUCTIVITY GRID */}
      <section className="w-full py-16 lg:py-20 bg-surface dark:bg-[#0c0e14] transition-colors duration-200" id="bento-grid">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Bento Productivity Suite
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-text-primary dark:text-white tracking-tight mt-1">
                Alat PDF Paling Sering Digunakan
              </h2>
              <p className="text-sm sm:text-base text-secondary dark:text-slate-300 mt-2">
                Didesain dengan antarmuka presisi tinggi untuk mempermudah alur kerja dokumen harian Anda.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted dark:text-slate-400">Status:</span>
              <span className="text-xs font-bold text-text-primary dark:text-white bg-white dark:bg-[#18181B] px-3 py-1 rounded-full border border-border-subtle dark:border-slate-800 shadow-xs">
                24 Alat Berjalan Normal
              </span>
            </div>
          </div>

          {/* Bento Grid Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* BENTO HERO CARD 1: KOMPRES PDF (Span 7 col) */}
            <div 
              onClick={() => onSelectTool('compress')}
              className="lg:col-span-7 bg-white dark:bg-[#18181B] rounded-3xl border border-border-subtle/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
            >
              <div className="absolute -right-16 -top-16 w-52 h-52 bg-rose-50 dark:bg-rose-950/30 rounded-full blur-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">compress</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-xs shadow-primary/20">
                    Paling Populer
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  Kompres PDF Pintar
                </h3>
                <p className="text-sm text-secondary dark:text-slate-300 mt-1.5 max-w-md">
                  Kecilkan volume file dokumen hingga 85% tanpa mengorbankan ketajaman teks atau diagram.
                </p>

                {/* Interactive mini graphic visualization */}
                <div className="mt-6 p-4 rounded-2xl bg-surface-canvas dark:bg-[#12151f] border border-border-subtle/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-text-primary dark:text-white mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Optimalisasi Ukuran
                    </span>
                    <span className="text-primary font-bold">Hemat 82%</span>
                  </div>
                  {/* Progress bar comparison */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '18%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-text-muted dark:text-slate-400 mt-2">
                    <span>Ukuran Awal: <strong className="text-slate-700 dark:text-slate-200">15.0 MB</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Hasil Akhir: 1.8 MB</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-text-muted dark:text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">speed</span> Proses &lt; 3 detik
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Coba Kompres Sekarang</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* BENTO HERO CARD 2: GABUNGKAN PDF (Span 5 col) */}
            <div 
              onClick={() => onSelectTool('merge')}
              className="lg:col-span-5 bg-white dark:bg-[#18181B] rounded-3xl border border-border-subtle/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">call_merge</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    Praktis
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  Gabungkan PDF
                </h3>
                <p className="text-sm text-secondary dark:text-slate-300 mt-1.5">
                  Satukan beragam laporan, halaman terpisah, dan scan dalam susunan berurutan.
                </p>

                {/* Stacked Preview Visual */}
                <div className="mt-6 flex items-center justify-center gap-2 py-2">
                  <div className="w-16 h-20 rounded-lg bg-surface-subtle dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col items-center justify-center text-[10px] font-bold text-slate-500 -rotate-6 transform group-hover:-rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-rose-500 text-[18px]">description</span>
                    <span>Bab 1</span>
                  </div>
                  <div className="w-16 h-20 rounded-lg bg-white dark:bg-[#202431] border-2 border-primary shadow-md flex flex-col items-center justify-center text-[10px] font-bold text-primary z-10 scale-105">
                    <span className="material-symbols-outlined text-primary text-[20px]">add</span>
                    <span>Bab 2</span>
                  </div>
                  <div className="w-16 h-20 rounded-lg bg-surface-subtle dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col items-center justify-center text-[10px] font-bold text-slate-500 rotate-6 transform group-hover:rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-rose-500 text-[18px]">description</span>
                    <span>Bab 3</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-text-muted dark:text-slate-400">Drag & drop urutan</span>
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Gabungkan Berkas</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* BENTO MICRO-CARD 3: PDF ke Word (Span 4 col) */}
            <div 
              onClick={() => onSelectTool('pdf-to-word')}
              className="lg:col-span-4 bg-white dark:bg-[#18181B] rounded-2xl border border-border-subtle/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">description</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">DOCX</span>
                </div>
                <h4 className="text-base font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  PDF ke Word
                </h4>
                <p className="text-xs text-secondary dark:text-slate-300 mt-1 leading-relaxed">
                  Konversi presisi tinggi dengan layout teks, tabel, dan format tetap utuh.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary">
                <span>Buka Alat</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* BENTO MICRO-CARD 4: Pisahkan PDF (Span 4 col) */}
            <div 
              onClick={() => onSelectTool('split')}
              className="lg:col-span-4 bg-white dark:bg-[#18181B] rounded-2xl border border-border-subtle/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">call_split</span>
                  </div>
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">Selektif</span>
                </div>
                <h4 className="text-base font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  Pisahkan PDF
                </h4>
                <p className="text-xs text-secondary dark:text-slate-300 mt-1 leading-relaxed">
                  Ambil halaman tertentu atau pecah setiap lembar menjadi dokumen terpisah.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary">
                <span>Buka Alat</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* BENTO MICRO-CARD 5: Tanda Tangan Digital (Span 4 col) */}
            <div 
              onClick={() => onSelectTool('sign')}
              className="lg:col-span-4 bg-white dark:bg-[#18181B] rounded-2xl border border-border-subtle/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">draw</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Legal e-Sign</span>
                </div>
                <h4 className="text-base font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  Tanda Tangan PDF
                </h4>
                <p className="text-xs text-secondary dark:text-slate-300 mt-1 leading-relaxed">
                  Bubuhkan paraf atau tanda tangan legal dalam beberapa detik di ponsel atau PC.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary">
                <span>Buka Alat</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* BENTO MICRO-CARD 6: Kunci & Enkripsi (Span 3 col) */}
            <div 
              onClick={() => onSelectTool('protect')}
              className="lg:col-span-3 bg-white dark:bg-[#18181B] rounded-2xl border border-border-subtle/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-200 flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  Kunci Dokumen
                </h5>
                <span className="text-[11px] text-text-muted dark:text-slate-400">Sandi 128-bit</span>
              </div>
            </div>

            {/* BENTO MICRO-CARD 7: PDF ke Excel (Span 3 col) */}
            <div 
              onClick={() => onSelectTool('pdf-to-excel')}
              className="lg:col-span-3 bg-white dark:bg-[#18181B] rounded-2xl border border-border-subtle/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-200 flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">table_chart</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  PDF ke Excel
                </h5>
                <span className="text-[11px] text-text-muted dark:text-slate-400">Ekstrak tabel instan</span>
              </div>
            </div>

            {/* BENTO MICRO-CARD 8: Putar & Atur Hal (Span 3 col) */}
            <div 
              onClick={() => onSelectTool('rotate')}
              className="lg:col-span-3 bg-white dark:bg-[#18181B] rounded-2xl border border-border-subtle/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-200 flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">rotate_right</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  Putar Halaman
                </h5>
                <span className="text-[11px] text-text-muted dark:text-slate-400">Orientasi bebas</span>
              </div>
            </div>

            {/* BENTO MICRO-CARD 9: Watermark PDF (Span 3 col) */}
            <div 
              onClick={() => onSelectTool('watermark')}
              className="lg:col-span-3 bg-white dark:bg-[#18181B] rounded-2xl border border-border-subtle/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-200 flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">branding_watermark</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                  Watermark PDF
                </h5>
                <span className="text-[11px] text-text-muted dark:text-slate-400">Proteksi hak cipta</span>
              </div>
            </div>
          </div>

          {/* View all button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => {
                setShowAllTools(true);
                const el = document.getElementById('semua-alat');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#18181B] border border-border-subtle dark:border-slate-800 hover:border-primary text-text-primary dark:text-white font-bold text-xs sm:text-sm shadow-xs transition-all hover:shadow-md cursor-pointer"
            >
              <span>Lihat Semua 24+ Alat KlikPDF</span>
              <span className="material-symbols-outlined text-[18px] text-primary">east</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: LIVE PREVIEW PERBANDINGAN SEBELUM VS SESUDAH KOMPRESI */}
      <section className="w-full py-16 lg:py-20 bg-surface-canvas dark:bg-[#0f1117] border-y border-border-subtle/80 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Teknologi Kompresi Adaptif
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text-primary dark:text-white tracking-tight mt-1">
              Kecilkan Ukuran Dokumen, Pertahankan Kualitas Asli
            </h2>
            <p className="text-sm sm:text-base text-secondary dark:text-slate-300 mt-2">
              Geser slider di bawah untuk menguji perbandingan kualitas teks dan grafis dokumen sebelum vs sesudah dikompresi.
            </p>
          </div>

          {/* Interactive Comparison Container */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 shadow-xl border border-border-subtle dark:border-slate-800">
            {/* Top Comparison Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 mb-6 border-b border-border-subtle/80 dark:border-slate-800 text-center">
              <div className="p-3 rounded-2xl bg-surface-subtle dark:bg-[#12151f]">
                <span className="text-xs text-text-muted dark:text-slate-400 font-medium block">Sebelum Kompresi</span>
                <span className="text-xl sm:text-2xl font-extrabold text-text-primary dark:text-white">15.0 MB</span>
                <span className="text-[11px] text-secondary dark:text-slate-400">Lambat saat dikirim email</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex flex-col justify-center items-center">
                <span className="text-xs text-primary font-bold block">Penyusutan Efisien</span>
                <span className="text-xl sm:text-2xl font-extrabold text-primary">-88%</span>
                <span className="text-[11px] text-primary font-medium">Kualitas tetap 100% tajam</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block">Hasil Sesudah Kompres</span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">1.8 MB</span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Siap kirim via WhatsApp & Email</span>
              </div>
            </div>

            {/* Document Visual Preview Canvas with Split Mockup */}
            <div className="relative w-full h-[280px] sm:h-[340px] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-border-subtle dark:border-slate-800 select-none">
              {/* BEFORE BACKGROUND (Full view) */}
              <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#131622] p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-500 text-[24px]">picture_as_pdf</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        Laporan_Tahunan_Keuangan_2025.pdf
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      15.0 MB
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="h-4 bg-slate-300/80 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="h-20 bg-rose-100/60 dark:bg-rose-950/30 rounded-xl p-3 flex flex-col justify-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Grafik Neraca Q4</span>
                        <div className="h-2 bg-rose-300 dark:bg-rose-800 rounded mt-2 w-2/3"></div>
                      </div>
                      <div className="h-20 bg-slate-200/60 dark:bg-slate-800 rounded-xl p-3 flex flex-col justify-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Matriks Pertumbuhan</span>
                        <div className="h-2 bg-slate-400 dark:bg-slate-600 rounded mt-2 w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <span>Halaman 1 dari 48</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                    ORIGINAL (15 MB)
                  </span>
                </div>
              </div>

              {/* AFTER LAYER (Clipped overlay) */}
              <div 
                className="absolute inset-0 bg-white dark:bg-[#1a1e2b] p-6 sm:p-8 flex flex-col justify-between border-r-2 border-primary overflow-hidden"
                style={{ width: `${comparisonValue}%` }}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                      <span className="font-bold text-sm text-text-primary dark:text-white truncate">
                        Laporan_Tahunan_Keuangan_2025_Kompres.pdf
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      1.8 MB
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="h-4 bg-slate-800 dark:bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-400 dark:bg-slate-500 rounded w-full"></div>
                    <div className="h-3 bg-slate-400 dark:bg-slate-500 rounded w-5/6"></div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="h-20 bg-primary/10 dark:bg-primary/20 rounded-xl p-3 flex flex-col justify-center">
                        <span className="text-xs font-bold text-primary">Grafik Neraca Q4 (Jernih)</span>
                        <div className="h-2 bg-primary rounded mt-2 w-2/3"></div>
                      </div>
                      <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl p-3 flex flex-col justify-center">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Matriks Pertumbuhan</span>
                        <div className="h-2 bg-slate-500 rounded mt-2 w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
                  <span>Presisi Teks 100% Terjaga</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                    HASIL KOMPRES (1.8 MB)
                  </span>
                </div>
              </div>

              {/* SLIDER HANDLE */}
              <div 
                className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center justify-center"
                style={{ left: `calc(${comparisonValue}% - 16px)` }}
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg ring-4 ring-white/80 dark:ring-slate-900 cursor-ew-resize">
                  <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                </div>
              </div>
            </div>

            {/* Slider Range Input Control */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hasil (1.8 MB)</span>
              <input
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                max="100"
                min="0"
                type="range"
                value={comparisonValue}
                onChange={(e) => setComparisonValue(Number(e.target.value))}
              />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Asli (15 MB)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: 3-STEP FLOW */}
      <section className="w-full py-16 lg:py-20 bg-surface dark:bg-[#0c0e14] transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Cepat & Tanpa Ribet
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text-primary dark:text-white tracking-tight mt-1">
              Selesai dalam 3 Langkah
            </h2>
            <p className="text-sm sm:text-base text-secondary dark:text-slate-300 mt-2">
              Didesain praktis tanpa pendaftaran wajib agar dokumen Anda selesai seketika.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-border-subtle/90 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-4xl font-black text-slate-100 dark:text-slate-800 group-hover:text-rose-100 dark:group-hover:text-rose-950 transition-colors absolute top-4 right-5 select-none">
                01
              </span>
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">
                1. Pilih / Tarik File
              </h3>
              <p className="text-xs sm:text-sm text-secondary dark:text-slate-400 leading-relaxed">
                Unggah berkas PDF dari komputer, smartphone, Google Drive, atau Dropbox secara instan.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-border-subtle/90 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-4xl font-black text-slate-100 dark:text-slate-800 group-hover:text-rose-100 dark:group-hover:text-rose-950 transition-colors absolute top-4 right-5 select-none">
                02
              </span>
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">instant_mix</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">
                2. Proses Otomatis
              </h3>
              <p className="text-xs sm:text-sm text-secondary dark:text-slate-400 leading-relaxed">
                Pilih preferensi Anda. Server cloud KlikPDF memproses kompresi atau konversi secepat kilat.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-border-subtle/90 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-4xl font-black text-slate-100 dark:text-slate-800 group-hover:text-rose-100 dark:group-hover:text-rose-950 transition-colors absolute top-4 right-5 select-none">
                03
              </span>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">file_download_done</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">
                3. Unduh Dokumen
              </h3>
              <p className="text-xs sm:text-sm text-secondary dark:text-slate-400 leading-relaxed">
                Simpan hasil file yang sudah rapi ke perangkat Anda atau salin tautan berbagi langsung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: BOTTOM HIGH-CONVERSION CTA BANNER */}
      <section className="w-full py-12 lg:py-16 bg-surface dark:bg-[#0c0e14] transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 dark:bg-[#141724] text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-800">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="max-w-xl relative z-10 text-center lg:text-left">
              <span className="px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-semibold inline-block mb-3">
                Siap Tingkatkan Efisiensi Kerja?
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Olah Dokumen Anda Sekarang dengan KlikPDF
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2">
                Bebas biaya langganan, tanpa batasan rumit, dan terenkripsi aman secara otomatis.
              </p>
            </div>

            <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
                onClick={() => {
                  const el = document.getElementById('dropzone-box');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                type="button"
              >
                <span>Mulai Sekarang Gratis</span>
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: COMPLETE 24+ TOOLS CATALOG WITH FILTER TABS */}
      <section className="w-full py-16 bg-surface-canvas dark:bg-[#0f1117] border-t border-border-subtle/80 dark:border-slate-800 transition-colors duration-200" id="semua-alat">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-primary font-bold text-xs uppercase tracking-wider mb-4 border border-rose-200 dark:border-rose-900/40 shadow-xs">
              <Sparkles size={14} />
              <span>{t('hero.badge') || 'Semua Alat PDF & Gambar'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary dark:text-white tracking-tight leading-tight mb-3">
              Katalog Lengkap Alat KlikPDF
            </h2>
            <p className="text-sm sm:text-base text-secondary dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Pilih dari 24+ alat gratis untuk memproses, mengonversi, memproteksi, dan mengoptimalkan dokumen Anda.
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
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                      : 'bg-white dark:bg-[#18181B] text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-border-subtle dark:border-slate-800'
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

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight mb-2">
                Frequently Asked Questions (FAQ)
              </h2>
              <p className="text-xs sm:text-sm text-secondary dark:text-slate-400">
                {lang === 'id' ? 'Pertanyaan yang sering diajukan mengenai layanan KlikPDF.' : 'Common questions about KlikPDF services.'}
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-[#18181B] rounded-2xl border border-border-subtle dark:border-slate-800 overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-text-primary dark:text-white hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg font-black ml-4 text-slate-400">
                      {openFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-secondary dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contextual Action Modal when user drops or selects any file */}
      {showActionModal && droppedFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-border-subtle dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5 pb-4 border-b border-border-subtle/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">task_alt</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-text-primary dark:text-white">
                    Mau Diapakan File Ini?
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted dark:text-slate-400">
                    <span className="font-semibold text-primary truncate max-w-[200px] sm:max-w-[320px]">
                      {droppedFiles[0]?.name}
                    </span>
                    {droppedFiles[0]?.size && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-surface-subtle dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {(droppedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowActionModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-surface-subtle dark:hover:bg-slate-800 text-lg font-bold transition-colors cursor-pointer"
                title="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Smart Contextual Options based on File Type */}
            {(() => {
              const fileName = droppedFiles[0]?.name?.toLowerCase() || '';
              const isWord = /\.(docx?|doc)$/i.test(fileName);
              const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(fileName) || droppedFiles[0]?.type?.startsWith('image/');
              const isExcel = /\.(xlsx?|xls)$/i.test(fileName);
              const isPpt = /\.(pptx?|ppt)$/i.test(fileName);

              // 1. WORD FILE DETECTED
              if (isWord) {
                return (
                  <div className="my-4 space-y-4">
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        <span>Dokumen Microsoft Word Terdeteksi</span>
                      </div>
                      <p className="text-xs text-blue-600/90 dark:text-blue-400/90">
                        Klik tombol di bawah untuk langsung mengubah dokumen Word Anda menjadi format PDF siap cetak.
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickModalAction('word-to-pdf')}
                      className="w-full p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-left transition-all duration-200 flex items-center justify-between shadow-lg shadow-blue-500/25 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px] text-white">description</span>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black">Word ke PDF (Konversi Otomatis)</div>
                          <div className="text-xs text-blue-100 font-normal mt-0.5">
                            Tata letak, font, tabel, dan gambar terjaga 100% rapi
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                );
              }

              // 2. IMAGE FILE DETECTED
              if (isImage) {
                return (
                  <div className="my-4 space-y-3">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                      Pilih Tindakan untuk Gambar/Foto Anda:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleQuickModalAction('hd-image')}
                        className="p-5 text-left rounded-2xl border-2 border-purple-500/60 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-xs"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-[22px]">auto_fix_high</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            HD-kan Foto (AI Upscale)
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Pertajam dan tingkatkan resolusi foto buram hingga 4x Ultra HD.
                          </p>
                        </div>
                        <span className="mt-4 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <span>Tingkatkan Resolusi</span>
                          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </span>
                      </button>

                      <button
                        onClick={() => handleQuickModalAction('image-to-pdf')}
                        className="p-5 text-left rounded-2xl border-2 border-orange-500/60 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-xs"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300 flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-[22px]">image</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                            Gambar ke PDF
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Ubah foto JPG/PNG menjadi lembar dokumen PDF siap cetak.
                          </p>
                        </div>
                        <span className="mt-4 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <span>Konversi ke PDF</span>
                          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </span>
                      </button>
                    </div>
                  </div>
                );
              }

              // 3. EXCEL FILE DETECTED
              if (isExcel) {
                return (
                  <div className="my-4 space-y-3">
                    <button
                      onClick={() => handleQuickModalAction('excel-to-pdf')}
                      className="w-full p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-left transition-all duration-200 flex items-center justify-between shadow-lg shadow-emerald-500/25 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px] text-white">table_chart</span>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black">Excel ke PDF</div>
                          <div className="text-xs text-emerald-100 font-normal mt-0.5">
                            Konversi tabel spreadsheet menjadi dokumen PDF rapi
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                );
              }

              // 4. POWERPOINT FILE DETECTED
              if (isPpt) {
                return (
                  <div className="my-4 space-y-3">
                    <button
                      onClick={() => handleQuickModalAction('powerpoint-to-pdf')}
                      className="w-full p-5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-left transition-all duration-200 flex items-center justify-between shadow-lg shadow-orange-500/25 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px] text-white">slideshow</span>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black">PowerPoint ke PDF</div>
                          <div className="text-xs text-orange-100 font-normal mt-0.5">
                            Ubah slide presentasi PowerPoint menjadi file PDF
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                );
              }

              // 5. PDF FILE DETECTED (DEFAULT POPULAR PDF ACTIONS)
              return (
                <div className="my-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-slate-400 mb-3">
                    Pilih Tindakan untuk Dokumen PDF Anda:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Action 1: Kompres PDF */}
                    <button
                      onClick={() => handleQuickModalAction('compress')}
                      className="p-4 rounded-2xl border border-border-subtle dark:border-slate-800 hover:border-primary hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">compress</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>Kompres PDF</span>
                          <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">Populer</span>
                        </div>
                        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 leading-snug">
                          Kecilkan ukuran file s/d 85% untuk email
                        </p>
                      </div>
                    </button>

                    {/* Action 2: Gabungkan PDF */}
                    <button
                      onClick={() => handleQuickModalAction('merge')}
                      className="p-4 rounded-2xl border border-border-subtle dark:border-slate-800 hover:border-primary hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">call_merge</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                          Gabungkan PDF
                        </div>
                        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 leading-snug">
                          Satukan dengan file PDF lainnya
                        </p>
                      </div>
                    </button>

                    {/* Action 3: PDF ke Word */}
                    <button
                      onClick={() => handleQuickModalAction('pdf-to-word')}
                      className="p-4 rounded-2xl border border-border-subtle dark:border-slate-800 hover:border-primary hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">description</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                          PDF ke Word
                        </div>
                        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 leading-snug">
                          Ubah ke berkas DOCX yang bisa diedit
                        </p>
                      </div>
                    </button>

                    {/* Action 4: Pisahkan PDF */}
                    <button
                      onClick={() => handleQuickModalAction('split')}
                      className="p-4 rounded-2xl border border-border-subtle dark:border-slate-800 hover:border-primary hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">call_split</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                          Pisahkan PDF
                        </div>
                        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 leading-snug">
                          Ambil lembar tertentu atau pecah per hal
                        </p>
                      </div>
                    </button>

                    {/* Action 5: Tanda Tangan PDF */}
                    <button
                      onClick={() => handleQuickModalAction('sign')}
                      className="p-4 rounded-2xl border border-border-subtle dark:border-slate-800 hover:border-primary hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">draw</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                          Tanda Tangan PDF
                        </div>
                        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 leading-snug">
                          Bubuhkan tanda tangan atau paraf digital
                        </p>
                      </div>
                    </button>

                    {/* Action 6: Kunci Dokumen */}
                    <button
                      onClick={() => handleQuickModalAction('protect')}
                      className="p-4 rounded-2xl border border-border-subtle dark:border-slate-800 hover:border-primary hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">lock</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                          Kunci Dokumen
                        </div>
                        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 leading-snug">
                          Proteksi PDF dengan kata sandi enkripsi
                        </p>
                      </div>
                    </button>

                    {/* Action 7: PDF ke Excel */}
                    <button
                      onClick={() => handleQuickModalAction('pdf-to-excel')}
                      className="p-4 rounded-2xl border border-border-subtle dark:border-slate-800 hover:border-primary hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">table_chart</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                          PDF ke Excel
                        </div>
                        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 leading-snug">
                          Ekstrak data tabel ke spreadsheet Excel
                        </p>
                      </div>
                    </button>

                    {/* Action 8: Putar Halaman */}
                    <button
                      onClick={() => handleQuickModalAction('rotate')}
                      className="p-4 rounded-2xl border border-border-subtle dark:border-slate-800 hover:border-primary hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">rotate_right</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                          Putar Halaman
                        </div>
                        <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 leading-snug">
                          Ubah orientasi dokumen yang miring
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-border-subtle/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  heroFileInputRef.current?.click();
                }}
                className="text-secondary dark:text-slate-400 hover:text-primary flex items-center gap-1 font-semibold cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>Pilih Berkas Lain</span>
              </button>

              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-subtle dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                type="button"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

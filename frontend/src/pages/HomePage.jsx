import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TOOLS } from '../toolsConfig';
import { ToolCard } from '../components/ToolCard';
import { Sparkles } from 'lucide-react';

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
        clearInterval(heartbeatInterval);
        clearInterval(cleanupInterval);
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

  // Operations dropdown popover in the command console
  const [showOperationsMenu, setShowOperationsMenu] = useState(false);
  const operationsMenuRef = useRef(null);

  // Keyboard shortcut Ctrl+K / Cmd+K to open file uploader
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        heroFileInputRef.current?.click();
      }
    };

    const handleClickOutside = (e) => {
      if (operationsMenuRef.current && !operationsMenuRef.current.contains(e.target)) {
        setShowOperationsMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Before / After Comparison Slider Value (0 to 100)
  const [comparisonValue, setComparisonValue] = useState(50);

  const handleComparisonTouch = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setComparisonValue(Math.round(percent));
  };

  // Category and Tools Filter
  const [activeCategory, setActiveCategory] = useState('all');
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
      a: lang === 'id' ? 'Cukup pilih alat "Gabung PDF", unggah dua atau lebih dokumen PDF Anda, atur urutan halaman sesuai keinginan, lalu klik "Proses Sekarang" untuk mengunduh hasilnya.' : 'Select the "Merge PDF" tool, upload 2 or more files, arrange order, and click "Process Now".'
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
    <div className="w-full overflow-x-hidden stitch-grid dark:bg-black bg-white text-zinc-900 dark:text-white transition-colors duration-200">
      {/* HERO SECTION: Google Stitch Minimal Aesthetic (Black Background + Plain White Text + Grid Lines) */}
      <section className="relative w-full pt-10 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto flex flex-col items-center text-center">
        {/* Capsule Badge (Monochrome & Minimalist) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-6 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-all cursor-default">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">
            <span className="material-symbols-outlined text-[11px]">auto_awesome</span>
          </span>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">
            {lang === 'id' ? 'Solusi Dokumen Serba Cepat & Aman' : 'All-in-One Fast & Secure Document Solution'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 uppercase font-bold tracking-wider">
            v2.4
          </span>
        </div>

        {/* Main Headline (Pure Plain White Text in Dark Mode, No Gradient Colors) */}
        <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold text-zinc-950 dark:text-white max-w-4xl tracking-tight leading-[1.12] mb-5">
          {lang === 'id'
            ? 'Kelola & Sempurnakan PDF dalam Hitungan Detik'
            : 'Manage & Perfect PDFs in Seconds'}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-9 leading-relaxed">
          {lang === 'id'
            ? 'Platform all-in-one untuk menggabungkan, mengompres, mengonversi, dan memproteksi dokumen PDF tanpa kompromi kualitas. Aman, privat, dan langsung di peramban Anda.'
            : 'All-in-one platform to merge, compress, convert, and protect PDF documents without compromising quality. Fast, private, and 100% in your browser.'}
        </p>

        {/* Signature Floating Command & Dropzone Console (Black + Hairline Border) */}
        <div
          className="w-full max-w-[760px] bg-white dark:bg-black rounded-2xl p-3 shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 relative group text-left"
          id="command-console"
        >
          {/* Input / Drop Area */}
          <div
            id="dropzone"
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
            className={`w-full rounded-xl p-5 sm:p-6 transition-all duration-200 flex flex-col items-start text-left cursor-pointer border ${
              isHeroDragging
                ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 ring-2 ring-zinc-500/20'
                : 'bg-zinc-50 dark:bg-zinc-950/80 hover:bg-zinc-100/90 dark:hover:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800/90'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2 w-full">
              <span className="material-symbols-outlined text-zinc-900 dark:text-white text-[22px]">upload_file</span>
              <span className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                {lang === 'id' ? 'Tarik & lepas berkas di sini' : 'Drag & drop files here'}
              </span>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-300/60 dark:border-zinc-700/60">
                {lang === 'id' ? 'Maks. 100MB' : 'Max 100MB'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 w-full select-none leading-relaxed" id="drop-text">
              {lang === 'id'
                ? 'Pilih berkas dari penyimpanan lokal, Google Drive, atau ketik nama operasi (misal: "Kompres 200KB", "Gabung Faktur", "Ubah ke Word")...'
                : 'Choose files from local storage, Google Drive, or choose an operation (e.g. "Compress 200KB", "Merge Invoices", "PDF to Word")...'}
            </p>

            {/* Hidden Native File Input */}
            <input
              ref={heroFileInputRef}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              className="hidden"
              id="file-uploader"
              multiple
              type="file"
              onChange={(e) => handleHeroFiles(e.target.files)}
            />
          </div>

          {/* Micro Action Toolbar at Box Bottom */}
          <div className="mt-3 px-2 pt-1 pb-1 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                onClick={() => heroFileInputRef.current?.click()}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-zinc-500 dark:text-zinc-400">folder_open</span>
                <span>{lang === 'id' ? 'Pilih Berkas' : 'Select Files'}</span>
              </button>

              {/* Quick Operation Dropdown Menu */}
              <div className="relative" ref={operationsMenuRef}>
                <button
                  onClick={() => setShowOperationsMenu(!showOperationsMenu)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-zinc-500 dark:text-zinc-400">tune</span>
                  <span>{lang === 'id' ? 'Pilih Operasi' : 'Select Operation'}</span>
                  <span className="material-symbols-outlined text-[14px] text-zinc-500 dark:text-zinc-400">expand_more</span>
                </button>

                {showOperationsMenu && (
                  <div className="absolute left-0 bottom-full mb-2 w-56 bg-white dark:bg-zinc-950 rounded-xl p-1.5 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 px-2 py-1 tracking-wider">
                      {lang === 'id' ? 'Aksi Cepat' : 'Quick Actions'}
                    </div>
                    <button
                      onClick={() => {
                        setShowOperationsMenu(false);
                        onSelectTool('merge');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-zinc-900 dark:text-white">call_merge</span>
                      <span>{lang === 'id' ? 'Gabung Banyak PDF' : 'Merge Multiple PDFs'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOperationsMenu(false);
                        onSelectTool('compress');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-zinc-900 dark:text-white">compress</span>
                      <span>{lang === 'id' ? 'Kompresi Ringan/Kuat' : 'Smart Compression'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOperationsMenu(false);
                        onSelectTool('pdf-to-word');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-zinc-900 dark:text-white">description</span>
                      <span>{lang === 'id' ? 'Konversi ke Dokumen Word' : 'Convert to Word DOCX'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOperationsMenu(false);
                        onSelectTool('sign');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-zinc-900 dark:text-white">draw</span>
                      <span>{lang === 'id' ? 'Tanda Tangan Digital' : 'Sign PDF Document'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOperationsMenu(false);
                        onSelectTool('ocr');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-zinc-900 dark:text-white">document_scanner</span>
                      <span>{lang === 'id' ? 'OCR Ekstraksi Teks' : 'OCR Text Extraction'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-xs font-medium border border-zinc-200 dark:border-zinc-800">
                <span className="material-symbols-outlined text-[15px] text-emerald-500">lock</span>
                <span>{lang === 'id' ? 'Enkripsi Klien 256-Bit' : '256-Bit Client Encryption'}</span>
              </div>
            </div>

            {/* Right submit action button */}
            <div className="flex items-center gap-2">
              <span
                onClick={() => heroFileInputRef.current?.click()}
                className="hidden md:inline-flex text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
                title={lang === 'id' ? 'Tekan ⌘K atau Ctrl+K untuk upload' : 'Press ⌘K or Ctrl+K to upload'}
              >
                ⌘K
              </span>
              <button
                aria-label={lang === 'id' ? 'Jalankan Proses' : 'Execute Process'}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-zinc-950 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer font-bold"
                onClick={() => heroFileInputRef.current?.click()}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Pill Badges below console */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-zinc-500 dark:text-zinc-400">
          <span className="text-xs font-medium mr-1">{lang === 'id' ? 'Populer:' : 'Popular:'}</span>
          <button
            onClick={() => onSelectTool('merge')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            {lang === 'id' ? 'Gabung PDF' : 'Merge PDF'}
          </button>
          <button
            onClick={() => onSelectTool('compress')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            {lang === 'id' ? 'Kompres PDF' : 'Compress PDF'}
          </button>
          <button
            onClick={() => onSelectTool('pdf-to-word')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            PDF ke Word
          </button>
          <button
            onClick={() => onSelectTool('protect')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            {lang === 'id' ? 'Kunci Dokumen' : 'Protect Document'}
          </button>
          <button
            onClick={() => onSelectTool('sign')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            {lang === 'id' ? 'Tanda Tangan' : 'Sign PDF'}
          </button>
        </div>

        {/* Real-time social proof underneath */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">4.9 / 5.0</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span>
              {lang === 'id'
                ? `${totalVisits.toLocaleString('id-ID')}+ pengguna terbantu`
                : `${totalVisits.toLocaleString('en-US')}+ happy users`}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {activeUsers} {lang === 'id' ? 'Pengguna Online' : 'Active Users'}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 1: Alat PDF Terpopuler (Bento Cards with Stitch Visual Mockups) */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              {lang === 'id' ? 'Alat PDF Terpopuler' : 'Most Popular PDF Tools'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {lang === 'id'
                ? 'Utilitas harian dengan algoritma render presisi tinggi tanpa merusak format asal.'
                : 'Daily document utilities with high-precision rendering without altering original formats.'}
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('semua-alat');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'id' ? 'Lihat Semua Alat' : 'View All Tools'}</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
        </div>

        {/* 3-Column Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Gabung PDF */}
          <div
            onClick={() => onSelectTool('merge')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            {/* Visual Preview Mockup Box */}
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="w-full max-w-[240px] flex items-center justify-center -space-x-4">
                <div className="w-24 h-32 bg-white dark:bg-zinc-900 rounded-lg shadow-md p-2 flex flex-col justify-between -rotate-6 transform transition-transform group-hover:-rotate-12 duration-300 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="h-2 w-6 bg-zinc-300 dark:bg-zinc-700 rounded"></span>
                    <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400">#01</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-1.5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-1.5 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded flex items-center px-1">
                    <div className="h-1 w-8 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                  </div>
                </div>

                <div className="w-24 h-32 bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-2 flex flex-col justify-between z-10 transform scale-105 group-hover:scale-110 transition-transform duration-300 border-2 border-zinc-900 dark:border-white">
                  <div className="flex items-center justify-between">
                    <span className="h-2 w-8 bg-zinc-900 dark:bg-white rounded"></span>
                    <span className="material-symbols-outlined text-[14px] text-zinc-900 dark:text-white">call_merge</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                    <div className="h-1.5 w-full bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                    <div className="h-1.5 w-2/3 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                  </div>
                  <div className="h-4 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <span className="text-[9px] text-zinc-900 dark:text-white font-bold">HASIL.PDF</span>
                  </div>
                </div>

                <div className="w-24 h-32 bg-white dark:bg-zinc-900 rounded-lg shadow-md p-2 flex flex-col justify-between rotate-6 transform transition-transform group-hover:rotate-12 duration-300 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="h-2 w-6 bg-zinc-300 dark:bg-zinc-700 rounded"></span>
                    <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400">#02</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-1.5 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-1.5 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-200 dark:border-zinc-800">
                {lang === 'id' ? 'Urutkan Halaman Bebas' : 'Custom Page Order'}
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {lang === 'id' ? 'Gabung PDF' : 'Merge PDF'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                {lang === 'id' ? 'CEPAT' : 'FAST'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Satukan beberapa dokumen terpisah ke satu berkas utuh dengan susunan urutan terserah Anda.'
                : 'Combine multiple individual documents into a single file in your desired sequence.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">group</span>
                <span>1.2M {lang === 'id' ? 'pengguna' : 'users'}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Buka Alat →' : 'Open Tool →'}
              </span>
            </div>
          </div>

          {/* Card 2: Kompres PDF */}
          <div
            onClick={() => onSelectTool('compress')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            {/* Visual Preview Mockup Box */}
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="w-full max-w-[250px] bg-white dark:bg-zinc-900 rounded-xl shadow-md p-3.5 space-y-3 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400">{lang === 'id' ? 'Ukuran Awal' : 'Original Size'}</span>
                  <span className="text-zinc-900 dark:text-white line-through">14.8 MB</span>
                </div>
                {/* Progress / Compression Gauge */}
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-zinc-900 dark:bg-white rounded-full w-[22%] group-hover:w-[15%] transition-all duration-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white tracking-wider border border-zinc-200 dark:border-zinc-700">
                    -85% {lang === 'id' ? 'BERKURANG' : 'SAVED'}
                  </span>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-white">1.8 MB</span>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-200 dark:border-zinc-800">
                {lang === 'id' ? 'Kualitas DPI Tajam' : 'Sharp DPI Quality'}
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {lang === 'id' ? 'Kompres PDF' : 'Compress PDF'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                {lang === 'id' ? 'FAVORIT' : 'POPULAR'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Pangkas bobot file PDF hingga batas instansi (200KB / 500KB) dengan teks dan grafik tetap tajam.'
                : 'Shrink PDF file size for portal submissions (200KB / 500KB) while keeping text razor-sharp.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                <span>2.8M {lang === 'id' ? 'pengguna' : 'users'}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Buka Alat →' : 'Open Tool →'}
              </span>
            </div>
          </div>

          {/* Card 3: PDF ke Word */}
          <div
            onClick={() => onSelectTool('pdf-to-word')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            {/* Visual Preview Mockup Box */}
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-3 w-full max-w-[260px]">
                {/* PDF side */}
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-md p-3 flex flex-col items-center border border-zinc-200 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-[28px] text-zinc-900 dark:text-white">picture_as_pdf</span>
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-white mt-1">PDF File</span>
                  <span className="text-[9px] text-zinc-400">Non-editable</span>
                </div>
                {/* Arrow */}
                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-[18px] text-zinc-900 dark:text-white group-hover:rotate-180 transition-transform duration-300">
                    sync_alt
                  </span>
                </div>
                {/* DOCX side */}
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-md p-3 flex flex-col items-center border border-zinc-200 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-[28px] text-blue-500">description</span>
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-white mt-1">Word .DOCX</span>
                  <span className="text-[9px] text-emerald-500 font-semibold">Full Edit</span>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-200 dark:border-zinc-800">
                {lang === 'id' ? 'AI Layout Retention' : 'AI Layout Preservation'}
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                PDF ke Word
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                OCR AI
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Konversi dokumen PDF ke format Word DOCX siap diedit lengkap dengan tabel, heading, dan font rapi.'
                : 'Convert PDF files to editable Word DOCX documents with intact tables, headings, and formatting.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">bolt</span>
                <span>940k {lang === 'id' ? 'pengguna' : 'users'}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Buka Alat →' : 'Open Tool →'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Konversi Format Apapun (Stitch Card Layout) */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              {lang === 'id' ? 'Konversi Format Apapun' : 'Convert Any Format'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {lang === 'id'
                ? 'Ubah dokumen kantor, spreadsheet data, hingga laman web menjadi berkas PDF standar universal.'
                : 'Convert office documents, spreadsheets, or webpages into standard universal PDF files.'}
            </p>
          </div>
          <button
            onClick={() => {
              setActiveCategory('convert');
              const el = document.getElementById('semua-alat');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'id' ? 'Jelajahi Konverter' : 'Explore Converters'}</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Office to PDF */}
          <div
            onClick={() => onSelectTool('word-to-pdf')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl shadow-xs text-center border border-zinc-200 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-blue-500 text-[24px]">article</span>
                  <div className="text-[10px] font-bold mt-1 text-zinc-800 dark:text-zinc-200">DOCX</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl shadow-xs text-center border border-zinc-200 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-emerald-500 text-[24px]">table_chart</span>
                  <div className="text-[10px] font-bold mt-1 text-zinc-800 dark:text-zinc-200">XLSX</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl shadow-xs text-center border border-zinc-200 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-amber-500 text-[24px]">slideshow</span>
                  <div className="text-[10px] font-bold mt-1 text-zinc-800 dark:text-zinc-200">PPTX</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white"></span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Auto-align margin & font styling</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {lang === 'id' ? 'Office ke PDF' : 'Office to PDF'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                {lang === 'id' ? 'SEMUA FORMAT' : 'ALL FORMATS'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Konversi Word, Excel, dan presentasi PowerPoint menjadi file PDF yang presisi serta rapi dicetak.'
                : 'Convert Word, Excel, and PowerPoint presentations into crisp, printable PDF documents.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Batch Upload Ready</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Konversi Sekarang →' : 'Convert Now →'}
              </span>
            </div>
          </div>

          {/* Card 2: PDF ke JPG / Gambar */}
          <div
            onClick={() => onSelectTool('pdf-to-jpg')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-20 h-24 rounded-lg bg-white dark:bg-zinc-900 shadow-md p-1.5 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800">
                  <div className="w-full h-14 bg-zinc-100 dark:bg-zinc-800/60 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-zinc-400 text-[18px]">image</span>
                  </div>
                  <span className="text-[9px] font-bold text-center text-zinc-800 dark:text-zinc-200">Hal 1.jpg</span>
                </div>
                <div className="w-20 h-24 rounded-lg bg-white dark:bg-zinc-900 shadow-md p-1.5 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800">
                  <div className="w-full h-14 bg-zinc-100 dark:bg-zinc-800/60 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-zinc-400 text-[18px]">image</span>
                  </div>
                  <span className="text-[9px] font-bold text-center text-zinc-800 dark:text-zinc-200">Hal 2.png</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center text-[10px] font-black text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800">
                  ZIP
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-200 dark:border-zinc-800">
                300 DPI Export
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {lang === 'id' ? 'PDF ke Gambar JPG/PNG' : 'PDF to JPG/PNG Image'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                ULTRA HD
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Ekstrak setiap lembar PDF jadi gambar individual beresolusi tinggi atau unduh paket file ZIP langsung.'
                : 'Extract every PDF page into individual high-resolution images or download as a packaged ZIP archive.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">photo_library</span>
                <span>{lang === 'id' ? 'Semua Halaman' : 'All Pages'}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Ekstrak Gambar →' : 'Extract Images →'}
              </span>
            </div>
          </div>

          {/* Card 3: HTML / Webpage ke PDF */}
          <div
            onClick={() => onSelectTool('html-to-pdf')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="w-full max-w-[240px] bg-white dark:bg-zinc-900 rounded-xl shadow-md p-3 space-y-2 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-red-400"></span>
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 ml-1 truncate">https://klikpdf.my.id</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                <div className="h-8 bg-zinc-50 dark:bg-zinc-800/50 rounded flex items-center justify-center border border-zinc-100 dark:border-zinc-700/60">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[12px]">download</span>
                    <span>{lang === 'id' ? 'Simpan Arsip Lengkap' : 'Save Full Archive'}</span>
                  </span>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-200 dark:border-zinc-800">
                CSS Fidelity
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {lang === 'id' ? 'Laman Web ke PDF' : 'Webpage to PDF'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                WEB CAPTURE
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Salin dan tempel URL laman berita, bukti transfer, atau invoice belanja online untuk disimpan instan sebagai PDF.'
                : 'Convert online news pages, receipts, or invoices directly into clean PDF documents via URL.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">public</span>
                <span>{lang === 'id' ? 'Rendering Akurat' : 'High Fidelity'}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Konversi URL →' : 'Convert URL →'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Keamanan & Alat Lanjutan */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              {lang === 'id' ? 'Keamanan & Alat Lanjutan' : 'Security & Advanced Tools'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {lang === 'id'
                ? 'Standar enkripsi dokumen legal, tanda tangan digital, dan manipulasi struktur halaman tingkat lanjut.'
                : 'Standards for legal document encryption, digital signatures, and advanced page layout manipulation.'}
            </p>
          </div>
          <button
            onClick={() => {
              setActiveCategory('security');
              const el = document.getElementById('semua-alat');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'id' ? 'Katalog Lengkap' : 'Full Catalog'}</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pro Card 1: Tanda Tangan & Lindungi */}
          <div
            onClick={() => onSelectTool('sign')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="w-full max-w-[240px] bg-white dark:bg-zinc-900 rounded-xl shadow-md p-3.5 space-y-2 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 tracking-wider">
                    SERTIFIKAT DIGITAL
                  </span>
                  <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified_user</span>
                </div>
                {/* Hand-drawn SVG signature preview */}
                <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <svg className="h-8 text-zinc-900 dark:text-white w-full" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 160 40">
                    <path d="M10 28 C 30 10, 45 35, 60 15 S 90 35, 110 20 Q 130 5, 150 25"></path>
                  </svg>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Status: Sah & Terkunci</span>
                  <span className="font-mono">AES-256</span>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-200 dark:border-zinc-800">
                Legal Compliant
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {lang === 'id' ? 'Tanda Tangan & Enkripsi' : 'Sign & Encrypt'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Tambahkan tanda tangan digital sah Anda dan kunci dokumen dengan sandi enkripsi militer 256-bit.'
                : 'Apply valid digital signatures and secure your documents with military-grade 256-bit encryption.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">key</span>
                <span>Tanpa Jejak Cloud</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Mulai Proteksi →' : 'Protect Now →'}
              </span>
            </div>
          </div>

          {/* Pro Card 2: OCR Ekstraksi Cerdas */}
          <div
            onClick={() => onSelectTool('ocr')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="w-full max-w-[240px] bg-white dark:bg-zinc-900 rounded-xl shadow-md p-3 space-y-2 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-white tracking-wider">AI SCAN RECOGNITION</span>
                  <span className="material-symbols-outlined text-zinc-900 dark:text-white text-[16px]">psychology</span>
                </div>
                <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-950 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 leading-tight">
                  &gt; Mengidentifikasi Dokumen/Scan...<br/>
                  &gt; Teks diekstrak 99.8% akurat.
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Bahasa ID
                  </span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    English
                  </span>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-200 dark:border-zinc-800">
                Multibahasa
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {lang === 'id' ? 'OCR Teks Cerdas' : 'Smart Text OCR'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Ubah hasil foto pindaian dan dokumen PDF gambar menjadi teks hidup yang dapat dicari dan disalin.'
                : 'Turn scanned documents and image PDFs into searchable, selectable, and editable live text.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">document_scanner</span>
                <span>Precision Mode</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Jalankan OCR →' : 'Run OCR →'}
              </span>
            </div>
          </div>

          {/* Pro Card 3: Atur & Rapikan Halaman */}
          <div
            onClick={() => onSelectTool('organize')}
            className="group flex flex-col bg-white dark:bg-black rounded-2xl p-4 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
          >
            <div className="w-full aspect-[16/10] rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative p-4 flex flex-col justify-center items-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="grid grid-cols-3 gap-2 w-full max-w-[220px]">
                <div className="h-16 bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-1.5 flex flex-col justify-between items-center group-hover:scale-95 transition-transform border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Hal 1</span>
                  <span className="material-symbols-outlined text-zinc-400 text-[14px]">rotate_right</span>
                </div>
                <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg shadow-sm p-1.5 flex flex-col justify-between items-center group-hover:scale-105 transition-transform border border-zinc-300 dark:border-zinc-700">
                  <span className="text-[9px] font-bold text-zinc-900 dark:text-white">Hapus</span>
                  <span className="material-symbols-outlined text-zinc-900 dark:text-white text-[14px]">delete</span>
                </div>
                <div className="h-16 bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-1.5 flex flex-col justify-between items-center group-hover:scale-95 transition-transform border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Hal 3</span>
                  <span className="material-symbols-outlined text-zinc-400 text-[14px]">drag_indicator</span>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur text-zinc-800 dark:text-zinc-200 shadow-xs border border-zinc-200 dark:border-zinc-800">
                Visual Reorder
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {lang === 'id' ? 'Organisir Halaman' : 'Organize Pages'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                EDITOR
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
              {lang === 'id'
                ? 'Putar sudut halaman miring, pisahkan rentang nomor tertentu, atau hapus lembar yang tidak terpakai.'
                : 'Rotate tilted pages, extract ranges, or delete unwanted sheets with intuitive visual controls.'}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">layers</span>
                <span>Drag & Drop</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                {lang === 'id' ? 'Kelola Halaman →' : 'Manage Pages →'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & SPEED METRICS SECTION */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="w-full bg-white dark:bg-black rounded-2xl p-8 sm:p-12 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
            <div className="flex flex-col gap-1">
              <span className="text-2xl sm:text-4xl lg:text-[44px] font-black text-zinc-950 dark:text-white tracking-tight">
                10M+
              </span>
              <span className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200">
                {lang === 'id' ? 'Berkas Diproses' : 'Files Processed'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === 'id' ? 'Dipercaya profesional di seluruh Indonesia.' : 'Trusted by professionals worldwide.'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl sm:text-4xl lg:text-[44px] font-black text-zinc-950 dark:text-white tracking-tight">
                0 Byte
              </span>
              <span className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200">
                {lang === 'id' ? 'Data Tersimpan' : 'Zero Data Stored'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === 'id' ? 'File terhapus permanen otomatis / 100% Client-Side.' : 'Files permanently deleted or client-side sandbox.'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl sm:text-4xl lg:text-[44px] font-black text-zinc-950 dark:text-white tracking-tight">
                &lt;1.2s
              </span>
              <span className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200">
                {lang === 'id' ? 'Kecepatan Rata-rata' : 'Average Speed'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === 'id' ? 'Pemrosesan instan langsung di sisi peramban.' : 'Instant processing directly inside the browser.'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl sm:text-4xl lg:text-[44px] font-black text-zinc-950 dark:text-white tracking-tight">
                100%
              </span>
              <span className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200">
                {lang === 'id' ? 'Privasi Terjamin' : 'Guaranteed Privacy'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === 'id' ? 'Kepatuhan standar enkripsi TLS 1.3 & AES-256.' : 'Compliant with TLS 1.3 & AES-256 encryption.'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE PREVIEW PERBANDINGAN SEBELUM VS SESUDAH KOMPRESI */}
      <section className="w-full py-14 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse"></span>
            {lang === 'id' ? 'Teknologi Kompresi Adaptif' : 'Adaptive Compression Engine'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-1">
            {lang === 'id' ? 'Kecilkan Ukuran Dokumen, Pertahankan Kualitas Asli' : 'Shrink Document Size, Keep Original Quality'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {lang === 'id'
              ? 'Geser slider di bawah untuk menguji perbandingan kualitas teks dan grafis dokumen sebelum vs sesudah dikompresi.'
              : 'Drag the slider below to test the visual quality comparison before vs after compression.'}
          </p>
        </div>

        {/* Interactive Comparison Container */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-black rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
          {/* Top Comparison Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800 text-center">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium block">
                {lang === 'id' ? 'Sebelum Kompresi' : 'Before Compression'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">15.0 MB</span>
              <span className="text-[11px] text-zinc-400">
                {lang === 'id' ? 'Lambat saat dikirim email' : 'Slow for email delivery'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center">
              <span className="text-xs text-zinc-900 dark:text-white font-bold block">
                {lang === 'id' ? 'Penyusutan Efisien' : 'Efficient Reduction'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">-88%</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {lang === 'id' ? 'Kualitas tetap 100% tajam' : '100% sharp text preserved'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
                {lang === 'id' ? 'Hasil Sesudah Kompres' : 'After Compression'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">1.8 MB</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {lang === 'id' ? 'Siap kirim via WhatsApp & Email' : 'Ready for WhatsApp & Email'}
              </span>
            </div>
          </div>

          {/* Document Visual Preview Canvas with Split Mockup */}
          <div
            onTouchMove={handleComparisonTouch}
            onTouchStart={handleComparisonTouch}
            className="relative w-full h-[280px] sm:h-[340px] bg-zinc-100 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 select-none touch-none"
          >
            {/* BEFORE BACKGROUND (Full view) */}
            <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-zinc-900 dark:text-white text-[24px]">picture_as_pdf</span>
                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                      Laporan_Tahunan_Keuangan_2025.pdf
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    15.0 MB
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800/60 rounded w-full"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800/60 rounded w-5/6"></div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="h-20 bg-zinc-200 dark:bg-zinc-900 rounded-xl p-3 flex flex-col justify-center border border-zinc-300/50 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {lang === 'id' ? 'Grafik Neraca Q4' : 'Q4 Balance Sheet'}
                      </span>
                      <div className="h-2 bg-zinc-400 dark:bg-zinc-700 rounded mt-2 w-2/3"></div>
                    </div>
                    <div className="h-20 bg-zinc-200 dark:bg-zinc-900 rounded-xl p-3 flex flex-col justify-center border border-zinc-300/50 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {lang === 'id' ? 'Matriks Pertumbuhan' : 'Growth Matrix'}
                      </span>
                      <div className="h-2 bg-zinc-400 dark:bg-zinc-700 rounded mt-2 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <span>{lang === 'id' ? 'Halaman 1 dari 48' : 'Page 1 of 48'}</span>
                <span className="font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  {lang === 'id' ? 'ASLI (15 MB)' : 'ORIGINAL (15 MB)'}
                </span>
              </div>
            </div>

            {/* AFTER LAYER (Clipped overlay) */}
            <div
              className="absolute inset-0 bg-white dark:bg-black p-6 sm:p-8 flex flex-col justify-between border-r-2 border-zinc-900 dark:border-white overflow-hidden"
              style={{ width: `${comparisonValue}%` }}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-zinc-900 dark:text-white text-[24px]">verified</span>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                      Laporan_Tahunan_Keuangan_2025_Kompres.pdf
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700">
                    1.8 MB
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-4 bg-zinc-800 dark:bg-zinc-200 rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-400 dark:bg-zinc-400 rounded w-full"></div>
                  <div className="h-3 bg-zinc-400 dark:bg-zinc-400 rounded w-5/6"></div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-3 flex flex-col justify-center border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        {lang === 'id' ? 'Grafik Neraca Q4 (Jernih)' : 'Q4 Balance Sheet (Crisp)'}
                      </span>
                      <div className="h-2 bg-zinc-900 dark:bg-white rounded mt-2 w-2/3"></div>
                    </div>
                    <div className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-3 flex flex-col justify-center border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        {lang === 'id' ? 'Matriks Pertumbuhan' : 'Growth Matrix'}
                      </span>
                      <div className="h-2 bg-zinc-500 rounded mt-2 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <span>{lang === 'id' ? 'Presisi Teks 100% Terjaga' : '100% Text Precision Preserved'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  {lang === 'id' ? 'HASIL KOMPRES (1.8 MB)' : 'COMPRESSED (1.8 MB)'}
                </span>
              </div>
            </div>

            {/* SLIDER HANDLE */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center justify-center"
              style={{ left: `calc(${comparisonValue}% - 16px)` }}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-black cursor-ew-resize">
                <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
              </div>
            </div>
          </div>

          {/* Slider Range Input Control */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {lang === 'id' ? 'Hasil (1.8 MB)' : 'Result (1.8 MB)'}
            </span>
            <input
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white"
              max="100"
              min="0"
              type="range"
              value={comparisonValue}
              onChange={(e) => setComparisonValue(Number(e.target.value))}
            />
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {lang === 'id' ? 'Asli (15 MB)' : 'Original (15 MB)'}
            </span>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA / GET STARTED BANNER (Minimal luxury pitch-black aesthetic from Stitch) */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="w-full bg-black rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-zinc-800">
          <div className="max-w-xl text-center md:text-left z-10">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 inline-block">
              {lang === 'id' ? 'Tingkatkan Produktivitas Anda' : 'Supercharge Your Productivity'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 mb-4 leading-tight">
              {lang === 'id' ? 'Siap menyelesaikan tugas PDF Anda lebih cepat?' : 'Ready to finish your PDF tasks faster?'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {lang === 'id'
                ? 'Tanpa registrasi kartu kredit, tanpa batas manipulasi dokumen harian. Mulai gunakan alat profesional sekarang.'
                : 'No credit card required, no daily processing limits. Start using professional PDF tools now.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto z-10 shrink-0">
            <button
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-all shadow-md active:scale-95 cursor-pointer"
              onClick={() => {
                heroFileInputRef.current?.click();
              }}
              type="button"
            >
              {lang === 'id' ? 'Coba Sekarang Gratis' : 'Try Free Now'}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('semua-alat');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto h-11 px-5 rounded-xl bg-transparent hover:bg-zinc-900 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span>{lang === 'id' ? 'Semua 24+ Alat' : 'All 24+ Tools'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* COMPLETE 24+ TOOLS CATALOG WITH FILTER TABS */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto border-t border-zinc-200 dark:border-zinc-800" id="semua-alat">
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <Sparkles size={14} />
            <span>{lang === 'id' ? 'Katalog Lengkap Alat' : 'Complete Tools Catalog'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 dark:text-white tracking-tight leading-tight mb-3">
            {lang === 'id' ? 'Katalog Lengkap Alat KlikPDF' : 'All KlikPDF Tools'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {lang === 'id'
              ? 'Pilih dari 24+ alat gratis untuk memproses, mengonversi, memproteksi, dan mengoptimalkan dokumen Anda.'
              : 'Choose from 24+ free tools to process, convert, protect, and optimize your documents.'}
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center sm:justify-center overflow-x-auto no-scrollbar gap-2 mt-6 sm:mt-8 pb-2 px-1 max-w-full select-none">
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
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-md scale-105'
                    : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool.id)} />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight mb-2">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {lang === 'id' ? 'Pertanyaan yang sering diajukan mengenai layanan KlikPDF.' : 'Common questions about KlikPDF services.'}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-black ml-4 text-zinc-400">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Contextual Action Modal when user drops or selects any file */}
      {showActionModal && droppedFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">task_alt</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                    {lang === 'id' ? 'Mau Diapakan File Ini?' : 'What would you like to do with this file?'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-[320px]">
                      {droppedFiles[0]?.name}
                    </span>
                    {droppedFiles[0]?.size && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-zinc-800">
                        {(droppedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowActionModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-lg font-bold transition-colors cursor-pointer"
                title={lang === 'id' ? 'Tutup' : 'Close'}
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
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white mb-1">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        <span>{lang === 'id' ? 'Dokumen Microsoft Word Terdeteksi' : 'Microsoft Word Document Detected'}</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {lang === 'id'
                          ? 'Klik tombol di bawah untuk langsung mengubah dokumen Word Anda menjadi format PDF siap cetak.'
                          : 'Click below to instantly convert your Word document into print-ready PDF.'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickModalAction('word-to-pdf')}
                      className="w-full p-5 rounded-2xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-left transition-all duration-200 flex items-center justify-between shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/20 dark:bg-black/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px]">description</span>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black">
                            {lang === 'id' ? 'Word ke PDF (Konversi Otomatis)' : 'Word to PDF (Auto Conversion)'}
                          </div>
                          <div className="text-xs text-zinc-300 dark:text-zinc-700 font-normal mt-0.5">
                            {lang === 'id' 
                              ? 'Tata letak, font, tabel, dan gambar terjaga 100% rapi' 
                              : 'Preserves layout, fonts, tables, and images with 100% fidelity'}
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
                    <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">
                      {lang === 'id' ? 'Pilih Tindakan untuk Gambar/Foto Anda:' : 'Choose an Action for Your Image/Photo:'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleQuickModalAction('hd-image')}
                        className="p-5 text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-xs"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-[22px]">auto_fix_high</span>
                          </div>
                          <h4 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                            {lang === 'id' ? 'HD-kan Foto (AI Upscale)' : 'Enhance Photo HD (AI)'}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {lang === 'id'
                              ? 'Pertajam dan tingkatkan resolusi foto buram hingga 4x Ultra HD.'
                              : 'Sharpen and upscale blurry photos up to 4x Ultra HD.'}
                          </p>
                        </div>
                        <span className="mt-4 text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                          <span>{lang === 'id' ? 'Tingkatkan Resolusi' : 'Enhance Resolution'}</span>
                          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </span>
                      </button>

                      <button
                        onClick={() => handleQuickModalAction('image-to-pdf')}
                        className="p-5 text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-xs"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-[22px]">image</span>
                          </div>
                          <h4 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                            {lang === 'id' ? 'Gambar ke PDF' : 'Image to PDF'}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {lang === 'id'
                              ? 'Ubah foto JPG/PNG menjadi lembar dokumen PDF siap cetak.'
                              : 'Convert JPG/PNG images into print-ready PDF pages.'}
                          </p>
                        </div>
                        <span className="mt-4 text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                          <span>{lang === 'id' ? 'Konversi ke PDF' : 'Convert to PDF'}</span>
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
                      className="w-full p-5 rounded-2xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-left transition-all duration-200 flex items-center justify-between shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/20 dark:bg-black/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px]">table_chart</span>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black">
                            {lang === 'id' ? 'Excel ke PDF' : 'Excel to PDF'}
                          </div>
                          <div className="text-xs text-zinc-300 dark:text-zinc-700 font-normal mt-0.5">
                            {lang === 'id'
                              ? 'Konversi tabel spreadsheet menjadi dokumen PDF rapi'
                              : 'Convert spreadsheet tables into clean PDF documents'}
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
                      className="w-full p-5 rounded-2xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-left transition-all duration-200 flex items-center justify-between shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/20 dark:bg-black/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px]">slideshow</span>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black">
                            {lang === 'id' ? 'PowerPoint ke PDF' : 'PowerPoint to PDF'}
                          </div>
                          <div className="text-xs text-zinc-300 dark:text-zinc-700 font-normal mt-0.5">
                            {lang === 'id'
                              ? 'Ubah slide presentasi PowerPoint menjadi file PDF'
                              : 'Convert PowerPoint presentation slides into PDF files'}
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
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                    {lang === 'id' ? 'Pilih Tindakan untuk Dokumen PDF Anda:' : 'Choose an Action for Your PDF Document:'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Action 1: Kompres PDF */}
                    <button
                      onClick={() => handleQuickModalAction('compress')}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">compress</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors flex items-center gap-1.5">
                          <span>{lang === 'id' ? 'Kompres PDF' : 'Compress PDF'}</span>
                          <span className="text-[10px] font-bold bg-zinc-900 dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded-full">
                            {lang === 'id' ? 'Populer' : 'Popular'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {lang === 'id' ? 'Kecilkan ukuran file s/d 85% untuk email' : 'Reduce file size up to 85% for email'}
                        </p>
                      </div>
                    </button>

                    {/* Action 2: Gabungkan PDF */}
                    <button
                      onClick={() => handleQuickModalAction('merge')}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">call_merge</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {lang === 'id' ? 'Gabungkan PDF' : 'Merge PDF'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {lang === 'id' ? 'Satukan dengan file PDF lainnya' : 'Combine with other PDF files'}
                        </p>
                      </div>
                    </button>

                    {/* Action 3: PDF ke Word */}
                    <button
                      onClick={() => handleQuickModalAction('pdf-to-word')}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">description</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {lang === 'id' ? 'PDF ke Word' : 'PDF to Word'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {lang === 'id' ? 'Ubah ke berkas DOCX yang bisa diedit' : 'Convert to editable DOCX document'}
                        </p>
                      </div>
                    </button>

                    {/* Action 4: Pisahkan PDF */}
                    <button
                      onClick={() => handleQuickModalAction('split')}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">call_split</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {lang === 'id' ? 'Pisahkan PDF' : 'Split PDF'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {lang === 'id' ? 'Ambil lembar tertentu atau pecah per hal' : 'Extract pages or split into single sheets'}
                        </p>
                      </div>
                    </button>

                    {/* Action 5: Tanda Tangan PDF */}
                    <button
                      onClick={() => handleQuickModalAction('sign')}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">draw</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {lang === 'id' ? 'Tanda Tangan PDF' : 'Sign PDF'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {lang === 'id' ? 'Bubuhkan tanda tangan atau paraf digital' : 'Add digital signature or initials'}
                        </p>
                      </div>
                    </button>

                    {/* Action 6: Kunci Dokumen */}
                    <button
                      onClick={() => handleQuickModalAction('protect')}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">lock</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {lang === 'id' ? 'Kunci Dokumen' : 'Protect Document'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {lang === 'id' ? 'Proteksi PDF dengan kata sandi enkripsi' : 'Protect PDF with password encryption'}
                        </p>
                      </div>
                    </button>

                    {/* Action 7: PDF ke Excel */}
                    <button
                      onClick={() => handleQuickModalAction('pdf-to-excel')}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">table_chart</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {lang === 'id' ? 'PDF ke Excel' : 'PDF to Excel'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {lang === 'id' ? 'Ekstrak data tabel ke spreadsheet Excel' : 'Extract table data to Excel spreadsheet'}
                        </p>
                      </div>
                    </button>

                    {/* Action 8: Putar Halaman */}
                    <button
                      onClick={() => handleQuickModalAction('rotate')}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-all group cursor-pointer shadow-xs flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">rotate_right</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {lang === 'id' ? 'Putar Halaman' : 'Rotate Pages'}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {lang === 'id' ? 'Ubah orientasi dokumen yang miring' : 'Rotate pages or change orientation'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  heroFileInputRef.current?.click();
                }}
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>{lang === 'id' ? 'Pilih Berkas Lain' : 'Choose Another File'}</span>
              </button>

              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                type="button"
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
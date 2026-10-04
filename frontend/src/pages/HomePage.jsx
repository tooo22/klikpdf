import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TOOLS } from '../toolsConfig';

export const HomePage = ({ onSelectTool }) => {
  const { lang } = useLanguage();

  // 1. Telemetry & Live Presence State
  const [activeUsers, setActiveUsers] = useState(1);
  const [savedStorageGB, setSavedStorageGB] = useState(() => {
    const saved = localStorage.getItem('klikpdf_saved_storage');
    return saved ? parseFloat(saved) : 1482.6;
  });

  // Category and Search Filtering
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  // File Queue State for Smart Unified Dropzone
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [isDropzoneDragging, setIsDropzoneDragging] = useState(false);
  const masterFileInputRef = useRef(null);

  // Cloud Import Notice Modal
  const [cloudNotice, setCloudNotice] = useState(null);

  // Multi-Tab Active Presence Broadcast
  useEffect(() => {
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

  // Listen for search events dispatched from header navbar
  useEffect(() => {
    const handleHeaderSearch = (e) => {
      if (typeof e.detail?.query === 'string') {
        setSearchQuery(e.detail.query);
      }
    };
    window.addEventListener('klikpdf-search-tools', handleHeaderSearch);
    return () => window.removeEventListener('klikpdf-search-tools', handleHeaderSearch);
  }, []);

  // Calculate recommended tool based on file extension
  const getToolRecommendation = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return {
        toolId: 'compress',
        label: lang === 'id' ? 'Kompres atau Gabungkan PDF' : 'Compress or Merge PDF',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      };
    } else if (['doc', 'docx'].includes(ext)) {
      return {
        toolId: 'word-to-pdf',
        label: lang === 'id' ? 'Konversi ke PDF Instan' : 'Convert to PDF Instantly',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
      };
    } else if (['xls', 'xlsx'].includes(ext)) {
      return {
        toolId: 'word-to-pdf',
        label: lang === 'id' ? 'Konversi Lembar Excel ke PDF' : 'Convert Excel to PDF',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
      };
    } else if (['ppt', 'pptx'].includes(ext)) {
      return {
        toolId: 'word-to-pdf',
        label: lang === 'id' ? 'Konversi Slide ke PDF' : 'Convert Slides to PDF',
        badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
      };
    } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return {
        toolId: 'image-to-pdf',
        label: lang === 'id' ? 'Satukan Gambar Jadi PDF' : 'Merge Images to PDF',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
      };
    }
    return {
      toolId: 'compress',
      label: lang === 'id' ? 'Optimalkan Dokumen' : 'Optimize Document',
      badgeColor: 'bg-crimson-glow text-primary dark:bg-rose-950/60 dark:text-rose-300'
    };
  };

  const handleFilesQueued = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setQueuedFiles(prev => [...prev, ...fileArray]);

    // Dynamic storage simulation increment
    const newStorage = savedStorageGB + (fileArray.length * 2.8);
    setSavedStorageGB(newStorage);
    localStorage.setItem('klikpdf_saved_storage', newStorage.toFixed(1));
  };

  const handleDirectCardFile = (toolId, files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    onSelectTool(toolId, fileList);
  };

  // Comprehensive Action Matrix Catalog
  const MATRIX_TOOLS = [
    {
      id: "compress",
      category: "kompresi",
      name: lang === 'id' ? "Kompres PDF Kilat" : "Fast PDF Compress",
      badge: "HEMAT 88%",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      speed: "~1.2 dtk",
      icon: "compress",
      iconBg: "bg-crimson-glow text-primary dark:bg-rose-950/60 dark:text-rose-400",
      desc: lang === 'id' 
        ? "Kecilkan volume dokumen hingga 88% dengan tetap menjaga ketajaman font & grafik." 
        : "Reduce document size up to 88% while preserving sharp fonts and vector graphics.",
      accept: ".pdf",
      multiple: false,
      keywords: "kompres kecil perkecil compress shrink ukuran mb kb"
    },
    {
      id: "merge",
      category: "edit",
      name: lang === 'id' ? "Gabungkan PDF" : "Merge PDF",
      badge: "MULTI-PAGE",
      badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
      speed: "~0.8 dtk",
      icon: "call_merge",
      iconBg: "bg-indigo-50 text-secondary dark:bg-indigo-950/60 dark:text-indigo-400",
      desc: lang === 'id' 
        ? "Satukan lembaran acak atau beberapa berkas PDF terpisah menjadi 1 file rapi siap cetak." 
        : "Combine separate PDF documents into a single organized, print-ready document.",
      accept: ".pdf",
      multiple: true,
      keywords: "gabung susun merge combine gabungkan satukan urutkan"
    },
    {
      id: "split",
      category: "edit",
      name: lang === 'id' ? "Pisahkan PDF" : "Split PDF",
      badge: "SELEKTIF",
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
      speed: "~1.0 dtk",
      icon: "call_split",
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
      desc: lang === 'id' 
        ? "Ambil rentang halaman tertentu (misal: hal 3-8) atau pecah dokumen jadi file terpisah." 
        : "Extract specific page ranges (e.g. pages 3-8) or split documents into individual files.",
      accept: ".pdf",
      multiple: false,
      keywords: "pisah split potong ekstrak halam pisahkan halaman"
    },
    {
      id: "pdf-to-word",
      category: "konversi",
      name: lang === 'id' ? "PDF ke Word (DOCX)" : "PDF to Word (DOCX)",
      badge: "OCR PRECISE",
      badgeColor: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
      speed: "~2.2 dtk",
      icon: "description",
      iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
      desc: lang === 'id' 
        ? "Konversi dokumen ke format Word yang dapat disunting penuh tanpa merusak margin & tata letak." 
        : "Convert documents to fully editable Word DOCX files while preserving layout and margins.",
      accept: ".pdf",
      multiple: false,
      keywords: "pdf ke word docx doc convert konversi ubah microsoft word"
    },
    {
      id: "pdf-to-excel",
      category: "konversi",
      name: lang === 'id' ? "PDF ke Excel (XLSX)" : "PDF to Excel (XLSX)",
      badge: "AUTO-TABLE",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      speed: "~1.8 dtk",
      icon: "table_view",
      iconBg: "bg-emerald-50 text-tertiary dark:bg-emerald-950/60 dark:text-emerald-400",
      desc: lang === 'id' 
        ? "Pindai dan ekstrak tabel neraca, faktur belanja, atau laporan keuangan ke lembar kerja siap olah." 
        : "Scan and extract balance sheets, invoices, or financial tables directly into spreadsheets.",
      accept: ".pdf",
      multiple: false,
      keywords: "pdf ke excel xlsx xls tabel angka data spread sheet"
    },
    {
      id: "pdf-to-image",
      category: "konversi",
      name: lang === 'id' ? "PDF ke JPG / PNG" : "PDF to JPG / PNG",
      badge: "300 DPI",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
      speed: "~1.5 dtk",
      icon: "photo_library",
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
      desc: lang === 'id' 
        ? "Ekstrak lembar PDF menjadi gambar resolusi tinggi tanpa kompresi visual yang merusak ketajaman." 
        : "Extract PDF pages into ultra-sharp high resolution images with maximum color fidelity.",
      accept: ".pdf",
      multiple: false,
      keywords: "pdf ke jpg png gambar foto image convert ubah"
    },
    {
      id: "word-to-pdf",
      category: "konversi",
      name: lang === 'id' ? "Word & Foto ke PDF" : "Word & Office to PDF",
      badge: "UNIVERSAL",
      badgeColor: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
      speed: "~1.4 dtk",
      icon: "transform",
      iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400",
      desc: lang === 'id' 
        ? "Jadikan berkas Word, Excel, PowerPoint, atau galeri gambar menjadi dokumen PDF standar internasional." 
        : "Convert Word, Excel, PowerPoint, and photos into standardized, pristine PDF files.",
      accept: ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png",
      multiple: false,
      keywords: "word ke pdf docx foto jpg convert jadikan pdf ubah jadi pdf"
    },
    {
      id: "watermark",
      category: "edit",
      name: lang === 'id' ? "Tanda Tangan Digital" : "Digital Signature (E-Sign)",
      badge: "E-SIGN",
      badgeColor: "bg-rose-50 text-crimson-primary dark:bg-rose-950/60 dark:text-rose-300",
      speed: "~1.0 dtk",
      icon: "draw",
      iconBg: "bg-rose-50 text-crimson-primary dark:bg-rose-950/60 dark:text-rose-400",
      desc: lang === 'id' 
        ? "Bubuhkan paraf, tanda tangan basah, stempel cap perusahaan, atau inisial langsung di browser." 
        : "Add digital signatures, initials, company stamps, or approval marks in browser.",
      accept: ".pdf",
      multiple: false,
      keywords: "tanda tangan sign e-sign paraf digital draw surat berkas"
    },
    {
      id: "protect",
      category: "keamanan",
      name: lang === 'id' ? "Kunci & Proteksi Sandi" : "Protect & Encrypt PDF",
      badge: "AES-256",
      badgeColor: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
      speed: "~0.7 dtk",
      icon: "lock",
      iconBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
      desc: lang === 'id' 
        ? "Larang akses tidak berizin dengan enkripsi kata sandi kuat pada dokumen sensitif dan perbankan." 
        : "Prevent unauthorized access with robust military-grade 256-bit encryption.",
      accept: ".pdf",
      multiple: false,
      keywords: "kunci lock password kata sandi enkripsi proteksi secure"
    },
    {
      id: "unlock",
      category: "keamanan",
      name: lang === 'id' ? "Buka Sandi PDF" : "Unlock & Remove Password",
      badge: "UNLOCK",
      badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      speed: "~0.6 dtk",
      icon: "lock_open",
      iconBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      desc: lang === 'id' 
        ? "Hapus proteksi kata sandi pada dokumen sah agar mudah dicetak dan dibagikan kembali tanpa prompt." 
        : "Remove password security from your authorized PDF files for effortless sharing and printing.",
      accept: ".pdf",
      multiple: false,
      keywords: "buka sandi unlock password hilangkan sandi hapus enkripsi"
    },
    {
      id: "rotate",
      category: "edit",
      name: lang === 'id' ? "Rotasi & Hapus Halaman" : "Rotate & Remove Pages",
      badge: "VISUAL GRID",
      badgeColor: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
      speed: "~0.5 dtk",
      icon: "rotate_right",
      iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
      desc: lang === 'id' 
        ? "Perbaiki lembar yang terbalik 90°/180° atau buang lembar kosong yang tidak dibutuhkan." 
        : "Fix upside-down pages by 90°/180° or eliminate unnecessary blank pages with ease.",
      accept: ".pdf",
      multiple: false,
      keywords: "putar rotasi urutan hapus rearrange delete page reorder"
    },
    {
      id: "watermark",
      category: "keamanan",
      name: lang === 'id' ? "Beri Tanda Air (Watermark)" : "Add Watermark",
      badge: "STAMP",
      badgeColor: "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
      speed: "~1.1 dtk",
      icon: "branding_watermark",
      iconBg: "bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400",
      desc: lang === 'id' 
        ? "Tambahkan stempel teks kustom atau logo transparan seperti 'RAHASIA', 'DRAFT', atau hak cipta." 
        : "Stamp customizable text or transparent logos like 'CONFIDENTIAL', 'DRAFT', or copyrights.",
      accept: ".pdf",
      multiple: false,
      keywords: "watermark cap tanda air stempel rahasia draft confidential"
    },
    {
      id: "hd-image",
      category: "konversi",
      name: lang === 'id' ? "HD-kan Foto (AI Upscale)" : "Enhance Photo HD (AI)",
      badge: "ULTRA HD 4X",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
      speed: "~1.6 dtk",
      icon: "auto_fix_high",
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
      desc: lang === 'id' 
        ? "Pertajam foto blur, tingkatkan resolusi 2x hingga 4x jernih menggunakan mesin AI pintar." 
        : "Upscale low-resolution or blurry photos up to 4x clarity using deep learning enhancement.",
      accept: ".jpg,.jpeg,.png,.webp",
      multiple: false,
      keywords: "hd foto gambar tajam jernih upscale resolusi ai"
    },
    {
      id: "page-numbers",
      category: "edit",
      name: lang === 'id' ? "Nomor Halaman PDF" : "Add Page Numbers",
      badge: "AUTO-INDEX",
      badgeColor: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
      speed: "~0.8 dtk",
      icon: "tag",
      iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400",
      desc: lang === 'id' 
        ? "Bubuhkan penomoran halaman otomatis dengan format rapi di bagian atas atau bawah lembar." 
        : "Insert automatic page numbering with customizable format and placement positions.",
      accept: ".pdf",
      multiple: false,
      keywords: "nomor halaman page number angka footer header"
    },
    {
      id: "ocr",
      category: "edit",
      name: lang === 'id' ? "PDF OCR Scan Teks" : "OCR Scan PDF to Text",
      badge: "OCR PRECISE",
      badgeColor: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
      speed: "~2.5 dtk",
      icon: "document_scanner",
      iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
      desc: lang === 'id' 
        ? "Pindai teks pada PDF hasil scan sehingga teks dapat disalin, dicari, dan diedit bebas." 
        : "Convert scanned and image PDFs into fully searchable, selectable, and copyable text.",
      accept: ".pdf",
      multiple: false,
      keywords: "ocr scan baca teks salin extract searchable"
    },
    {
      id: "image-to-pdf",
      category: "konversi",
      name: lang === 'id' ? "Satukan Gambar ke PDF" : "Images to PDF",
      badge: "BATCH SCAN",
      badgeColor: "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
      speed: "~1.1 dtk",
      icon: "photo_library",
      iconBg: "bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400",
      desc: lang === 'id' 
        ? "Gabungkan foto nota belanja, KTP, ijazah, atau sertifikat menjadi 1 berkas PDF rapi." 
        : "Combine receipts, ID cards, certificates, and photo galleries into an organized PDF file.",
      accept: "image/*",
      multiple: true,
      keywords: "gambar ke pdf jpg ke pdf png to pdf batch scan foto"
    }
  ];

  // Filtering tools logic
  const filteredTools = MATRIX_TOOLS.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = query === '' ||
      tool.name.toLowerCase().includes(query) ||
      tool.desc.toLowerCase().includes(query) ||
      tool.keywords.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const faqs = [
    {
      q: lang === 'id' ? 'Apakah semua alat di KlikPDF 100% gratis?' : 'Are all tools on KlikPDF 100% free?',
      a: lang === 'id' 
        ? 'Ya! Seluruh fitur pengolahan PDF dan HD-kan Foto di KlikPDF dapat digunakan secara gratis tanpa perlu registrasi, berlangganan kartu kredit, atau batasan harian.' 
        : 'Yes! All PDF processing tools and HD Photo Enhancer on KlikPDF are completely free to use without registration or daily limits.'
    },
    {
      q: lang === 'id' ? 'Apakah berkas dan dokumen saya aman di KlikPDF?' : 'Are my files and documents secure on KlikPDF?',
      a: lang === 'id' 
        ? 'Sangat aman. Seluruh proses pengolahan dokumen dilakukan melalui jalur terenkripsi HTTPS/SSL 256-bit standar TLS 1.3, dan berkas sementara akan dibersihkan secara otomatis maksimal 2 jam setelah pemrosesan.' 
        : 'Extremely secure. All processing is transmitted via high-grade 256-bit HTTPS/SSL encryption and temporary files are automatically purged within 2 hours.'
    },
    {
      q: lang === 'id' ? 'Bagaimana cara menggabungkan beberapa file PDF?' : 'How do I merge multiple PDF files?',
      a: lang === 'id' 
        ? 'Cukup pilih alat "Gabungkan PDF", seret dokumen ke dropzone pintar, atur urutan halaman sesuai keinginan, lalu klik proses untuk mengunduh hasilnya seketika.' 
        : 'Select the "Merge PDF" tool, drag files into the smart dropzone, arrange page order, and download your combined document instantly.'
    },
    {
      q: lang === 'id' ? 'Bisa digunakan di perangkat apa saja?' : 'What devices are supported?',
      a: lang === 'id' 
        ? 'KlikPDF berjalan responsif di Windows, macOS, Linux, ChromeOS, iOS, maupun smartphone Android tanpa wajib mengunduh aplikasi tambahan.' 
        : 'KlikPDF works seamlessly across all devices including Windows, macOS, Linux, iOS, and Android smartphones.'
    }
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* 1. MODERN COMPACT HERO & CATEGORY BAR */}
      <section className="hero-mesh rounded-3xl p-5 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        {/* Ambient Glow Spotlights */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-primary/25 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute -left-16 -top-16 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md border border-white/15 shadow-inner transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono text-emerald-300">v2.6 Live Engine</span>
              <span className="text-white/40">•</span>
              <span>{lang === 'id' ? 'Proses Instan di Browser Tanpa Antrean' : 'Instant In-Browser Processing Zero Queues'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
                {lang === 'id' ? 'Pusat Pengolahan Dokumen PDF Cepat & Mandiri' : 'Fast & Autonomous PDF Document Processing Center'}
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl">
              {lang === 'id' 
                ? 'Pilih tindakan langsung, seret dokumen ke dropzone pintar terpadu, atau gunakan tombol unggah cepat pada setiap kartu modul di bawah.'
                : 'Select actions directly, drag documents into the smart unified dropzone, or trigger quick upload on any card module below.'}
            </p>
          </div>

          {/* Metric Badges Widget */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 border border-white/15 hover:border-white/25 flex flex-col justify-between transition-all shadow-md shadow-black/20">
              <span className="text-[10px] sm:text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                {lang === 'id' ? 'Kecepatan Rata2' : 'Avg Speed'}
              </span>
              <span className="text-lg sm:text-2xl font-extrabold text-white mt-1">1.4 Detik</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Multi-core Engine
              </span>
            </div>

            <div className="bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 border border-white/15 hover:border-white/25 flex flex-col justify-between transition-all shadow-md shadow-black/20">
              <span className="text-[10px] sm:text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                {lang === 'id' ? 'Enkripsi Privat' : 'Private Encryption'}
              </span>
              <span className="text-lg sm:text-2xl font-extrabold text-white mt-1">256-Bit SSL</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">lock</span> Zero Data Storage
              </span>
            </div>

            <div className="bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 border border-white/15 hover:border-white/25 col-span-2 sm:col-span-1 flex flex-col justify-between transition-all shadow-md shadow-black/20">
              <span className="text-[10px] sm:text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                {lang === 'id' ? 'Biaya & Kuota' : 'Cost & Limit'}
              </span>
              <span className="text-lg sm:text-2xl font-extrabold text-amber-300 mt-1">100% Gratis</span>
              <span className="text-[10px] text-slate-300 flex items-center gap-1 mt-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{activeUsers} Online</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Category Segment Control Bar (Swipeable on Mobile) */}
        <div className="mt-6 sm:mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap" id="categoryFilterGroup">
            {[
              { id: 'all', label: lang === 'id' ? 'Semua Alat' : 'All Tools', icon: 'apps' },
              { id: 'kompresi', label: lang === 'id' ? 'Kompresi' : 'Compress', icon: 'compress' },
              { id: 'konversi', label: lang === 'id' ? 'Konversi' : 'Convert', icon: 'sync_alt' },
              { id: 'edit', label: lang === 'id' ? 'Edit & Tanda Tangan' : 'Edit & Sign', icon: 'edit_note' },
              { id: 'keamanan', label: lang === 'id' ? 'Keamanan & Sandi' : 'Security', icon: 'shield' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                type="button"
                className={`category-pill shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-primary to-rose-600 text-white shadow-lg shadow-primary/30 border border-primary/50'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-300 font-mono hidden md:flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === 'id' ? 'Filter Real-time Aktif' : 'Real-time Filter Active'}</span>
          </div>
        </div>
      </section>

      {/* Mobile Instant Tool Search Input */}
      <div className="md:hidden">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            type="text"
            placeholder={lang === 'id' ? "Cari 24+ alat PDF (kompres, word, tanda tangan)..." : "Search 24+ PDF tools (compress, word, sign)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-surface-card dark:bg-[#151928] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-navy-deep dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CORE WORKSPACE: SMART DROPZONE & LIVE TELEMETRY WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CENTRAL SMART MULTI-FILE DROPZONE (8 Cols) */}
        <section className="lg:col-span-8 bg-white/90 dark:bg-[#131728]/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-5 sm:p-7 relative transition-all">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/10 to-rose-100 dark:from-rose-950/60 dark:to-primary/20 text-primary dark:text-rose-400 flex items-center justify-center font-bold shadow-xs">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-navy-deep dark:text-white">Smart Unified Dropzone</h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'id' ? 'Deteksi format instan & rekomendasi tindakan otomatis' : 'Instant format detection & automated tool recommendation'}
                </p>
              </div>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/60 dark:border-slate-700">
              Maks. 200 MB
            </span>
          </div>

          {/* Interactive Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDropzoneDragging(true);
            }}
            onDragLeave={() => setIsDropzoneDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDropzoneDragging(false);
              handleFilesQueued(e.dataTransfer.files);
            }}
            onClick={() => masterFileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center ${
              isDropzoneDragging
                ? 'border-primary bg-crimson-glow/30 dark:bg-rose-950/30 scale-[1.008] shadow-lg shadow-primary/10'
                : 'border-slate-300/90 dark:border-slate-700 hover:border-primary/80 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 active:scale-[0.99]'
            }`}
          >
            <input
              ref={masterFileInputRef}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              className="hidden"
              multiple
              type="file"
              onChange={(e) => handleFilesQueued(e.target.files)}
            />

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-3">
              <span className="material-symbols-outlined text-[30px] sm:text-[34px]">cloud_upload</span>
            </div>

            <h3 className="text-base sm:text-xl font-extrabold text-navy-deep dark:text-white group-hover:text-primary transition-colors">
              {lang === 'id' ? 'Tarik Dokumen atau Ketuk untuk Memilih' : 'Drag & Drop or Tap to Choose File'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-4 sm:mb-5 leading-relaxed">
              {lang === 'id' ? (
                <>
                  KlikPDF otomatis mendeteksi apakah file perlu <span className="font-bold text-primary">dikompres</span>, <span className="font-bold text-indigo-600 dark:text-indigo-400">dikonversi</span>, atau <span className="font-bold text-emerald-600 dark:text-emerald-400">digabungkan</span>.
                </>
              ) : (
                <>
                  KlikPDF automatically detects whether your file should be <span className="font-bold text-primary">compressed</span>, <span className="font-bold text-indigo-600 dark:text-indigo-400">converted</span>, or <span className="font-bold text-emerald-600 dark:text-emerald-400">merged</span>.
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  masterFileInputRef.current?.click();
                }}
                className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-primary via-rose-600 to-crimson-dark hover:from-crimson-dark hover:to-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>{lang === 'id' ? 'Pilih Berkas dari Perangkat' : 'Choose File From Device'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="text-slate-400 dark:text-slate-500 font-medium">{lang === 'id' ? 'atau impor:' : 'or import:'}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCloudNotice('Google Drive');
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-semibold text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 shadow-2xs"
                >
                  Google Drive
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCloudNotice('Dropbox');
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-semibold text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 shadow-2xs"
                >
                  Dropbox
                </button>
              </div>
            </div>

            {/* Live Detection Notification Banner */}
            <div className="w-full mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">{lang === 'id' ? 'Format Didukung:' : 'Supported:'}</span>
                <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 font-mono text-[10px] font-extrabold text-primary">PDF</span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 font-mono text-[10px] font-extrabold text-blue-600 dark:text-blue-400">WORD</span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 font-mono text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">EXCEL</span>
                <span className="px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-900/60 font-mono text-[10px] font-extrabold text-orange-600 dark:text-orange-400">PPT</span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60 font-mono text-[10px] font-extrabold text-amber-600 dark:text-amber-400">JPG/PNG</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] sm:text-xs">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>{lang === 'id' ? 'Pembersihan otomatis < 2 jam' : 'Auto cleanup < 2 hours'}</span>
              </div>
            </div>
          </div>

          {/* Detected File Queue Preview Container */}
          {queuedFiles.length > 0 && (
            <div className="mt-4 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 pb-1">
                <span>{lang === 'id' ? `Berkas Terdeteksi (${queuedFiles.length} Siap Diproses):` : `Detected Files (${queuedFiles.length} Ready):`}</span>
                <button
                  type="button"
                  onClick={() => setQueuedFiles([])}
                  className="text-primary hover:underline text-[11px] font-bold cursor-pointer"
                >
                  {lang === 'id' ? 'Batal Semua' : 'Clear All'}
                </button>
              </div>

              <div className="space-y-1.5">
                {queuedFiles.map((file, idx) => {
                  const recommendation = getToolRecommendation(file.name);
                  const ext = file.name.split('.').pop().toUpperCase();
                  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px] shrink-0">draft</span>
                        <div className="min-w-0">
                          <p className="font-bold text-navy-deep dark:text-white truncate">{file.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{sizeMB} MB • {ext}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${recommendation.badgeColor}`}>
                          {recommendation.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectTool(recommendation.toolId, [file])}
                          className="px-3 py-1 bg-primary hover:bg-crimson-dark text-white rounded font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                        >
                          {lang === 'id' ? 'Mulai' : 'Start'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* LIVE PERFORMANCE & TELEMETRY WIDGETS (4 Cols) */}
        <aside className="lg:col-span-4 space-y-4">
          
          {/* Widget 1: Penghematan Ruang Hari Ini */}
          <div className="bg-white/90 dark:bg-[#131728]/90 backdrop-blur-xl rounded-3xl border border-emerald-500/20 dark:border-emerald-500/30 shadow-lg p-5 sm:p-6 relative overflow-hidden transition-all hover:border-emerald-500/40">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">save</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy-deep dark:text-white">
                    {lang === 'id' ? 'Penghematan Ruang Hari Ini' : 'Today\'s Storage Saved'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'id' ? 'Kalkulasi real-time kompresi KlikPDF' : 'Real-time KlikPDF compression metrics'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>LIVE ID</span>
              </span>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800/80 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {lang === 'id' ? 'Kapasitas Diselamatkan:' : 'Capacity Saved:'}
                </span>
                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent font-mono">
                  {savedStorageGB.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} GB
                </span>
              </div>

              {/* Progress representation */}
              <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm" style={{ width: '86.4%' }}></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>{lang === 'id' ? 'Efisiensi Rata-rata:' : 'Avg Efficiency:'} <strong className="text-emerald-600 dark:text-emerald-400 font-bold">86.4%</strong></span>
                <span>{lang === 'id' ? 'Dokumen:' : 'Docs:'} <strong>34,920</strong></span>
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">bolt</span>
                {lang === 'id' ? 'Proses instan tanpa beban memori PC' : 'Instant processing with zero PC memory burden'}
              </span>
            </div>
          </div>

          {/* Widget 2: Status Server Enkripsi Aktif */}
          <div className="bg-white/90 dark:bg-[#131728]/90 backdrop-blur-xl rounded-3xl border border-indigo-500/20 dark:border-indigo-500/30 shadow-lg p-5 sm:p-6 transition-all hover:border-indigo-500/40">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-100 to-blue-50 dark:from-indigo-950/60 dark:to-blue-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy-deep dark:text-white">
                    {lang === 'id' ? 'Status Server Enkripsi' : 'Encryption Server Status'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'id' ? 'Kluster Cloud Jakarta & Surabaya' : 'Jakarta & Surabaya Cloud Clusters'}
                  </p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">lock_open</span>
                  {lang === 'id' ? 'Protokol TLS / SSL' : 'TLS / SSL Protocol'}
                </span>
                <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200">TLS 1.3 (256-Bit)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">auto_delete</span>
                  {lang === 'id' ? 'Pembersihan Cache' : 'Cache Cleanup'}
                </span>
                <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200">
                  {lang === 'id' ? 'Tiap 120 Menit' : 'Every 120 Mins'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">policy</span>
                  {lang === 'id' ? 'Log & Kebijakan' : 'Audit Policy'}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Zero-Log Audit</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. FULL INTERACTIVE ACTION TOOL MATRIX GRID */}
      <section className="pt-4 scroll-mt-20" id="matrixGrid">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider font-mono">
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              {lang === 'id' ? 'Katalog Alat Lengkap & Aksi Langsung' : 'Full Tool Catalog & Direct Action'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-navy-deep dark:text-white mt-0.5">
              {lang === 'id' ? 'Matriks Perkakas PDF Interaktif' : 'Interactive PDF Tools Matrix'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {lang === 'id' 
                ? 'Setiap modul dilengkapi trigger langsung untuk memilih file dan memulai pengolahan seketika.'
                : 'Each module is equipped with direct file triggers to process documents instantly.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>
              {lang === 'id' 
                ? `Menampilkan ${filteredTools.length} Modul Tersedia`
                : `Showing ${filteredTools.length} Available Modules`}
            </span>
          </div>
        </div>

        {/* TOOL CARDS GRID */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5" id="toolCardsContainer">
            {filteredTools.map((tool) => (
              <div
                key={tool.id + '-' + tool.name}
                onClick={() => onSelectTool(tool.id, [])}
                className="tool-card card-lift group bg-white/90 dark:bg-[#131728]/90 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 p-4 sm:p-5 shadow-2xs transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-xs ${tool.iconBg}`}>
                      <span className="material-symbols-outlined text-[24px]">{tool.icon}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono tracking-wider shadow-2xs ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">{tool.speed}</span>
                    </div>
                  </div>

                  <h3 className="text-[15px] font-extrabold text-navy-deep dark:text-white group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{tool.name}</span>
                    <span className="material-symbols-outlined text-[18px] text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all">
                      arrow_forward
                    </span>
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div 
                  className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary dark:hover:bg-primary text-slate-700 dark:text-slate-200 hover:text-white text-xs font-bold transition-all active:scale-95 shadow-2xs">
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>{lang === 'id' ? 'Pilih File' : 'Pick File'}</span>
                    <input
                      type="file"
                      accept={tool.accept}
                      multiple={tool.multiple}
                      className="hidden card-file-trigger"
                      onChange={(e) => handleDirectCardFile(tool.id, e.target.files)}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => onSelectTool(tool.id, [])}
                    className="w-9 h-9 rounded-xl border border-slate-200/90 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:text-rose-400 text-slate-400 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                    title={lang === 'id' ? 'Buka Ruang Kerja Alat' : 'Open Workspace'}
                  >
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No match fallback message */
          <div className="py-12 text-center bg-white/90 dark:bg-[#131728]/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 mt-4 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">find_in_page</span>
            <h4 className="text-base font-bold text-navy-deep dark:text-white">
              {lang === 'id' ? 'Tidak menemukan alat yang sesuai' : 'No matching tools found'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {lang === 'id' 
                ? "Coba gunakan kata kunci umum seperti 'kompres', 'word', 'kunci', atau reset pencarian."
                : "Try using broader search terms such as 'compress', 'word', 'lock', or reset filters."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                const searchEl = document.getElementById('globalToolSearch');
                if (searchEl) searchEl.value = '';
              }}
              className="mt-3 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-crimson-dark transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {lang === 'id' ? 'Reset Filter & Tampilkan Semua' : 'Reset Filter & Show All'}
            </button>
          </div>
        )}
      </section>

      {/* 4. WORKFLOW QUICK BENCHMARK STRIP */}
      <section className="bg-white/90 dark:bg-[#131728]/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-all">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="flex items-start gap-4 pt-4 md:pt-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-100 to-primary/10 text-primary dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">memory</span>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-navy-deep dark:text-white">
                {lang === 'id' ? 'WebAssembly Multi-Core' : 'WebAssembly Multi-Core'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {lang === 'id'
                  ? 'Eksekusi kompresi dan rotasi dokumen dijalankan langsung via teknologi WebAssembly di CPU peramban tanpa antrean server.'
                  : 'Document operations execute client-side via optimized WebAssembly algorithms directly on your CPU.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">shield_lock</span>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-navy-deep dark:text-white">
                {lang === 'id' ? 'Kerahasiaan Dokumen Terjamin' : 'Confidential Data Sandbox'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {lang === 'id'
                  ? 'Seluruh file diproses dalam lingkungan Sandbox memori tertutup. Tidak ada konten teks atau lampiran yang diindeks model AI.'
                  : 'Files are processed inside isolated memory sandboxes. Zero user documents are used for model training.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-100 to-blue-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">devices</span>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-navy-deep dark:text-white">
                {lang === 'id' ? 'Kompatibel di Semua OS' : 'Universal Device Compatibility'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {lang === 'id'
                  ? 'Berjalan responsif di Windows, macOS, Linux, ChromeOS, iOS, maupun ponsel Android tanpa wajib instal APK/software.'
                  : 'Seamlessly functions across Windows, macOS, Linux, ChromeOS, iOS, and Android without installation.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION SECTION */}
      <section className="bg-surface-card dark:bg-[#151928] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xs transition-colors" id="faq-section">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-xs font-bold text-primary uppercase font-mono tracking-wider">
            {lang === 'id' ? 'Pertanyaan Umum' : 'Frequently Asked Questions'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-navy-deep dark:text-white mt-1">
            {lang === 'id' ? 'Pusat Bantuan & Panduan KlikPDF' : 'KlikPDF Help Center & FAQ'}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto divide-y divide-slate-200/80 dark:divide-slate-800">
          {faqs.map((faq, index) => (
            <div key={index} className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-navy-deep dark:text-white hover:text-primary transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${openFaq === index ? 'rotate-180 text-primary' : ''}`}>
                  expand_more
                </span>
              </button>
              {openFaq === index && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Cloud Import Helper Modal */}
      {cloudNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">cloud_sync</span>
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-navy-deep dark:text-white">
                {lang === 'id' ? `Integrasi ${cloudNotice}` : `${cloudNotice} Integration`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {lang === 'id' 
                  ? `Koneksi aman ke ${cloudNotice} siap digunakan. Untuk saat ini, silakan unduh berkas ke perangkat Anda dan seret langsung ke kotak dropzone untuk privasi 100% lokal.`
                  : `Secure link to ${cloudNotice} is initialized. For immediate zero-trace processing, select the file directly on your device.`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCloudNotice(null);
                  masterFileInputRef.current?.click();
                }}
                className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-crimson-dark transition-colors cursor-pointer"
              >
                {lang === 'id' ? 'Pilih Berkas Lokal' : 'Choose Local File'}
              </button>
              <button
                type="button"
                onClick={() => setCloudNotice(null)}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {lang === 'id' ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

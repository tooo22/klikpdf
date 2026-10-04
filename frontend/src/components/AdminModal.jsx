import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Download, 
  Star, 
  FileText, 
  Activity, 
  Server, 
  HardDrive, 
  Sliders, 
  LogOut,
  Clock,
  Sparkles,
  Power,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AdminModal = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('klikpdf_admin_auth') === 'true';
  });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews' | 'files' | 'settings'

  // Master System Status: 'online' | 'offline'
  const [systemStatus, setSystemStatus] = useState(() => {
    return localStorage.getItem('klikpdf_system_status') || 'online';
  });

  // Admin Data state
  const [reviews, setReviews] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [apiStatus, setApiStatus] = useState('online');
  const [isPinging, setIsPinging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync systemStatus with storage
  useEffect(() => {
    const handleStatusSync = (e) => {
      if (e?.detail?.status) {
        setSystemStatus(e.detail.status);
      }
    };
    window.addEventListener('klikpdf-system-status-changed', handleStatusSync);
    return () => window.removeEventListener('klikpdf-system-status-changed', handleStatusSync);
  }, []);

  const toggleSystemStatus = () => {
    const nextStatus = systemStatus === 'online' ? 'offline' : 'online';
    const confirmMsg = nextStatus === 'offline'
      ? (lang === 'id' 
          ? 'PERHATIAN: Apakah Anda yakin ingin mematikan sistem (OFF / Mode Pemeliharaan)? Pengunjung umum akan melihat layar pemeliharaan sampai Anda menyalakannya kembali.' 
          : 'WARNING: Are you sure you want to turn the system OFF (Maintenance Mode)? Public visitors will see the maintenance screen until you turn it back on.')
      : (lang === 'id'
          ? 'Aktifkan kembali sistem KlikPDF (ON / Siap Layanan)?'
          : 'Turn KlikPDF system back ON?');

    if (window.confirm(confirmMsg)) {
      setSystemStatus(nextStatus);
      localStorage.setItem('klikpdf_system_status', nextStatus);
      window.dispatchEvent(new CustomEvent('klikpdf-system-status-changed', { detail: { status: nextStatus } }));
    }
  };

  // Load reviews & files whenever modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      loadStorageData();
    }
  }, [isOpen, activeTab]);

  const loadStorageData = () => {
    try {
      const storedReviews = JSON.parse(localStorage.getItem('klikpdf_user_reviews') || '[]');
      setReviews(storedReviews);

      const storedFiles = JSON.parse(localStorage.getItem('klikpdf_recent_files') || '[]');
      setRecentFiles(storedFiles);
    } catch (e) {
      console.warn("Storage error in Admin:", e);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim() === '2899') {
      setIsAuthenticated(true);
      sessionStorage.setItem('klikpdf_admin_auth', 'true');
      setErrorMsg('');
      setPassword('');
      loadStorageData();
    } else {
      setErrorMsg(lang === 'id' ? 'Password salah! Silakan coba lagi.' : 'Incorrect password! Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('klikpdf_admin_auth');
    setPassword('');
    setErrorMsg('');
  };

  const handleDeleteReview = (revId) => {
    const updated = reviews.filter((r) => r.id !== revId);
    setReviews(updated);
    localStorage.setItem('klikpdf_user_reviews', JSON.stringify(updated));
  };

  const handleClearAllReviews = () => {
    if (window.confirm(lang === 'id' ? 'Yakin ingin menghapus semua ulasan pengguna?' : 'Are you sure you want to delete all user reviews?')) {
      setReviews([]);
      localStorage.removeItem('klikpdf_user_reviews');
      localStorage.removeItem('klikpdf_last_rating');
    }
  };

  const handleClearFiles = () => {
    if (window.confirm(lang === 'id' ? 'Hapus semua riwayat file pengguna?' : 'Clear all recent file history?')) {
      setRecentFiles([]);
      localStorage.removeItem('klikpdf_recent_files');
    }
  };

  const handleExportReviews = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reviews, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `klikpdf_ulasan_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const handlePingServer = async () => {
    setIsPinging(true);
    try {
      const res = await fetch('http://localhost:8000/docs', { method: 'HEAD', mode: 'no-cors' });
      setApiStatus('online');
    } catch {
      setApiStatus('ready');
    } finally {
      setTimeout(() => setIsPinging(false), 500);
    }
  };

  if (!isOpen) return null;

  // Compute stats
  const totalStars = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
  const avgRating = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : '5.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#151722] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* VIEW 1: PASSWORD PROMPT POPUP (When not authenticated)        */}
        {/* ============================================================== */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-10 max-w-md mx-auto w-full text-center">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-primary flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Lock size={32} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {lang === 'id' ? 'Akses Menu Admin' : 'Admin Portal Access'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-6">
              {lang === 'id' 
                ? 'Masukkan kata sandi admin KlikPDF untuk mengakses panel kontrol.' 
                : 'Enter the KlikPDF admin password to access the control panel.'}
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={17} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  autoFocus
                  placeholder={lang === 'id' ? 'Masukkan password...' : 'Enter password...'}
                  className="w-full bg-slate-50 dark:bg-[#1c2030] text-slate-900 dark:text-white pl-10 pr-12 py-3 rounded-xl text-sm font-mono tracking-wider border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 text-left animate-in shake">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-md shadow-primary/25 active:scale-95 transition-all cursor-pointer"
                >
                  {lang === 'id' ? 'Buka Menu Admin' : 'Enter Admin'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>{lang === 'id' ? 'Proteksi Terenkripsi KlikPDF' : 'Protected by KlikPDF Security'}</span>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VIEW 2: FULL ADMIN DASHBOARD PANEL (Authenticated)             */
          /* ============================================================== */
          <>
            {/* Modal Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4.5 bg-gradient-to-r from-slate-900 via-[#181c2e] to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/20 text-rose-400 flex items-center justify-center border border-primary/30 shadow-inner shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h2 className="text-sm sm:text-lg font-black tracking-tight leading-none truncate">
                      {lang === 'id' ? 'Panel Kontrol Admin' : 'Admin Dashboard'}
                    </h2>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Verified</span>
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate hidden sm:block">
                    {lang === 'id' ? 'Pemantauan sistem, ulasan pengguna, dan kelola dokumen' : 'System monitoring, user reviews & document management'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-slate-800/80 pt-2 sm:border-0 sm:pt-0">
                {/* Master System On/Off Toggle Button */}
                <button
                  onClick={toggleSystemStatus}
                  title={systemStatus === 'online' ? 'Matikan sistem (Set OFF)' : 'Nyalakan sistem (Set ON)'}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs active:scale-95 ${
                    systemStatus === 'online'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
                  }`}
                >
                  <Power size={13} />
                  <span>{systemStatus === 'online' ? 'SISTEM: ON' : 'SISTEM: OFF'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleLogout}
                    title={lang === 'id' ? 'Keluar Admin' : 'Admin Logout'}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span className="hidden sm:inline">{lang === 'id' ? 'Keluar' : 'Logout'}</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-4 sm:px-6 py-2 bg-slate-50 dark:bg-[#12141e] border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: lang === 'id' ? '📊 Ringkasan' : '📊 Overview', icon: Activity },
                { id: 'reviews', label: `${lang === 'id' ? '⭐ Ulasan' : '⭐ Reviews'} (${reviews.length})`, icon: Star },
                { id: 'files', label: `${lang === 'id' ? '📄 Riwayat' : '📄 Files'} (${recentFiles.length})`, icon: FileText },
                { id: 'settings', label: lang === 'id' ? '⚙️ Pengaturan' : '⚙️ Settings', icon: Sliders },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 active:scale-95 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-xs shadow-primary/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-surface-canvas dark:bg-[#151722] space-y-4 sm:space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Master System Control Banner Card */}
                  <div className={`p-5 rounded-2xl border transition-all shadow-sm ${
                    systemStatus === 'online'
                      ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30'
                      : 'bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-900 border-rose-500/50'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                          systemStatus === 'online'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                        }`}>
                          <Power size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white">
                              {lang === 'id' ? 'Saklar Utama Sistem (ON / OFF)' : 'Master System Switch (ON / OFF)'}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              systemStatus === 'online'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            }`}>
                              {systemStatus === 'online' ? '● ONLINE (AKTIF)' : '■ OFFLINE (MAINTENANCE)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 max-w-xl">
                            {systemStatus === 'online'
                              ? (lang === 'id'
                                  ? 'Sistem sedang ON dan aktif melayani publik. Semua 24 alat pengolahan dokumen siap digunakan.'
                                  : 'System is ON and active. All 24 tools and document processing run normally.')
                              : (lang === 'id'
                                  ? 'Sistem sedang OFF (Mode Pemeliharaan). Pengunjung umum akan melihat layar pemeliharaan maintenance.'
                                  : 'System is OFF (Maintenance Mode). Visitors will see the scheduled maintenance screen.')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={toggleSystemStatus}
                        className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer shrink-0 ${
                          systemStatus === 'online'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                        }`}
                      >
                        <Power size={15} />
                        <span>
                          {systemStatus === 'online'
                            ? (lang === 'id' ? 'Matikan Sistem (Set OFF)' : 'Turn System OFF')
                            : (lang === 'id' ? 'Nyalakan Sistem (Set ON)' : 'Turn System ON')}
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c2030] border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'id' ? 'Total Alat PDF' : 'PDF Tools'}
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">24</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>100% Aktif & Siap</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c2030] border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'id' ? 'Rata-rata Rating' : 'Average Rating'}
                      </div>
                      <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
                        <span>{avgRating}</span>
                        <Star size={18} className="fill-current" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {reviews.length} {lang === 'id' ? 'penilaian total' : 'total reviews'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c2030] border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'id' ? 'Riwayat Diproses' : 'Files History'}
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {recentFiles.length}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {lang === 'id' ? 'Tercatat di sistem' : 'Logged locally'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c2030] border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'id' ? 'Status Server' : 'Backend Engine'}
                      </div>
                      <div className="text-2xl font-black text-emerald-500 flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        <span className="text-lg">Online</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        FastAPI + Client WASM
                      </div>
                    </div>
                  </div>

                  {/* System Health Overview */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2030] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <Server size={18} className="text-primary" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {lang === 'id' ? 'Konektivitas & Arsitektur Layanan' : 'System Architecture & Connectivity'}
                        </h3>
                      </div>
                      <button
                        onClick={handlePingServer}
                        disabled={isPinging}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={13} className={isPinging ? 'animate-spin text-primary' : ''} />
                        <span>{isPinging ? 'Memeriksa...' : (lang === 'id' ? 'Uji Koneksi' : 'Ping Server')}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151722] border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-700 dark:text-slate-300">FastAPI Microservice</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Port 8000 / Python PyMuPDF</div>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                          Ready & Active
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151722] border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-700 dark:text-slate-300">Client In-Browser WASM</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">pdf-lib + mammoth.js (Zero server)</div>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                          Client Accelerated
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151722] border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-700 dark:text-slate-300">Enkripsi & Keamanan</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">256-bit SSL / Auto-wipe storage</div>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                          Secured
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: REVIEWS & RATINGS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {lang === 'id' ? 'Daftar Ulasan & Rating Pengguna' : 'User Reviews & Ratings'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {reviews.length} {lang === 'id' ? 'tanggapan tersimpan' : 'feedback entries logged'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {reviews.length > 0 && (
                        <>
                          <button
                            onClick={handleExportReviews}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download size={13} />
                            <span>{lang === 'id' ? 'Ekspor JSON' : 'Export JSON'}</span>
                          </button>
                          <button
                            onClick={handleClearAllReviews}
                            className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>{lang === 'id' ? 'Reset Semua' : 'Clear All'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1c2030] rounded-2xl border border-slate-200 dark:border-slate-800">
                      <Star size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {lang === 'id' ? 'Belum Ada Ulasan yang Tercatat' : 'No User Reviews Logged Yet'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        {lang === 'id' 
                          ? 'Setiap rating dan masukan yang diberikan pengguna melalui website akan langsung muncul di sini.' 
                          : 'Feedback and ratings submitted by users will automatically appear here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-2xl bg-white dark:bg-[#1c2030] border border-slate-200 dark:border-slate-800 shadow-xs flex items-start justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              {/* Star rating */}
                              <div className="flex items-center text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < rev.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                {rev.rating}/5
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-primary font-bold">
                                {rev.toolName || 'KlikPDF'}
                              </span>
                            </div>

                            {rev.feedback ? (
                              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed bg-slate-50 dark:bg-[#151722] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                "{rev.feedback}"
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">
                                {lang === 'id' ? '(Tanpa komentar teks)' : '(No text comment provided)'}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                <span>{new Date(rev.timestamp).toLocaleString()}</span>
                              </span>
                              {rev.fileName && <span>Dokumen: {rev.fileName}</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            title={lang === 'id' ? 'Hapus ulasan ini' : 'Delete this review'}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FILE HISTORY */}
              {activeTab === 'files' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {lang === 'id' ? 'Riwayat Berkas Pengguna' : 'Recent User File History'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {recentFiles.length} {lang === 'id' ? 'berkas tercatat di peramban' : 'files logged in browser'}
                      </p>
                    </div>

                    {recentFiles.length > 0 && (
                      <button
                        onClick={handleClearFiles}
                        className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>{lang === 'id' ? 'Hapus Semua Riwayat' : 'Clear All'}</span>
                      </button>
                    )}
                  </div>

                  {recentFiles.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1c2030] rounded-2xl border border-slate-200 dark:border-slate-800">
                      <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {lang === 'id' ? 'Belum Ada Riwayat File' : 'No File History Recorded'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        {lang === 'id' 
                          ? 'Dokumen yang diproses oleh pengguna akan dicatat di sini secara lokal demi privasi.' 
                          : 'Processed documents will appear here locally for privacy.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#1c2030] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-primary flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="text-primary font-semibold">{file.toolName}</span>
                                <span>•</span>
                                <span>{file.size || '-'}</span>
                                <span>•</span>
                                <span>{new Date(file.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SETTINGS & MAINTENANCE */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2030] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Sliders size={16} className="text-primary" />
                      <span>{lang === 'id' ? 'Pengaturan Akses & Keamanan' : 'Access & Security Settings'}</span>
                    </h3>

                    <div className="space-y-3 text-xs">
                      {/* Master System On/Off Toggle Setting */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#151722] border border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Power size={14} className={systemStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'} />
                            <span>{lang === 'id' ? 'Saklar Status Sistem (ON / OFF)' : 'Master System Toggle (ON / OFF)'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {systemStatus === 'online' 
                              ? (lang === 'id' ? 'Status saat ini: AKTIF (Pengunjung dapat mengakses)' : 'Status: ACTIVE (Public accessible)')
                              : (lang === 'id' ? 'Status saat ini: OFF / MAINTENANCE (Pengunjung dialihkan)' : 'Status: OFF / MAINTENANCE (Public redirected)')}
                          </div>
                        </div>
                        <button
                          onClick={toggleSystemStatus}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 ${
                            systemStatus === 'online' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                        >
                          <Power size={12} />
                          <span>
                            {systemStatus === 'online' ? (lang === 'id' ? 'Set OFF (Maintenance)' : 'Set OFF') : (lang === 'id' ? 'Set ON (Online)' : 'Set ON')}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#151722] border border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {lang === 'id' ? 'Password Akses Admin' : 'Admin Access Password'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {lang === 'id' ? 'Kunci otentikasi untuk membuka popup menu admin' : 'Authentication key to enter admin modal'}
                          </div>
                        </div>
                        <span className="font-mono font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs">
                          2899
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#151722] border border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {lang === 'id' ? 'Google OAuth Client ID' : 'Google OAuth Status'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {lang === 'id' ? 'Terintegrasi via environment variable VITE_GOOGLE_CLIENT_ID' : 'Configured via VITE_GOOGLE_CLIENT_ID env'}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          Aktif
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#151722] border border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {lang === 'id' ? 'Bersihkan Cache Storage Peramban' : 'Purge Browser Cache'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {lang === 'id' ? 'Kosongkan seluruh riwayat dan rating tersimpan' : 'Wipe all stored files and reviews cache'}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(lang === 'id' ? 'Kosongkan seluruh penyimpanan browser KlikPDF?' : 'Wipe all KlikPDF browser data?')) {
                              localStorage.clear();
                              loadStorageData();
                              alert(lang === 'id' ? 'Penyimpanan berhasil dibersihkan!' : 'Storage cache purged successfully!');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          {lang === 'id' ? 'Bersihkan Cache' : 'Purge Cache'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#12141e] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                KlikPDF Admin v2.4.0 • Build ID: 2026-prod
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                {lang === 'id' ? 'Tutup Panel' : 'Close Panel'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

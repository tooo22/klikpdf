import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { RecentFilesModal } from './components/RecentFilesModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { RatingModal } from './components/RatingModal';
import { AdminModal } from './components/AdminModal';
import { HomePage } from './pages/HomePage';
import { ToolWorkspace } from './pages/ToolWorkspace';
import { ShieldCheck, Wrench, AlertTriangle, RefreshCw, Lock, Power } from 'lucide-react';

function AppContent() {
  const { lang } = useLanguage();
  const getToolFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || null;
  };

  const [activeToolId, setActiveToolId] = useState(getToolFromHash());
  const [initialFiles, setInitialFiles] = useState([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingToolName, setRatingToolName] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Master System Status: 'online' | 'offline'
  const [systemStatus, setSystemStatus] = useState(() => {
    return localStorage.getItem('klikpdf_system_status') || 'online';
  });

  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return sessionStorage.getItem('klikpdf_admin_auth') === 'true';
  });

  useEffect(() => {
    const handleOpenRating = (e) => {
      setRatingToolName(e?.detail?.toolName || null);
      setIsRatingModalOpen(true);
    };
    const handleOpenAdmin = () => {
      setIsAdminModalOpen(true);
    };
    const handleStatusSync = (e) => {
      if (e?.detail?.status) {
        setSystemStatus(e.detail.status);
      }
      setIsAdminAuth(sessionStorage.getItem('klikpdf_admin_auth') === 'true');
    };

    window.addEventListener('open-rating-modal', handleOpenRating);
    window.addEventListener('open-admin-modal', handleOpenAdmin);
    window.addEventListener('klikpdf-system-status-changed', handleStatusSync);
    return () => {
      window.removeEventListener('open-rating-modal', handleOpenRating);
      window.removeEventListener('open-admin-modal', handleOpenAdmin);
      window.removeEventListener('klikpdf-system-status-changed', handleStatusSync);
    };
  }, []);

  // Disable browser automatic scroll restoration to avoid landing at bottom of shorter pages
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Listen to browser Back / Forward buttons & Hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setActiveToolId(getToolFromHash());
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Guarantee scroll-to-top whenever the active tool changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeToolId]);

  const handleSelectTool = (toolId, files = []) => {
    setActiveToolId(toolId);
    setInitialFiles(files || []);
    window.location.hash = `#/${toolId}`;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleGoHome = () => {
    setActiveToolId(null);
    setInitialFiles([]);
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // ==============================================================
  // PUBLIC MAINTENANCE SCREEN (When System is OFF and visitor is not admin)
  // ==============================================================
  if (systemStatus === 'offline' && !isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </div>
            <div className="flex items-center tracking-tight font-extrabold text-xl">
              <span>Klik</span>
              <span className="text-primary ml-0.5">PDF</span>
            </div>
          </div>

          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <ShieldCheck size={14} className="text-primary" />
            <span>{lang === 'id' ? 'Akses Admin' : 'Admin Login'}</span>
          </button>
        </div>

        {/* Center Maintenance Message */}
        <div className="max-w-md mx-auto text-center my-auto py-12 z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-primary flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Wrench size={38} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span>{lang === 'id' ? 'Mode Pemeliharaan Aktif (OFF)' : 'Maintenance Mode Active (OFF)'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            {lang === 'id' ? 'Sistem Sedang Dalam Pemeliharaan' : 'System Under Maintenance'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
            {lang === 'id'
              ? 'Kami sedang melakukan pemeliharaan server berkala dan optimalisasi sistem. Seluruh layanan pengolahan dokumen KlikPDF akan segera aktif kembali.'
              : 'We are currently performing scheduled maintenance and server performance upgrades. All KlikPDF tools will be back online shortly.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/25 active:scale-95"
            >
              <RefreshCw size={14} />
              <span>{lang === 'id' ? 'Muat Ulang Halaman' : 'Refresh Page'}</span>
            </button>

            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Lock size={14} />
              <span>{lang === 'id' ? 'Masuk Admin (PIN: 2899)' : 'Admin Login (PIN: 2899)'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 z-10 font-mono">
          © {new Date().getFullYear()} KlikPDF • Status: Maintenance
        </div>

        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => {
            setIsAdminModalOpen(false);
            setIsAdminAuth(sessionStorage.getItem('klikpdf_admin_auth') === 'true');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between aura-bg dark:bg-[#090D16] text-text-primary dark:text-[#E4E4E7] transition-colors duration-200">
      <div>
        {/* Sticky Admin Warning Banner when System is OFF */}
        {systemStatus === 'offline' && (
          <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between sticky top-0 z-[60] shadow-md animate-pulse">
            <div className="flex items-center gap-2 max-w-[1280px] mx-auto w-full justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>
                  {lang === 'id'
                    ? '⚠️ SISTEM SAAT INI BERSTATUS OFF (MODE PEMELIHARAAN). Pengunjung umum dialihkan ke halaman maintenance.'
                    : '⚠️ SYSTEM IS CURRENTLY OFF (MAINTENANCE MODE). Public visitors see the maintenance screen.'}
                </span>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-3 py-1 bg-white text-rose-700 rounded-lg text-xs font-black hover:bg-rose-50 transition-colors cursor-pointer shrink-0 ml-3"
              >
                {lang === 'id' ? 'Nyalakan Sistem (ON)' : 'Turn System ON'}
              </button>
            </div>
          </div>
        )}

        <Navbar
          onSelectTool={handleSelectTool}
          onGoHome={handleGoHome}
        />
        <main>
          {activeToolId ? (
            <ToolWorkspace
              toolId={activeToolId}
              initialFiles={initialFiles}
              onGoHome={handleGoHome}
            />
          ) : (
            <HomePage onSelectTool={handleSelectTool} />
          )}
        </main>
      </div>
      <Footer onSelectTool={handleSelectTool} onGoHome={handleGoHome} />
      <LoginModal />
      <RecentFilesModal />
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        toolName={ratingToolName}
      />
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setIsAdminAuth(sessionStorage.getItem('klikpdf_admin_auth') === 'true');
        }}
      />

      <ChatbotWidget onSelectTool={handleSelectTool} isWorkspace={Boolean(activeToolId)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

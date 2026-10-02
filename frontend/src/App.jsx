import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
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
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const getToolFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || null;
  };

  const [activeToolId, setActiveToolId] = useState(getToolFromHash());
  const [initialFiles, setInitialFiles] = useState([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingToolName, setRatingToolName] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenRating = (e) => {
      setRatingToolName(e?.detail?.toolName || null);
      setIsRatingModalOpen(true);
    };
    const handleOpenAdmin = () => {
      setIsAdminModalOpen(true);
    };
    window.addEventListener('open-rating-modal', handleOpenRating);
    window.addEventListener('open-admin-modal', handleOpenAdmin);
    return () => {
      window.removeEventListener('open-rating-modal', handleOpenRating);
      window.removeEventListener('open-admin-modal', handleOpenAdmin);
    };
  }, []);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      setActiveToolId(getToolFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleSelectTool = (toolId, files = []) => {
    setActiveToolId(toolId);
    setInitialFiles(files || []);
    window.location.hash = `#/${toolId}`;
  };

  const handleGoHome = () => {
    setActiveToolId(null);
    setInitialFiles([]);
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col justify-between bg-surface dark:bg-[#0f1117] text-text-primary dark:text-[#E4E4E7] transition-colors duration-200">
            <div>
              <Navbar
                onSelectTool={handleSelectTool}
                onGoHome={handleGoHome}
                onOpenAdmin={() => setIsAdminModalOpen(true)}
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
            <Footer />
            <LoginModal />
            <RecentFilesModal />
            <RatingModal
              isOpen={isRatingModalOpen}
              onClose={() => setIsRatingModalOpen(false)}
              toolName={ratingToolName}
            />
            <AdminModal
              isOpen={isAdminModalOpen}
              onClose={() => setIsAdminModalOpen(false)}
            />
            
            {/* Quick Access Admin Badge on Bottom Left */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              title="Menu Admin (Password: 2899)"
              aria-label="Menu Admin"
              className="fixed bottom-6 left-6 z-40 px-3 py-2 rounded-2xl bg-white/95 dark:bg-[#18181B]/95 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-rose-400 text-xs font-bold shadow-lg shadow-black/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <ShieldCheck size={13} />
              </div>
              <span>Admin</span>
            </button>

            <ChatbotWidget onSelectTool={handleSelectTool} />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

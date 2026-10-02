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
import { HomePage } from './pages/HomePage';
import { ToolWorkspace } from './pages/ToolWorkspace';

export default function App() {
  const getToolFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || null;
  };

  const [activeToolId, setActiveToolId] = useState(getToolFromHash());
  const [initialFiles, setInitialFiles] = useState([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingToolName, setRatingToolName] = useState(null);

  useEffect(() => {
    const handleOpenRating = (e) => {
      setRatingToolName(e?.detail?.toolName || null);
      setIsRatingModalOpen(true);
    };
    window.addEventListener('open-rating-modal', handleOpenRating);
    return () => window.removeEventListener('open-rating-modal', handleOpenRating);
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
            <ChatbotWidget onSelectTool={handleSelectTool} />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

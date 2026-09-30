import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ToolWorkspace } from './pages/ToolWorkspace';

export default function App() {
  const getToolFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || null;
  };

  const [activeToolId, setActiveToolId] = useState(getToolFromHash());

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

  const handleSelectTool = (toolId) => {
    setActiveToolId(toolId);
    window.location.hash = `#/${toolId}`;
  };

  const handleGoHome = () => {
    setActiveToolId(null);
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col justify-between bg-[#F4F5F7] dark:bg-[#121214] text-[#161616] dark:text-[#E4E4E7] transition-colors duration-200">
          <div>
            <Navbar
              onSelectTool={handleSelectTool}
              onGoHome={handleGoHome}
            />
            <main>
              {activeToolId ? (
                <ToolWorkspace
                  toolId={activeToolId}
                  onGoHome={handleGoHome}
                />
              ) : (
                <HomePage onSelectTool={handleSelectTool} />
              )}
            </main>
          </div>
          <Footer />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

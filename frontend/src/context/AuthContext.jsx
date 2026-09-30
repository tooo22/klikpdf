import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '882960778924-qnagvcduvc341a89bh7v8af2h3dbhhtg.apps.googleusercontent.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('klikpdf_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [recentFiles, setRecentFiles] = useState(() => {
    try {
      const saved = localStorage.getItem('klikpdf_user_recent_files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRecentModalOpen, setIsRecentModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('klikpdf_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('klikpdf_auth_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('klikpdf_user_recent_files', JSON.stringify(recentFiles));
  }, [recentFiles]);

  const loginWithGoogle = (credentialResponse) => {
    try {
      if (!credentialResponse || !credentialResponse.credential) return false;
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        id: decoded.sub,
        name: decoded.name || decoded.given_name || 'Pengguna KlikPDF',
        email: decoded.email,
        picture: decoded.picture || null,
        isDemo: false
      };
      setUser(userData);
      setIsLoginModalOpen(false);
      return true;
    } catch (err) {
      console.error("Google Auth Decode Error:", err);
      return false;
    }
  };

  const loginDemo = () => {
    const demoUser = {
      id: 'demo_user_123',
      name: 'Pengguna Demo',
      email: 'demo@klikpdf.my.id',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isDemo: true
    };
    setUser(demoUser);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const addRecentFile = (fileItem) => {
    // fileItem: { name, toolName, size, timestamp }
    const newItem = {
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: fileItem.name || 'Dokumen.pdf',
      toolName: fileItem.toolName || 'Alat PDF',
      size: fileItem.size || '-',
      timestamp: new Date().toISOString()
    };
    setRecentFiles((prev) => [newItem, ...prev.filter(f => f.name !== newItem.name).slice(0, 19)]);
  };

  const clearRecentFiles = () => {
    setRecentFiles([]);
  };

  const contextValue = {
    user,
    loginWithGoogle,
    loginDemo,
    logout,
    recentFiles,
    addRecentFile,
    clearRecentFiles,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRecentModalOpen,
    setIsRecentModalOpen,
    googleClientId: GOOGLE_CLIENT_ID
  };

  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthContext.Provider value={contextValue}>
          {children}
        </AuthContext.Provider>
      </GoogleOAuthProvider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

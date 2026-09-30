# Google Authentication & User Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Google OAuth login with user profile and file conversion history in the KlikPDF web application.

**Architecture:** Client-side Google Identity Services (`@react-oauth/google` + `jwt-decode`) wrapped in a React `AuthContext` with support for local session persistence, demo login mode, Navbar user menu, and recent file activity history.

**Tech Stack:** React 18, Vite, `@react-oauth/google`, `jwt-decode`, Lucide React, TailwindCSS.

## Global Constraints
- Support both dark mode and light mode seamlessly.
- Support both Indonesian (`id`) and English (`en`) via `LanguageContext`.
- If `VITE_GOOGLE_CLIENT_ID` is missing or invalid, gracefully provide a Demo Login fallback so the UI remains 100% interactive and testable.

---

### Task 1: Dependencies & Environment Setup

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/.env.example`
- Create: `frontend/.env`

**Interfaces:**
- Produces: `@react-oauth/google` and `jwt-decode` node modules, `VITE_GOOGLE_CLIENT_ID` environment variable.

- [ ] **Step 1: Install `@react-oauth/google` and `jwt-decode`**

Run in `frontend/`:
```bash
npm install @react-oauth/google jwt-decode
```

- [ ] **Step 2: Create `.env.example` and `.env` template**

Create `frontend/.env.example`:
```env
# Google OAuth Client ID from Google Cloud Console (APIs & Services > Credentials)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

Create `frontend/.env`:
```env
# Google OAuth Client ID (Leave blank or fill with your credentials for production)
VITE_GOOGLE_CLIENT_ID=
```

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/.env.example
git commit -m "chore: install @react-oauth/google and jwt-decode"
```

---

### Task 2: Implement `AuthContext.jsx` & Wrap Application in `App.jsx`

**Files:**
- Create: `frontend/src/context/AuthContext.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Produces:
  - `useAuth()` hook returning `{ user, loginWithGoogle, loginDemo, logout, recentFiles, addRecentFile, clearRecentFiles, isLoginModalOpen, setIsLoginModalOpen, isRecentModalOpen, setIsRecentModalOpen, googleClientId }`
- Consumes: `@react-oauth/google`, `jwt-decode`

- [ ] **Step 1: Create `AuthContext.jsx`**

Create `frontend/src/context/AuthContext.jsx`:
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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
      if (!credentialResponse.credential) return false;
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
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
    setRecentFiles((prev) => [
      {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: fileItem.name || 'Dokumen.pdf',
        toolName: fileItem.toolName || 'Alat PDF',
        size: fileItem.size || '-',
        timestamp: new Date().toISOString()
      },
      ...prev.slice(0, 19) // simpan maksimal 20 file terbaru
    ]);
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

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 2: Update `App.jsx` with `AuthProvider`**

Modify `frontend/src/App.jsx` to wrap with `AuthProvider` and include Modals.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/context/AuthContext.jsx frontend/src/App.jsx
git commit -m "feat: add AuthContext and integrate provider into App"
```

---

### Task 3: Create `LoginModal.jsx` and `RecentFilesModal.jsx`

**Files:**
- Create: `frontend/src/components/LoginModal.jsx`
- Create: `frontend/src/components/RecentFilesModal.jsx`

**Interfaces:**
- Consumes: `useAuth()`, `useLanguage()`, `useTheme()`, `@react-oauth/google`
- Produces: Responsive, accessible modals for login and viewing recent converted files.

- [ ] **Step 1: Create `LoginModal.jsx`**
- [ ] **Step 2: Create `RecentFilesModal.jsx`**
- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/LoginModal.jsx frontend/src/components/RecentFilesModal.jsx
git commit -m "feat: create LoginModal and RecentFilesModal components"
```

---

### Task 4: Integrate User Profile in `Navbar.jsx` & History Hook in `ToolWorkspace.jsx`

**Files:**
- Modify: `frontend/src/components/Navbar.jsx`
- Modify: `frontend/src/pages/ToolWorkspace.jsx`

**Interfaces:**
- Consumes: `useAuth()` inside `Navbar.jsx` (render Sign In button or Avatar dropdown) and `ToolWorkspace.jsx` (call `addRecentFile` upon successful PDF action).

- [ ] **Step 1: Update `Navbar.jsx` with Auth buttons & Avatar dropdown**
- [ ] **Step 2: Update `ToolWorkspace.jsx` to record recent processed files**
- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navbar.jsx frontend/src/pages/ToolWorkspace.jsx
git commit -m "feat: integrate Google login profile in Navbar and record file history"
```

---

### Task 5: Build & Verification

**Files:**
- Test all components via `npm run build`

- [ ] **Step 1: Run build verification**

```bash
npm run build
```

- [ ] **Step 2: Commit any final polishing & verify zero lint/build errors**

```bash
git commit -m "chore: verify Google Auth integration and build"
```

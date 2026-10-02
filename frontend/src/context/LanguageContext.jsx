import React, { createContext, useContext, useState, useEffect } from 'react';
import idLocale from '../locales/id.json';
import enLocale from '../locales/en.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('klikpdf_lang');
      return saved === 'en' || saved === 'id' ? saved : 'id';
    } catch {
      return 'id';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('klikpdf_lang', typeof lang === 'string' ? lang : 'id');
    } catch {
      // ignore
    }
  }, [lang]);

  const currentLang = typeof lang === 'string' && (lang === 'en' || lang === 'id') ? lang : 'id';
  const translations = currentLang === 'id' ? idLocale : enLocale;

  const t = (path) => {
    if (!path || typeof path !== 'string') return '';
    const keys = path.split('.');
    let current = translations;
    for (const key of keys) {
      if (current && typeof current === 'object' && current[key] !== undefined) {
        current = current[key];
      } else {
        return path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  const toggleLanguage = (newLang) => {
    setLang((prev) => {
      const current = typeof prev === 'string' ? prev : 'id';
      if (typeof newLang === 'string' && (newLang === 'id' || newLang === 'en')) {
        return newLang;
      }
      return current === 'id' ? 'en' : 'id';
    });
  };

  return (
    <LanguageContext.Provider value={{ lang: currentLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

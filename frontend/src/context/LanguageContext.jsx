import React, { createContext, useContext, useState } from 'react';
import idLocale from '../locales/id.json';
import enLocale from '../locales/en.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('id');
  const translations = lang === 'id' ? idLocale : enLocale;

  const t = (path) => {
    const keys = path.split('.');
    let current = translations;
    for (const key of keys) {
      if (current[key] !== undefined) {
        current = current[key];
      } else {
        return path;
      }
    }
    return current;
  };

  const toggleLanguage = (newLang) => {
    setLang(newLang || (lang === 'id' ? 'en' : 'id'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

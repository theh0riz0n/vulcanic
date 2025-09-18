
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import pl from '@/locales/pl.json';

const translations = { en, pl };

type Language = 'en' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('vulcanic-lang') as Language;
    if (storedLang && ['en', 'pl'].includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vulcanic-lang', lang);
  };

  const t = (key: string) => {
    const langFile = translations[language] as { [key: string]: string };
    return langFile[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

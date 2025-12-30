import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Language, translations, TranslationKey } from "./translations";

const LANGUAGE_LS_KEY = "language";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_LS_KEY);
    return (saved as Language) || "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_LS_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const translation = translations[key];
      let text: string = translation[language] || translation["en"] || key;

      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          text = text.replace(new RegExp(`\\{${param}\\}`, "g"), String(value));
        });
      }

      return text;
    },
    [language]
  );

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}


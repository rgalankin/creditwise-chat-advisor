import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

export const translations: Translations = {
  appName: {
    en: 'Credo-Service Advisor',
    ru: 'Кредо-Сервис Советник',
  },
  tagline: {
    en: 'Your intelligent financial assistant',
    ru: 'Ваш интеллектуальный финансовый помощник',
  },
  startChat: {
    en: 'Start Chat',
    ru: 'Начать чат',
  },
  login: {
    en: 'Login',
    ru: 'Войти',
  },
  logout: {
    en: 'Logout',
    ru: 'Выйти',
  },
  credits: {
    en: 'Credits',
    ru: 'Кредиты',
  },
  voiceInput: {
    en: 'Voice Input',
    ru: 'Голосовой ввод',
  },
  send: {
    en: 'Send',
    ru: 'Отправить',
  },
  analyzing: {
    en: 'Analyzing...',
    ru: 'Анализирую...',
  },
  placeholder: {
    en: 'Type your message...',
    ru: 'Введите сообщение...',
  },
  profile: {
    en: 'Profile',
    ru: 'Профиль',
  },
  documents: {
    en: 'Documents',
    ru: 'Документы',
  },
  admin: {
    en: 'Admin',
    ru: 'Админ',
  },
  upgrade: {
    en: 'Upgrade',
    ru: 'Улучшить',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

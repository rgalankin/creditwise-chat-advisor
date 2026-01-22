import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru';

interface Translations {
  [key: string]: {
    ru: string;
  };
}

export const translations: Translations = {
  appName: {
    ru: 'Кредо-Сервис Советник',
  },
  tagline: {
    ru: 'Ваш интеллектуальный финансовый помощник',
  },
  startChat: {
    ru: 'Начать чат',
  },
  login: {
    ru: 'Войти',
  },
  logout: {
    ru: 'Выйти',
  },
  credits: {
    ru: 'Кредиты',
  },
  voiceInput: {
    ru: 'Голосовой ввод',
  },
  send: {
    ru: 'Отправить',
  },
  analyzing: {
    ru: 'Анализирую...',
  },
  placeholder: {
    ru: 'Введите сообщение...',
  },
  profile: {
    ru: 'Профиль',
  },
  documents: {
    ru: 'Документы',
  },
  admin: {
    ru: 'Админ',
  },
  upgrade: {
    ru: 'Улучшить',
  }
};

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language: Language = 'ru';

  const t = (key: string) => {
    return translations[key]?.ru || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
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

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

const savedLang = localStorage.getItem('language') || 'en';
document.documentElement.lang = savedLang;

// RTL language support & readiness
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
document.documentElement.dir = rtlLanguages.includes(savedLang) ? 'rtl' : 'ltr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
});

export default i18n;
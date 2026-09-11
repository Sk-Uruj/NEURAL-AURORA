import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import it from './locales/it.json';
import tr from './locales/tr.json';
import id from './locales/id.json';
import nl from './locales/nl.json';
import vi from './locales/vi.json';
import pl from './locales/pl.json';
import th from './locales/th.json';
import he from './locales/he.json';
import uk from './locales/uk.json';
import bn from './locales/bn.json';
import ur from './locales/ur.json';
import fa from './locales/fa.json';
import sv from './locales/sv.json';

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
      es: { translation: es },
      hi: { translation: hi },
      zh: { translation: zh },
      ar: { translation: ar },
      fr: { translation: fr },
      de: { translation: de },
      pt: { translation: pt },
      ru: { translation: ru },
      ja: { translation: ja },
      ko: { translation: ko },
      it: { translation: it },
      tr: { translation: tr },
      id: { translation: id },
      nl: { translation: nl },
      vi: { translation: vi },
      pl: { translation: pl },
      th: { translation: th },
      he: { translation: he },
      uk: { translation: uk },
      bn: { translation: bn },
      ur: { translation: ur },
      fa: { translation: fa },
      sv: { translation: sv }
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
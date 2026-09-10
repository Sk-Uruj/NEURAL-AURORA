import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLang = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  return (
    <select 
      onChange={changeLang} 
      value={i18n.language}
      className="bg-transparent text-sm border border-white/20 rounded px-2 py-1 outline-none"
    >
      <option value="en" className="text-black">English</option>
      <option value="es" className="text-black">Español</option>
    </select>
  );
}
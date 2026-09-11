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
      <option value="hi" className="text-black">हिन्दी</option>
      <option value="zh" className="text-black">中文</option>
      <option value="ar" className="text-black">العربية</option>
      <option value="fr" className="text-black">Français</option>
      <option value="de" className="text-black">Deutsch</option>
      <option value="pt" className="text-black">Português</option>
      <option value="ru" className="text-black">Русский</option>
      <option value="ja" className="text-black">日本語</option>
      <option value="ko" className="text-black">한국어</option>
      <option value="it" className="text-black">Italiano</option>
      <option value="tr" className="text-black">Türkçe</option>
      <option value="id" className="text-black">Bahasa Indonesia</option>
      <option value="nl" className="text-black">Nederlands</option>
      <option value="vi" className="text-black">Tiếng Việt</option>
      <option value="pl" className="text-black">Polski</option>
      <option value="th" className="text-black">ไทย</option>
      <option value="he" className="text-black">עברית</option>
      <option value="uk" className="text-black">Українська</option>
      <option value="bn" className="text-black">বাংলা</option>
      <option value="ur" className="text-black">اردو</option>
      <option value="fa" className="text-black">فارسی</option>
      <option value="sv" className="text-black">Svenska</option>
    </select>
  );
}
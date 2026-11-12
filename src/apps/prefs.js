import { useEffect } from 'react';

// نفس منطق اللغة والوضع الليلي/النهاري المستخدم في الصفحة الرئيسية (App.jsx)،
// بنفس مفاتيح التخزين حتى يبقى اختيار الزائر ثابتاً بين الصفحتين.
export function readLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    const v = q === 'en' || q === 'ar' ? q : localStorage.getItem('site_lang');
    return v === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function readTheme() {
  try {
    return localStorage.getItem('site_theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function useApplyPrefs(lang, theme) {
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.lang = lang;
    htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
    htmlEl.className = lang;
    htmlEl.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('font-english', lang === 'en');
    document.body.classList.toggle('font-arabic', lang !== 'en');
    try {
      localStorage.setItem('site_lang', lang);
      localStorage.setItem('site_theme', theme);
    } catch { /* التخزين غير متاح */ }
  }, [lang, theme]);
}

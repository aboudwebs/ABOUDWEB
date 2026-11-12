const SITE_URL = 'https://qamvir-syr.onrender.com';

export const SEO_COPY = {
  ar: {
    title: 'QAMVIR – تطوير المواقع والبرامج',
    description: 'QAMVIR استوديو تطوير مواقع وبرامج وتطبيقات ويب ومتاجر إلكترونية بتصميم احترافي وأداء فائق السرعة. نخدم الشركات في سوريا وحمص وخارجها. ابدأ مشروعك عبر واتساب.',
    locale: 'ar_AR',
    alt: 'en_US'
  },
  en: {
    title: 'QAMVIR – Web & Software Development',
    description: 'QAMVIR is a web & software development studio building fast, custom websites, web apps and e-commerce stores for businesses in Syria, Homs and worldwide. Start your project on WhatsApp.',
    locale: 'en_US',
    alt: 'ar_AR'
  }
};

const setContent = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', value);
};

export function applySeo(lang) {
  const c = SEO_COPY[lang] || SEO_COPY.ar;
  document.title = c.title;
  setContent('meta[name="description"]', c.description);
  setContent('meta[property="og:title"]', c.title);
  setContent('meta[property="og:description"]', c.description);
  setContent('meta[name="twitter:title"]', c.title);
  setContent('meta[name="twitter:description"]', c.description);
  setContent('meta[property="og:locale"]', c.locale);
  setContent('meta[property="og:locale:alternate"]', c.alt);
  if (new URLSearchParams(window.location.search).get('lang') === 'en') {
    const url = SITE_URL + '/?lang=en';
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
    setContent('meta[property="og:url"]', url);
  }
}

const ROBOTS_INDEX = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

/**
 * Per-page SEO for routes that live outside the home page (e.g. /apps and /apps/:slug).
 * Only updates tags that already exist in the page's HTML entry.
 */
export function applyPageSeo({ lang = 'ar', title, description, path = '/', noindex = false }) {
  const url = SITE_URL + path;
  document.title = title;
  setContent('meta[name="description"]', description);
  setContent('meta[property="og:title"]', title);
  setContent('meta[property="og:description"]', description);
  setContent('meta[name="twitter:title"]', title);
  setContent('meta[name="twitter:description"]', description);
  setContent('meta[property="og:url"]', url);
  setContent('meta[property="og:locale"]', lang === 'en' ? 'en_US' : 'ar_AR');
  setContent('meta[property="og:locale:alternate"]', lang === 'en' ? 'ar_AR' : 'en_US');
  setContent('meta[name="robots"]', noindex ? 'noindex,follow' : ROBOTS_INDEX);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', url);
}

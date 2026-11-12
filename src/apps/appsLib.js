// أدوات مشتركة بين الصفحة العامة ولوحة التحكم: الحالات، الروابط، التطبيع.

export const APP_STATUSES = ['available', 'in_development', 'coming_soon'];

export const STATUS_LABELS = {
  available: { ar: 'متاح للتحميل', en: 'Available' },
  in_development: { ar: 'قيد التطوير', en: 'In development' },
  coming_soon: { ar: 'قريباً', en: 'Coming soon' },
};

// ترتيب الأولوية عند عرض أزرار التحميل. newTab=false للـ APK حتى يبدأ التنزيل دون فتح تبويب فارغ.
export const LINK_FIELDS = [
  { key: 'apk', column: 'apk_url', ar: 'تحميل APK', en: 'Download APK', newTab: false },
  { key: 'googlePlay', column: 'google_play_url', ar: 'Google Play', en: 'Google Play', newTab: true },
  { key: 'appStore', column: 'app_store_url', ar: 'App Store', en: 'App Store', newTab: true },
  { key: 'external', column: 'external_url', ar: 'فتح الرابط', en: 'Open link', newTab: true },
];

const STORE_HOSTS = {
  googlePlay: ['play.google.com', 'play.app.goo.gl'],
  appStore: ['apps.apple.com', 'itunes.apple.com', 'testflight.apple.com', 'apple.co'],
};

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** يعيد رابط https سليماً أو نصاً فارغاً. blob: مسموح فقط لمعاينة الصور في لوحة التحكم. */
export function safeUrl(value, { allowBlob = false } = {}) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:' || (allowBlob && u.protocol === 'blob:')) return u.href;
  } catch { /* رابط غير صالح */ }
  return '';
}

/** رسالة خطأ بالعربية، أو نص فارغ إن كان الرابط صالحاً (أو فارغاً). */
export function validateLink(kind, value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  let u;
  try {
    u = new URL(raw);
  } catch {
    return 'الرابط غير صالح. اكتبه كاملاً بدءاً من https://';
  }
  if (u.protocol !== 'https:') return 'يجب أن يبدأ الرابط بـ https://';
  const hosts = STORE_HOSTS[kind];
  if (hosts && !hosts.some((h) => u.hostname === h || u.hostname.endsWith('.' + h))) {
    return kind === 'googlePlay'
      ? 'رابط Google Play يجب أن يكون من play.google.com'
      : 'رابط App Store يجب أن يكون من apps.apple.com';
  }
  return '';
}

export function splitLines(value) {
  return String(value ?? '').split('\n').map((x) => x.trim()).filter(Boolean);
}

const asList = (v) => (Array.isArray(v) ? v.map((x) => String(x ?? '').trim()).filter(Boolean) : []);

/** يحوّل صف قاعدة البيانات (snake_case) إلى كائن موحّد تستخدمه الواجهة ومعاينة لوحة التحكم. */
export function normalizeApp(row, { allowBlob = false } = {}) {
  const img = (u) => safeUrl(u, { allowBlob });
  return {
    id: row.id,
    slug: String(row.slug || ''),
    name: { ar: row.name_ar || '', en: row.name_en || '' },
    shortDesc: { ar: row.short_desc_ar || '', en: row.short_desc_en || '' },
    longDesc: { ar: row.long_desc_ar || '', en: row.long_desc_en || '' },
    features: { ar: asList(row.features_ar), en: asList(row.features_en) },
    iconUrl: img(row.icon_url),
    screenshots: asList(row.screenshots).map(img).filter(Boolean),
    status: APP_STATUSES.includes(row.status) ? row.status : 'coming_soon',
    isPublished: row.is_published === true,
    sortOrder: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
    version: String(row.version || ''),
    links: {
      apk: safeUrl(row.apk_url),
      googlePlay: safeUrl(row.google_play_url),
      appStore: safeUrl(row.app_store_url),
      external: safeUrl(row.external_url),
    },
  };
}

/** نص بلغة الزائر، مع الرجوع للّغة الأخرى إن كان فارغاً. */
export function pick(obj, lang) {
  if (!obj) return '';
  const other = lang === 'ar' ? 'en' : 'ar';
  return obj[lang] || obj[other] || '';
}

/** أزرار التحميل الصالحة فقط، وتظهر حصراً عندما تكون الحالة «متاح للتحميل». */
export function getDownloadLinks(app, lang) {
  if (!app || app.status !== 'available') return [];
  return LINK_FIELDS
    .filter((f) => app.links[f.key])
    .map((f) => ({ key: f.key, url: app.links[f.key], label: f[lang], newTab: f.newTab }));
}

export function externalProps(link) {
  return link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : { rel: 'noopener noreferrer' };
}

// ---------- قنوات التواصل ----------

const handleFromUrl = (href) => {
  try {
    const seg = new URL(href).pathname.split('/').filter(Boolean).pop();
    return seg ? `@${seg.replace(/^@/, '')}` : new URL(href).hostname;
  } catch {
    return '';
  }
};

export function safeChannelUrl(value) {
  const raw = String(value ?? '').trim();
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(raw)) return raw;
  if (/^tel:\+?[0-9\s-]{5,20}$/i.test(raw)) return raw.replace(/\s/g, '');
  return safeUrl(raw);
}

const withBase = (value, base) => {
  const v = String(value ?? '').trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : base + v.replace(/^@/, '');
};

export function buildChannels({ contacts = {}, page = {}, lang = 'ar', message = '' }) {
  const out = [];
  const c = (key) => String(page[`contact_${key}`] || '').trim() || contacts[key];

  if (page.show_whatsapp !== false) {
    const digits = String(c('whatsapp') || '').replace(/\D/g, '');
    if (digits) {
      out.push({
        key: 'whatsapp', label: 'WhatsApp', primary: true,
        hint: lang === 'ar' ? 'ابدأ محادثة' : 'Start a chat',
        href: `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`,
      });
    }
  }
  if (page.show_telegram !== false) {
    const tg = String(c('telegram') || '').replace(/^@/, '').trim();
    if (/^[A-Za-z0-9_]{3,}$/.test(tg)) {
      out.push({ key: 'telegram', label: 'Telegram', hint: `@${tg}`, href: `https://t.me/${tg}` });
    }
  }
  if (page.show_instagram !== false) {
    const ig = safeUrl(withBase(c('instagram'), 'https://instagram.com/'));
    if (ig) out.push({ key: 'instagram', label: 'Instagram', hint: handleFromUrl(ig), href: ig });
  }
  if (page.show_x !== false) {
    const x = safeUrl(withBase(c('x'), 'https://x.com/'));
    if (x) out.push({ key: 'x', label: 'X', hint: handleFromUrl(x), href: x });
  }
  (Array.isArray(page.extra_channels) ? page.extra_channels : []).forEach((ch, i) => {
    const href = safeChannelUrl(ch?.url);
    const label = pick({ ar: ch?.label_ar, en: ch?.label_en }, lang);
    if (!href || !label) return;
    const web = href.startsWith('https:');
    out.push({
      key: `extra-${i}`, label, href, external: web,
      hint: web ? new URL(href).hostname.replace(/^www\./, '') : href.replace(/^(mailto|tel):/i, ''),
    });
  });
  return out;
}

export function whatsappHref(number, message) {
  const digits = String(number || '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

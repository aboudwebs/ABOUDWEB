// المحتوى الافتراضي لصفحة /apps. أي حقل يتركه المسؤول فارغاً في لوحة التحكم يُستعمل نصّه الافتراضي من هنا.

export const DEFAULT_APPS_PAGE = {
  seo_title_ar: 'Aboud Web | Apps',
  seo_title_en: 'Aboud Web | Apps',
  seo_description_ar: 'منصة Aboud Web للتطبيقات: تعرّف على كل تطبيق، شاهد صوره، وحمّله مباشرة من المصدر الرسمي.',
  seo_description_en: 'The Aboud Web apps platform: explore each app, see how it looks, and download it from the official source.',

  hero_title_ar: 'Aboud Web | Apps',
  hero_title_en: 'Aboud Web | Apps',
  hero_subtitle_ar: 'منصة تجمع تطبيقات Aboud Web في مكان واحد. تعرّف على كل تطبيق، شاهد صوره، وحمّله من المصدر الرسمي.',
  hero_subtitle_en: 'One place for every Aboud Web app. Explore each one, see how it looks, and download it from the official source.',
  hero_cta_primary_ar: 'تصفّح التطبيقات',
  hero_cta_primary_en: 'Browse apps',
  hero_cta_secondary_ar: 'تواصل معنا',
  hero_cta_secondary_en: 'Contact us',

  apps_title_ar: 'التطبيقات',
  apps_title_en: 'Apps',
  apps_subtitle_ar: 'لكل تطبيق صفحة تعرض تفاصيله وصوره وروابط التحميل الرسمية.',
  apps_subtitle_en: 'Each app has its own page with details, screenshots and official download links.',
  empty_title_ar: 'لا توجد تطبيقات منشورة حالياً',
  empty_title_en: 'No apps published yet',
  empty_text_ar: 'عُد لاحقاً، أو تواصل معنا إن كان لديك استفسار.',
  empty_text_en: 'Check back later, or contact us if you have a question.',

  contact_title_ar: 'تواصل معنا',
  contact_title_en: 'Get in touch',
  contact_subtitle_ar: 'لأي استفسار عن التطبيقات أو الدعم، راسلنا عبر القناة التي تناسبك.',
  contact_subtitle_en: 'For any question about the apps or support, reach us on the channel that suits you.',
  contact_whatsapp_message_ar: 'مرحباً، أريد الاستفسار عن تطبيقات Aboud Web.',
  contact_whatsapp_message_en: 'Hello, I would like to ask about the Aboud Web apps.',

  footer_back_ar: 'العودة إلى Aboud Web',
  footer_back_en: 'Back to Aboud Web',

  // قنوات التواصل: إظهار/إخفاء كل قناة + قيمة بديلة (فارغة = استخدام قيمة الموقع الأساسية)
  show_whatsapp: true,
  show_telegram: true,
  show_instagram: true,
  show_x: true,
  contact_whatsapp: '',
  contact_telegram: '',
  contact_instagram: '',
  contact_x: '',
  extra_channels: [],
};

// الحقول النصية التي تُدار من لوحة التحكم (كل حقل له نسخة _ar و _en).
export const PAGE_FIELD_GROUPS = [
  {
    id: 'seo',
    title: 'عنوان الصفحة',
    hint: 'يظهر في تبويب المتصفح ونتائج البحث.',
    fields: [
      { key: 'seo_title', label: 'عنوان الصفحة', type: 'text' },
      { key: 'seo_description', label: 'وصف الصفحة', type: 'textarea' },
    ],
  },
  {
    id: 'hero',
    title: 'القسم الرئيسي',
    fields: [
      { key: 'hero_title', label: 'العنوان الرئيسي', type: 'text' },
      { key: 'hero_subtitle', label: 'النص التعريفي', type: 'textarea' },
      { key: 'hero_cta_primary', label: 'نص الزر الأول', type: 'text' },
      { key: 'hero_cta_secondary', label: 'نص الزر الثاني', type: 'text' },
    ],
  },
  {
    id: 'apps',
    title: 'قسم التطبيقات',
    fields: [
      { key: 'apps_title', label: 'عنوان القسم', type: 'text' },
      { key: 'apps_subtitle', label: 'وصف القسم', type: 'textarea' },
      { key: 'empty_title', label: 'عنوان الحالة الفارغة', type: 'text' },
      { key: 'empty_text', label: 'نص الحالة الفارغة', type: 'textarea' },
    ],
  },
  {
    id: 'contact',
    title: 'قسم التواصل',
    fields: [
      { key: 'contact_title', label: 'عنوان القسم', type: 'text' },
      { key: 'contact_subtitle', label: 'وصف القسم', type: 'textarea' },
      { key: 'contact_whatsapp_message', label: 'رسالة واتساب الجاهزة', type: 'textarea' },
    ],
  },
  {
    id: 'footer',
    title: 'تذييل الصفحة',
    fields: [{ key: 'footer_back', label: 'نص رابط العودة للموقع', type: 'text' }],
  },
];

export const CHANNEL_KEYS = [
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '963951708141', hint: 'الرقم بصيغة دولية بدون +' },
  { key: 'telegram', label: 'Telegram', placeholder: 'username', hint: 'اسم المستخدم بدون @' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…', hint: 'الرابط الكامل أو اسم المستخدم' },
  { key: 'x', label: 'X', placeholder: 'https://x.com/…', hint: 'الرابط الكامل أو اسم المستخدم' },
];

export function mergeAppsPage(saved) {
  const base = { ...DEFAULT_APPS_PAGE, extra_channels: [] };
  if (!saved || typeof saved !== 'object') return base;
  for (const key of Object.keys(DEFAULT_APPS_PAGE)) {
    if (key === 'extra_channels') {
      base[key] = Array.isArray(saved[key]) ? saved[key].filter((c) => c && typeof c === 'object') : [];
    } else if (typeof DEFAULT_APPS_PAGE[key] === 'boolean') {
      base[key] = saved[key] !== false;
    } else if (typeof saved[key] === 'string') {
      base[key] = saved[key];
    }
  }
  return base;
}

/** نص الصفحة بلغة الزائر؛ الحقل الفارغ يرجع إلى الافتراضي حتى لا يظهر عنوان فارغ أبداً. */
export function pageText(page, key, lang) {
  const v = page?.[`${key}_${lang}`];
  return typeof v === 'string' && v.trim() ? v.trim() : DEFAULT_APPS_PAGE[`${key}_${lang}`] || '';
}

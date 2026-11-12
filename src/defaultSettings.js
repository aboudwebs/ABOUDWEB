export const DEFAULT_SETTINGS = {
  hero: {
    availability_active: true,
    availability_ar: 'متاح لمشاريع جديدة هذا الشهر',
    availability_en: 'Available for new projects this month',
    title_ar: 'موقع على قياس نشاطك، وتجرّبه قبل أن تدفع.',
    title_en: 'A website built around your business, previewed before you pay.',
    subtitle_ar: 'QAMVIR استوديو تصميم وتطوير مواقع وتطبيقات ويب. نفهم نشاطك أولاً، ثم نجهّز لك نسخة تجريبية من مشروعك قبل أن تلتزم، بسرعة عالية وتجربة استخدام واضحة.',
    subtitle_en: 'QAMVIR is a web design and development studio. We learn your business first, then build a working preview of your project before you commit, fast and easy to use.',
    cta_primary_ar: 'ابدأ مشروعك',
    cta_primary_en: 'Start Your Project',
    cta_secondary_ar: 'استكشف معرض الأعمال',
    cta_secondary_en: 'Explore Portfolio'
  },
  calculator: {
    base_price: 300,
    addons: {
      multilang: 150,
      cms: 250,
      integrations: 200,
      payment: 200
    }
  },
  pricing: {
    package1: {
      name_ar: 'باقة الانطلاق',
      name_en: 'Starter Package',
      price: '300',
      desc_ar: 'مثالية للشركات الناشئة والمشاريع الصغيرة.',
      desc_en: 'Perfect for startups and small businesses.',
      features_ar: [
        'موقع متجاوب بالكامل 1-3 صفحات',
        'تصميم مخصص وسرعة قياسية',
        'تهيئة لمحركات البحث (SEO)',
        'ربط فوري بالواتساب وتليغرام',
        'دعم فني متواصل لمدة شهر'
      ],
      features_en: [
        'Fully responsive 1-3 page website',
        'Custom design & high performance',
        'Basic SEO optimization',
        'WhatsApp & Telegram integration',
        '1 month continuous technical support'
      ]
    },
    package2: {
      name_ar: 'باقة الحلول المخصصة',
      name_en: 'Custom Solutions',
      price_ar: 'تسعير مخصص',
      price_en: 'Custom Quote',
      desc_ar: 'للمشاريع الكبيرة والمنصات المعقدة.',
      desc_en: 'For large projects and complex platforms.',
      features_ar: [
        'متاجر إلكترونية كاملة',
        'أنظمة حجز وإدارة محتوى',
        'ربط بوابات دفع',
        'قواعد بيانات مخصصة',
        'دعم لغات متعددة'
      ],
      features_en: [
        'Full e-commerce solutions',
        'Booking systems & CMS',
        'Payment gateway integrations',
        'Custom database architecture',
        'Multi-language support'
      ]
    }
  },
  contacts: {
    whatsapp: '963951708141',
    whatsapp_message_ar: 'مرحباً QAMVIR، أود الاستفسار عن مشروع بالمواصفات التالية: {specs}. السعر التقديري: ${price}',
    whatsapp_message_en: 'Hello QAMVIR, I would like to inquire about a project with the following specs: {specs}. Estimated cost: ${price}',
    telegram: 'qamviir',
    instagram: 'https://instagram.com/qamvir',
    x: 'https://x.com/qamvir',
    copyright_ar: '© 2026 QAMVIR. جميع الحقوق محفوظة',
    copyright_en: '© 2026 QAMVIR. All rights reserved'
  }
};

const BRAND_CONTACT_KEYS = [
  'telegram', 'instagram', 'x', 'copyright_ar', 'copyright_en', 'whatsapp_message_ar', 'whatsapp_message_en'
];

/**
 * Deep merges target object with source, filling in any missing properties from source defaults.
 */
export function mergeSettings(savedData) {
  if (!savedData || typeof savedData !== 'object') {
    return DEFAULT_SETTINGS;
  }

  return {
    hero: { ...DEFAULT_SETTINGS.hero, ...(savedData.hero || {}) },
    calculator: {
      ...DEFAULT_SETTINGS.calculator,
      ...(savedData.calculator || {}),
      addons: {
        ...DEFAULT_SETTINGS.calculator.addons,
        ...(savedData.calculator?.addons || {})
      }
    },
    pricing: {
      ...DEFAULT_SETTINGS.pricing,
      package1: {
        ...DEFAULT_SETTINGS.pricing.package1,
        ...(savedData.pricing?.package1 || {}),
        features_ar: Array.isArray(savedData.pricing?.package1?.features_ar)
          ? savedData.pricing.package1.features_ar
          : DEFAULT_SETTINGS.pricing.package1.features_ar,
        features_en: Array.isArray(savedData.pricing?.package1?.features_en)
          ? savedData.pricing.package1.features_en
          : DEFAULT_SETTINGS.pricing.package1.features_en
      },
      package2: {
        ...DEFAULT_SETTINGS.pricing.package2,
        ...(savedData.pricing?.package2 || {}),
        features_ar: Array.isArray(savedData.pricing?.package2?.features_ar)
          ? savedData.pricing.package2.features_ar
          : DEFAULT_SETTINGS.pricing.package2.features_ar,
        features_en: Array.isArray(savedData.pricing?.package2?.features_en)
          ? savedData.pricing.package2.features_en
          : DEFAULT_SETTINGS.pricing.package2.features_en
      }
    },
    contacts: {
      ...DEFAULT_SETTINGS.contacts,
      ...(savedData.contacts || {}),
      // Brand-owned fields always come from the code, so an older saved value can never bring back a previous name.
      ...Object.fromEntries(BRAND_CONTACT_KEYS.map((k) => [k, DEFAULT_SETTINGS.contacts[k]]))
    }
  };
}

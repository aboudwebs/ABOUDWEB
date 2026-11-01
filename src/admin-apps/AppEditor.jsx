import { useEffect, useMemo, useRef, useState } from 'react';
import '../apps/apps.css';
import { AppsRouterContext } from '../apps/appsRouter.js';
import { AppCard } from '../apps/AppCard.jsx';
import { APP_STATUSES, LINK_FIELDS, SLUG_RE, STATUS_LABELS, normalizeApp, slugify, splitLines, validateLink } from '../apps/appsLib.js';
import { explainError, insertApp, removeImages, updateApp, uploadImage } from './appsAdminApi';
import { MediaFields } from './MediaFields.jsx';
import { DetailPreviewModal } from './PreviewModal.jsx';

const NOOP_ROUTER = { navigate: () => {} };
const newKey = () => Math.random().toString(36).slice(2, 9);

const toForm = (row) => ({
  slug: row?.slug || '',
  slugTouched: Boolean(row),
  name_ar: row?.name_ar || '',
  name_en: row?.name_en || '',
  short_desc_ar: row?.short_desc_ar || '',
  short_desc_en: row?.short_desc_en || '',
  long_desc_ar: row?.long_desc_ar || '',
  long_desc_en: row?.long_desc_en || '',
  features_ar: (row?.features_ar || []).join('\n'),
  features_en: (row?.features_en || []).join('\n'),
  version: row?.version || '',
  status: row?.status || 'coming_soon',
  is_published: row?.is_published ?? false,
  apk_url: row?.apk_url || '',
  google_play_url: row?.google_play_url || '',
  app_store_url: row?.app_store_url || '',
  external_url: row?.external_url || '',
});

const LINK_HELP = {
  apk_url: { label: 'رابط تحميل مباشر (APK)', placeholder: 'https://example.com/app.apk' },
  google_play_url: { label: 'رابط Google Play', placeholder: 'https://play.google.com/store/apps/details?id=…' },
  app_store_url: { label: 'رابط App Store', placeholder: 'https://apps.apple.com/app/…' },
  external_url: { label: 'رابط خارجي آخر', placeholder: 'https://…' },
};

function Section({ title, hint, children }) {
  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {hint && <p className="mt-1 text-xs leading-6 text-zinc-500">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, error, children, hint }) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[11px] text-zinc-600">{hint}</p>}
      {error && <p className="mt-1.5 text-[11px] text-rose-400" role="alert">{error}</p>}
    </div>
  );
}

export default function AppEditor({ app, apps, contacts, onCancel, onSaved }) {
  const isNew = !app;
  const [form, setForm] = useState(() => toForm(app));
  const [icon, setIcon] = useState(() => (app?.icon_url ? { url: app.icon_url, file: null, preview: app.icon_url } : null));
  const [shots, setShots] = useState(() =>
    (Array.isArray(app?.screenshots) ? app.screenshots : []).map((u) => ({ key: newKey(), url: u, file: null, preview: u }))
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previewLang, setPreviewLang] = useState('ar');
  const [showDetail, setShowDetail] = useState(false);
  const mediaRef = useRef({ icon, shots });
  mediaRef.current = { icon, shots };

  // تحرير روابط المعاينة المحلية عند إغلاق المحرّر
  useEffect(() => () => {
    const { icon: i, shots: s } = mediaRef.current;
    if (i?.file) URL.revokeObjectURL(i.preview);
    s.forEach((x) => { if (x.file) URL.revokeObjectURL(x.preview); });
  }, []);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: '' } : e));
  };

  const onNameEn = (value) => {
    setForm((f) => ({ ...f, name_en: value, slug: f.slugTouched ? f.slug : slugify(value) }));
    setErrors((e) => ({ ...e, name_en: '', slug: '' }));
  };

  const draft = useMemo(
    () => normalizeApp({
      id: 'draft',
      slug: form.slug || 'preview',
      name_ar: form.name_ar, name_en: form.name_en,
      short_desc_ar: form.short_desc_ar, short_desc_en: form.short_desc_en,
      long_desc_ar: form.long_desc_ar, long_desc_en: form.long_desc_en,
      features_ar: splitLines(form.features_ar), features_en: splitLines(form.features_en),
      icon_url: icon?.preview || '',
      screenshots: shots.map((s) => s.preview),
      status: form.status, is_published: form.is_published, version: form.version,
      apk_url: form.apk_url, google_play_url: form.google_play_url,
      app_store_url: form.app_store_url, external_url: form.external_url,
    }, { allowBlob: true }),
    [form, icon, shots]
  );

  const validate = () => {
    const e = {};
    if (!form.name_ar.trim()) e.name_ar = 'اسم التطبيق بالعربية مطلوب.';
    if (!form.short_desc_ar.trim()) e.short_desc_ar = 'الوصف المختصر بالعربية مطلوب.';
    if (!form.slug) e.slug = 'رابط التطبيق مطلوب.';
    else if (!SLUG_RE.test(form.slug)) e.slug = 'أحرف إنجليزية صغيرة وأرقام وشرطات فقط، مثل: waynha';
    else if (apps.some((a) => a.slug === form.slug && a.id !== app?.id)) e.slug = 'هذا الرابط مستخدم لتطبيق آخر.';
    LINK_FIELDS.forEach((f) => {
      const m = validateLink(f.key, form[f.column]);
      if (m) e[f.column] = m;
    });
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setMessage('راجع الحقول المظللة بالأحمر ثم أعد المحاولة.');
      requestAnimationFrame(() => document.querySelector('[role="alert"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      return;
    }

    setSaving(true);
    setMessage('جاري الحفظ...');
    const appId = app?.id || crypto.randomUUID();
    const uploaded = [];
    try {
      let iconUrl = icon?.url || '';
      if (icon?.file) {
        iconUrl = await uploadImage(appId, icon.file, 'icon');
        uploaded.push(iconUrl);
      }
      const shotUrls = [];
      for (const shot of shots) {
        if (shot.file) {
          const url = await uploadImage(appId, shot.file, 'shot');
          uploaded.push(url);
          shotUrls.push(url);
        } else {
          shotUrls.push(shot.url);
        }
      }

      const payload = {
        slug: form.slug.trim(),
        name_ar: form.name_ar.trim(), name_en: form.name_en.trim(),
        short_desc_ar: form.short_desc_ar.trim(), short_desc_en: form.short_desc_en.trim(),
        long_desc_ar: form.long_desc_ar.trim(), long_desc_en: form.long_desc_en.trim(),
        features_ar: splitLines(form.features_ar), features_en: splitLines(form.features_en),
        icon_url: iconUrl || null,
        screenshots: shotUrls,
        status: form.status,
        is_published: form.is_published,
        version: form.version.trim() || null,
        apk_url: form.apk_url.trim() || null,
        google_play_url: form.google_play_url.trim() || null,
        app_store_url: form.app_store_url.trim() || null,
        external_url: form.external_url.trim() || null,
      };

      if (isNew) {
        payload.id = appId;
        payload.sort_order = apps.length ? Math.max(...apps.map((a) => a.sort_order || 0)) + 1 : 0;
        await insertApp(payload);
      } else {
        await updateApp(app.id, payload);
      }

      // تنظيف الصور القديمة التي استُبدلت أو حُذفت (لا يؤثر فشله على الحفظ)
      if (!isNew) {
        const keep = new Set([iconUrl, ...shotUrls]);
        const old = [app.icon_url, ...(Array.isArray(app.screenshots) ? app.screenshots : [])];
        removeImages(old.filter((u) => u && !keep.has(u))).catch(() => {});
      }
      onSaved(isNew ? 'تمت إضافة التطبيق بنجاح.' : 'تم حفظ التعديلات بنجاح.');
    } catch (err) {
      await removeImages(uploaded).catch(() => {});
      setMessage('تعذّر الحفظ: ' + explainError(err));
      setSaving(false);
    }
  };

  const statusNote = form.status !== 'available'
    ? 'أزرار التحميل لا تظهر للزوار إلا عندما تكون الحالة «متاح للتحميل».'
    : (!draft.links.apk && !draft.links.googlePlay && !draft.links.appStore && !draft.links.external)
      ? 'الحالة «متاح» لكن لا يوجد رابط تحميل صالح، لذلك لن يظهر زر التحميل.'
      : '';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] tracking-[.2em] text-zinc-500">{isNew ? 'NEW APP' : 'EDIT APP'}</div>
          <h2 className="text-2xl font-semibold text-white">{isNew ? 'إضافة تطبيق' : `تعديل: ${app.name_ar || app.name_en}`}</h2>
        </div>
        <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-zinc-800 px-4 text-xs text-zinc-400 hover:text-white">رجوع للقائمة</button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
        <div className="space-y-5">
          <Section title="المعلومات الأساسية">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="اسم التطبيق — عربي" error={errors.name_ar}>
                <input value={form.name_ar} maxLength={80} onChange={(e) => set('name_ar', e.target.value)} className="admin-input" placeholder="مثال: وينها" data-testid="f-name-ar" />
              </Field>
              <Field label="اسم التطبيق — English" error={errors.name_en}>
                <input value={form.name_en} maxLength={80} dir="ltr" onChange={(e) => onNameEn(e.target.value)} className="admin-input text-left" placeholder="e.g. Waynha" data-testid="f-name-en" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="رابط الصفحة (slug)" error={errors.slug} hint={`سيكون الرابط: /apps/${form.slug || '…'}`}>
                <input value={form.slug} maxLength={60} dir="ltr" onChange={(e) => { setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().trim(), slugTouched: true })); setErrors((x) => ({ ...x, slug: '' })); }} className="admin-input text-left" placeholder="waynha" data-testid="f-slug" />
              </Field>
              <Field label="رقم الإصدار (اختياري)">
                <input value={form.version} maxLength={40} dir="ltr" onChange={(e) => set('version', e.target.value)} className="admin-input text-left" placeholder="1.0.0" />
              </Field>
            </div>
            {!isNew && <p className="text-[11px] leading-6 text-amber-400/80">تغيير الرابط (slug) يكسر أي روابط قديمة مشاركة لهذا التطبيق.</p>}
          </Section>

          <Section title="الوصف والمزايا" hint="الوصف المختصر يظهر في بطاقة التطبيق، والتفصيلي في صفحته. إن تُرك الإنجليزي فارغاً فسيظهر النص العربي للزوار.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="وصف مختصر — عربي" error={errors.short_desc_ar}>
                <textarea rows={3} maxLength={280} value={form.short_desc_ar} onChange={(e) => set('short_desc_ar', e.target.value)} className="admin-input resize-none" data-testid="f-short-ar" />
              </Field>
              <Field label="وصف مختصر — English">
                <textarea rows={3} maxLength={280} dir="ltr" value={form.short_desc_en} onChange={(e) => set('short_desc_en', e.target.value)} className="admin-input resize-none text-left" />
              </Field>
              <Field label="وصف تفصيلي — عربي">
                <textarea rows={6} maxLength={5000} value={form.long_desc_ar} onChange={(e) => set('long_desc_ar', e.target.value)} className="admin-input resize-y" />
              </Field>
              <Field label="وصف تفصيلي — English">
                <textarea rows={6} maxLength={5000} dir="ltr" value={form.long_desc_en} onChange={(e) => set('long_desc_en', e.target.value)} className="admin-input resize-y text-left" />
              </Field>
              <Field label="المزايا — عربي (ميزة في كل سطر)">
                <textarea rows={4} value={form.features_ar} onChange={(e) => set('features_ar', e.target.value)} className="admin-input resize-y" />
              </Field>
              <Field label="Features — English (one per line)">
                <textarea rows={4} dir="ltr" value={form.features_en} onChange={(e) => set('features_en', e.target.value)} className="admin-input resize-y text-left" />
              </Field>
            </div>
          </Section>

          <Section title="الأيقونة والصور">
            <MediaFields icon={icon} shots={shots} setIcon={setIcon} setShots={setShots} notify={(m) => setMessage(m)} />
          </Section>

          <Section title="روابط التحميل" hint="كلها اختيارية. الرابط الفارغ لا يظهر للزوار، ويجب أن يبدأ كل رابط بـ https://">
            {LINK_FIELDS.map((f) => (
              <Field key={f.column} label={LINK_HELP[f.column].label} error={errors[f.column]}>
                <input type="url" dir="ltr" value={form[f.column]} onChange={(e) => set(f.column, e.target.value)} className="admin-input text-left" placeholder={LINK_HELP[f.column].placeholder} data-testid={`f-${f.column}`} />
              </Field>
            ))}
          </Section>

          <Section title="الحالة والنشر">
            <div role="radiogroup" aria-label="حالة التطبيق" className="grid gap-3 sm:grid-cols-3">
              {APP_STATUSES.map((s) => (
                <label key={s} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${form.status === s ? 'border-indigo-400/60 bg-indigo-500/10 text-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => set('status', s)} className="accent-indigo-400" />
                  {STATUS_LABELS[s].ar}
                </label>
              ))}
            </div>
            {statusNote && <p className="text-[11px] leading-6 text-zinc-500">{statusNote}</p>}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 p-4">
              <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-400" data-testid="f-published" />
              <span>
                <span className="block text-sm font-medium text-white">{form.is_published ? 'منشور وظاهر للزوار' : 'مخفي عن الزوار'}</span>
                <span className="mt-1 block text-[11px] leading-6 text-zinc-500">التطبيقات الجديدة تبدأ مخفية. فعّل النشر عندما تنتهي من المراجعة والمعاينة.</span>
              </span>
            </label>
          </Section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">معاينة حيّة</h3>
              <div className="flex rounded-lg border border-zinc-800 p-0.5 text-[11px]">
                {['ar', 'en'].map((l) => (
                  <button key={l} type="button" onClick={() => setPreviewLang(l)} className={`rounded-md px-2.5 py-1 ${previewLang === l ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400'}`}>
                    {l === 'ar' ? 'عربي' : 'EN'}
                  </button>
                ))}
              </div>
            </div>
            <div dir={previewLang === 'ar' ? 'rtl' : 'ltr'} className="font-arabic" data-testid="card-preview">
              <AppsRouterContext.Provider value={NOOP_ROUTER}>
                <AppCard app={draft} lang={previewLang} />
              </AppsRouterContext.Provider>
            </div>
            <button type="button" onClick={() => setShowDetail(true)} className="mt-4 h-10 w-full rounded-xl border border-zinc-700 text-xs text-zinc-200 hover:bg-zinc-800" data-testid="open-detail-preview">
              معاينة صفحة التفاصيل
            </button>
            <p className="mt-3 text-[11px] leading-6 text-zinc-500">المعاينة تعرض ما كتبته الآن حتى قبل الحفظ، ولا تغيّر شيئاً في الموقع.</p>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 mt-6 -mx-4 border-t border-zinc-800/80 bg-[#09090b]/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <button type="button" onClick={handleSave} disabled={saving} className="h-11 rounded-xl bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50" data-testid="save-app">
            {saving ? 'جاري الحفظ...' : form.is_published ? (isNew ? 'إضافة ونشر' : 'حفظ ونشر التعديلات') : (isNew ? 'إضافة (مخفي)' : 'حفظ التعديلات')}
          </button>
          <button type="button" onClick={onCancel} disabled={saving} className="h-11 rounded-xl border border-zinc-800 px-5 text-sm text-zinc-400 hover:text-white">إلغاء</button>
          {message && <span className="text-xs text-zinc-300" role="status" data-testid="editor-message">{message}</span>}
        </div>
      </div>

      {showDetail && <DetailPreviewModal app={draft} lang={previewLang} contacts={contacts} onClose={() => setShowDetail(false)} />}
    </div>
  );
}

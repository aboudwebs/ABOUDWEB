import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import { fetchAppsPage, fetchSiteSettings } from '../apps/appsApi.js';
import { CHANNEL_KEYS, DEFAULT_APPS_PAGE, PAGE_FIELD_GROUPS } from '../apps/appsDefaults.js';
import { safeChannelUrl, safeUrl } from '../apps/appsLib.js';
import { explainError, savePageData } from './appsAdminApi';
import { AccessNotice } from './AccessNotice.jsx';

const FLAG_KEYS = ['show_whatsapp', 'show_telegram', 'show_instagram', 'show_x'];

const textKeys = PAGE_FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

function checkOverride(key, value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (key === 'whatsapp') return v.replace(/\D/g, '').length >= 7 ? '' : 'اكتب رقماً دولياً صحيحاً (أرقام فقط).';
  if (key === 'telegram') return /^@?[A-Za-z0-9_]{3,}$/.test(v) ? '' : 'اسم مستخدم تيليغرام غير صالح.';
  const asUrl = /^https?:\/\//i.test(v) ? v : `https://x.invalid/${v.replace(/^@/, '')}`;
  return safeUrl(asUrl) ? '' : 'اكتب رابطاً كاملاً يبدأ بـ https:// أو اسم المستخدم فقط.';
}

export default function AppsPageEditor({ access }) {
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState({});
  const [flags, setFlags] = useState(() => Object.fromEntries(FLAG_KEYS.map((k) => [k, true])));
  const [overrides, setOverrides] = useState({ whatsapp: '', telegram: '', instagram: '', x: '' });
  const [extras, setExtras] = useState([]);
  const [site, setSite] = useState(DEFAULT_SETTINGS.contacts);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (access.status !== 'ok') return undefined;
    let alive = true;
    (async () => {
      const [pageRes, siteRes] = await Promise.allSettled([fetchAppsPage(), fetchSiteSettings()]);
      if (!alive) return;
      const saved = pageRes.status === 'fulfilled' ? pageRes.value : null;
      if (pageRes.status === 'rejected') setMessage('تعذّر تحميل المحتوى الحالي: ' + explainError(pageRes.reason));
      if (siteRes.status === 'fulfilled' && siteRes.value?.contacts) setSite(siteRes.value.contacts);
      const v = {};
      textKeys.forEach((k) => ['ar', 'en'].forEach((l) => { v[`${k}_${l}`] = typeof saved?.[`${k}_${l}`] === 'string' ? saved[`${k}_${l}`] : ''; }));
      setValues(v);
      setFlags(Object.fromEntries(FLAG_KEYS.map((k) => [k, saved?.[k] !== false])));
      setOverrides(Object.fromEntries(CHANNEL_KEYS.map((c) => [c.key, typeof saved?.[`contact_${c.key}`] === 'string' ? saved[`contact_${c.key}`] : ''])));
      setExtras(Array.isArray(saved?.extra_channels) ? saved.extra_channels.map((c) => ({ label_ar: c.label_ar || '', label_en: c.label_en || '', url: c.url || '' })) : []);
      setReady(true);
    })();
    return () => { alive = false; };
  }, [access.status]);

  if (access.status !== 'ok') return <AccessNotice access={access} />;
  if (!ready) return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-14 text-center text-sm text-zinc-500">جاري تحميل المحتوى...</div>;

  const setValue = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const handleSave = async () => {
    const e = {};
    CHANNEL_KEYS.forEach((c) => { const m = checkOverride(c.key, overrides[c.key]); if (m) e[`ov_${c.key}`] = m; });
    extras.forEach((c, i) => {
      if (!c.label_ar.trim() && !c.label_en.trim()) e[`ex_${i}`] = 'اكتب اسم القناة.';
      else if (!safeChannelUrl(c.url)) e[`ex_${i}`] = 'الرابط يجب أن يبدأ بـ https:// أو mailto: أو tel:';
    });
    setErrors(e);
    if (Object.keys(e).length) {
      setMessage('راجع الحقول المظللة بالأحمر ثم أعد المحاولة.');
      return;
    }

    // نخزّن فقط ما غيّره المسؤول؛ أي حقل فارغ أو مطابق للافتراضي يبقى يتبع النص الافتراضي.
    const data = {};
    textKeys.forEach((k) => ['ar', 'en'].forEach((l) => {
      const key = `${k}_${l}`;
      const v = (values[key] || '').trim();
      if (v && v !== DEFAULT_APPS_PAGE[key]) data[key] = v;
    }));
    FLAG_KEYS.forEach((k) => { data[k] = flags[k]; });
    CHANNEL_KEYS.forEach((c) => { const v = (overrides[c.key] || '').trim(); if (v) data[`contact_${c.key}`] = v; });
    data.extra_channels = extras.map((c) => ({ label_ar: c.label_ar.trim(), label_en: c.label_en.trim(), url: c.url.trim() }));

    setSaving(true);
    setMessage('جاري الحفظ...');
    try {
      await savePageData(data);
      setMessage('تم حفظ محتوى الصفحة بنجاح. التغييرات ظاهرة الآن في /apps');
    } catch (err) {
      setMessage('تعذّر الحفظ: ' + explainError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 text-[10px] tracking-[.2em] text-zinc-500">ABOUD WEB | APPS</div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">محتوى صفحة التطبيقات</h1>
          <p className="mt-2 text-sm text-zinc-500">كل نص هنا يظهر في صفحة /apps. اترك الحقل فارغاً لاستخدام النص الافتراضي (يظهر باهتاً داخل الحقل).</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setValues({})} className="h-11 rounded-xl border border-zinc-800 px-4 text-xs text-zinc-400 hover:text-white">إفراغ النصوص (الافتراضي)</button>
          <a href="/apps" target="_blank" rel="noopener noreferrer" className="grid h-11 place-items-center rounded-xl border border-zinc-800 px-4 text-xs text-zinc-300 hover:text-white">فتح الصفحة ↗</a>
        </div>
      </div>

      <div className="space-y-5">
        {PAGE_FIELD_GROUPS.map((group) => (
          <section key={group.id} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 p-5 sm:p-6">
            <h3 className="text-base font-semibold text-white">{group.title}</h3>
            {group.hint && <p className="mt-1 text-xs text-zinc-500">{group.hint}</p>}
            <div className="mt-5 space-y-5">
              {group.fields.map((f) => (
                <div key={f.key} className="grid gap-4 sm:grid-cols-2">
                  {['ar', 'en'].map((l) => {
                    const key = `${f.key}_${l}`;
                    const common = {
                      value: values[key] || '',
                      onChange: (ev) => setValue(key, ev.target.value),
                      placeholder: DEFAULT_APPS_PAGE[key],
                      className: `admin-input ${l === 'en' ? 'text-left' : ''}`,
                      dir: l === 'en' ? 'ltr' : 'rtl',
                      'data-testid': `pf-${key}`,
                    };
                    return (
                      <div key={key}>
                        <label className="admin-label">{f.label} — {l === 'ar' ? 'عربي' : 'English'}</label>
                        {f.type === 'textarea' ? <textarea rows={3} {...common} className={`${common.className} resize-y`} /> : <input {...common} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 p-5 sm:p-6">
          <h3 className="text-base font-semibold text-white">قنوات التواصل</h3>
          <p className="mt-1 text-xs leading-6 text-zinc-500">القيم الافتراضية مأخوذة من بيانات الموقع الأساسية. اكتب قيمة في الحقل لتغييرها في هذه الصفحة فقط، أو أوقف الزر لإخفاء القناة.</p>
          <div className="mt-5 space-y-3">
            {CHANNEL_KEYS.map((c) => (
              <div key={c.key} className="grid items-start gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
                <label className="flex h-11 cursor-pointer items-center gap-3 text-sm text-zinc-200">
                  <input type="checkbox" checked={flags[`show_${c.key}`]} onChange={(e) => setFlags((f) => ({ ...f, [`show_${c.key}`]: e.target.checked }))} className="h-4 w-4 accent-emerald-400" data-testid={`show-${c.key}`} />
                  {c.label}
                </label>
                <div>
                  <input dir="ltr" value={overrides[c.key]} onChange={(e) => { setOverrides((o) => ({ ...o, [c.key]: e.target.value })); setErrors((x) => ({ ...x, [`ov_${c.key}`]: '' })); }} placeholder={String(site?.[c.key] || c.placeholder)} className="admin-input text-left" data-testid={`ov-${c.key}`} />
                  <p className="mt-1.5 text-[11px] text-zinc-600">{c.hint}</p>
                  {errors[`ov_${c.key}`] && <p className="mt-1 text-[11px] text-rose-400" role="alert">{errors[`ov_${c.key}`]}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-zinc-800/80 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">قنوات إضافية</h4>
              <button type="button" onClick={() => setExtras((x) => [...x, { label_ar: '', label_en: '', url: '' }])} className="h-9 rounded-xl bg-zinc-800 px-3 text-xs text-zinc-100 hover:bg-zinc-700" data-testid="add-channel">+ إضافة قناة</button>
            </div>
            {extras.length === 0 && <p className="text-xs text-zinc-600">لا توجد قنوات إضافية. أضف بريداً إلكترونياً أو يوتيوب أو أي رابط رسمي آخر.</p>}
            <div className="space-y-3">
              {extras.map((c, i) => (
                <div key={i} className="rounded-xl border border-zinc-800 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
                    <input value={c.label_ar} onChange={(e) => setExtras((x) => x.map((r, j) => (j === i ? { ...r, label_ar: e.target.value } : r)))} placeholder="الاسم بالعربية" className="admin-input" data-testid={`ex-ar-${i}`} />
                    <input dir="ltr" value={c.label_en} onChange={(e) => setExtras((x) => x.map((r, j) => (j === i ? { ...r, label_en: e.target.value } : r)))} placeholder="Name (English)" className="admin-input text-left" />
                    <input dir="ltr" value={c.url} onChange={(e) => setExtras((x) => x.map((r, j) => (j === i ? { ...r, url: e.target.value } : r)))} placeholder="https://… أو mailto:name@site.com" className="admin-input text-left" data-testid={`ex-url-${i}`} />
                    <button type="button" onClick={() => setExtras((x) => x.filter((_, j) => j !== i))} className="h-11 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs text-rose-400">حذف</button>
                  </div>
                  {errors[`ex_${i}`] && <p className="mt-2 text-[11px] text-rose-400" role="alert">{errors[`ex_${i}`]}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 z-20 mt-6 -mx-4 border-t border-zinc-800/80 bg-[#09090b]/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <button type="button" onClick={handleSave} disabled={saving} className="h-11 rounded-xl bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50" data-testid="save-page">
            {saving ? 'جاري الحفظ...' : 'حفظ ونشر المحتوى'}
          </button>
          {message && <span className="text-xs text-zinc-300" role="status" data-testid="page-message">{message}</span>}
        </div>
      </div>
    </div>
  );
}

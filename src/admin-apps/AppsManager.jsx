import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import { STATUS_LABELS } from '../apps/appsLib.js';
import { fetchSiteSettings } from '../apps/appsApi.js';
import { explainError, listApps, removeApp, removeImages, reorderApps, updateApp } from './appsAdminApi';
import { AccessNotice } from './AccessNotice.jsx';
import AppEditor from './AppEditor.jsx';

const STATUS_TONE = {
  available: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  in_development: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  coming_soon: 'border-indigo-400/25 bg-indigo-500/10 text-indigo-300',
};

export default function AppsManager({ access }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined = القائمة، null = تطبيق جديد، كائن = تعديل
  const [contacts, setContacts] = useState(DEFAULT_SETTINGS.contacts);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setApps(await listApps());
    } catch (err) {
      setLoadError(explainError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (access.status !== 'ok') return;
    load();
    fetchSiteSettings().then((s) => { if (s?.contacts) setContacts(s.contacts); }).catch(() => {});
  }, [access.status, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => [a.name_ar, a.name_en, a.slug].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [apps, search]);

  if (access.status !== 'ok') return <AccessNotice access={access} />;

  if (editing !== undefined) {
    return (
      <AppEditor
        key={editing?.id || 'new'}
        app={editing}
        apps={apps}
        contacts={contacts}
        onCancel={() => setEditing(undefined)}
        onSaved={async (msg) => {
          setEditing(undefined);
          setMessage(msg);
          await load();
        }}
      />
    );
  }

  const togglePublished = async (app) => {
    setBusyId(app.id);
    try {
      await updateApp(app.id, { is_published: !app.is_published });
      setApps((list) => list.map((a) => (a.id === app.id ? { ...a, is_published: !app.is_published } : a)));
      setMessage(app.is_published ? `تم إخفاء «${app.name_ar}» عن الزوار.` : `تم نشر «${app.name_ar}» وأصبح ظاهراً للزوار.`);
    } catch (err) {
      setMessage('تعذّر تغيير حالة النشر: ' + explainError(err));
    } finally {
      setBusyId('');
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= apps.length) return;
    const next = [...apps];
    [next[index], next[target]] = [next[target], next[index]];
    const renumbered = next.map((a, i) => ({ ...a, sort_order: i }));
    setApps(renumbered);
    try {
      await reorderApps(renumbered.map((a) => a.id));
      setMessage('تم حفظ الترتيب الجديد.');
    } catch (err) {
      setMessage('تعذّر حفظ الترتيب: ' + explainError(err));
      load();
    }
  };

  const handleDelete = async (app) => {
    const ok = window.confirm(`هل تريد حذف التطبيق «${app.name_ar || app.name_en}» نهائياً؟\nسيتم حذف أيقونته وصوره أيضاً ولا يمكن التراجع.`);
    if (!ok) return;
    setBusyId(app.id);
    try {
      await removeApp(app.id);
      removeImages([app.icon_url, ...(Array.isArray(app.screenshots) ? app.screenshots : [])]).catch(() => {});
      setApps((list) => list.filter((a) => a.id !== app.id));
      setMessage(`تم حذف «${app.name_ar || app.name_en}».`);
    } catch (err) {
      setMessage('تعذّر الحذف: ' + explainError(err));
    } finally {
      setBusyId('');
    }
  };

  const publishedCount = apps.filter((a) => a.is_published).length;
  const canReorder = !search.trim();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 text-[10px] tracking-[.2em] text-zinc-500">ABOUD WEB | APPS</div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">إدارة التطبيقات</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {apps.length} تطبيق • {publishedCount} منشور • {apps.length - publishedCount} مخفي
          </p>
        </div>
        <button type="button" onClick={() => setEditing(null)} className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200" data-testid="add-app">
          + إضافة تطبيق
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200" role="status" data-testid="manager-message">
          {message}
        </div>
      )}

      {apps.length > 3 && (
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input mb-5" placeholder="ابحث بالاسم أو الرابط..." />
      )}

      {loading && <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-14 text-center text-sm text-zinc-500">جاري تحميل التطبيقات...</div>}

      {!loading && loadError && (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-sm text-rose-200">
          {loadError}
          <button type="button" onClick={load} className="mt-4 block h-9 rounded-lg border border-rose-400/30 px-4 text-xs">إعادة المحاولة</button>
        </div>
      )}

      {!loading && !loadError && apps.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center text-sm text-zinc-500">
          لا توجد تطبيقات بعد. اضغط «إضافة تطبيق» لإضافة أول تطبيق.
        </div>
      )}

      {!loading && !loadError && filtered.length > 0 && (
        <ul className="space-y-3" data-testid="apps-list">
          {filtered.map((app) => {
            const index = apps.findIndex((a) => a.id === app.id);
            const busy = busyId === app.id;
            return (
              <li key={app.id} className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/55 p-4 transition-opacity sm:p-5 ${busy ? 'opacity-60' : ''}`} data-testid="app-row" data-slug={app.slug}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 grid place-items-center text-xl font-bold text-zinc-600">
                    {app.icon_url ? <img src={app.icon_url} alt="" className="h-full w-full object-cover" /> : ([...(app.name_ar || app.name_en || '•')][0])}
                  </div>
                  <div className="min-w-0 flex-1 basis-48">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-white">{app.name_ar || app.name_en}</h3>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${STATUS_TONE[app.status] || STATUS_TONE.coming_soon}`}>{(STATUS_LABELS[app.status] || STATUS_LABELS.coming_soon).ar}</span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${app.is_published ? 'border-emerald-500/25 text-emerald-300' : 'border-zinc-700 text-zinc-500'}`}>{app.is_published ? 'منشور' : 'مخفي'}</span>
                    </div>
                    <div className="mt-1 truncate text-xs text-zinc-500" dir="ltr">{app.name_en ? `${app.name_en} · ` : ''}/apps/{app.slug}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-xl border border-zinc-800">
                      <button type="button" onClick={() => move(index, -1)} disabled={!canReorder || index === 0} aria-label="تقديم في الترتيب" title={canReorder ? 'تقديم' : 'امسح البحث لتغيير الترتيب'} className="h-10 w-10 text-sm text-zinc-300 disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => move(index, 1)} disabled={!canReorder || index === apps.length - 1} aria-label="تأخير في الترتيب" title={canReorder ? 'تأخير' : 'امسح البحث لتغيير الترتيب'} className="h-10 w-10 border-s border-zinc-800 text-sm text-zinc-300 disabled:opacity-30">↓</button>
                    </div>
                    <button type="button" onClick={() => togglePublished(app)} disabled={busy} className={`h-10 rounded-xl border px-4 text-xs ${app.is_published ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`} data-testid="toggle-publish">
                      {app.is_published ? 'إخفاء' : 'نشر'}
                    </button>
                    {app.is_published && (
                      <a href={`/apps/${app.slug}`} target="_blank" rel="noopener noreferrer" className="grid h-10 place-items-center rounded-xl border border-zinc-800 px-4 text-xs text-zinc-400 hover:text-white">عرض ↗</a>
                    )}
                    <button type="button" onClick={() => setEditing(app)} className="h-10 rounded-xl bg-zinc-800 px-4 text-xs text-zinc-100 hover:bg-zinc-700" data-testid="edit-app">تعديل</button>
                    <button type="button" onClick={() => handleDelete(app)} disabled={busy} className="h-10 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-xs text-rose-400 hover:bg-rose-500/20" data-testid="delete-app">حذف</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

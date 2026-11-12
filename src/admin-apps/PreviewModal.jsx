import { useEffect } from 'react';
import '../apps/apps.css';
import { AppsRouterContext } from '../apps/appsRouter.js';
import { AppDetail } from '../apps/AppDetail.jsx';

const NOOP_ROUTER = { navigate: () => {} };

// معاينة صفحة التفاصيل كما سيراها الزائر، بدون حفظ أي شيء.
export function DetailPreviewModal({ app, lang, contacts, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label="معاينة صفحة التفاصيل" onClick={onClose}>
      <div
        className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#09090b] font-arabic text-zinc-50"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-800 bg-[#09090b]/90 px-4 py-3 text-xs backdrop-blur">
          <span className="text-zinc-400">معاينة صفحة التفاصيل — لا يتم حفظ أي شيء</span>
          <button type="button" onClick={onClose} className="h-8 rounded-lg border border-zinc-700 px-3 text-zinc-200 hover:bg-zinc-800">إغلاق</button>
        </div>
        <div className="app-preview-frame">
          <AppsRouterContext.Provider value={NOOP_ROUTER}>
            <AppDetail app={app} lang={lang} contacts={contacts} />
          </AppsRouterContext.Provider>
        </div>
      </div>
    </div>
  );
}

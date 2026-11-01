import './apps.css';
import { AppsLink } from './AppsLink.jsx';
import { BackArrowIcon } from './AppIcons.jsx';

export function CardsSkeleton() {
  return (
    <div className="apps-grid" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="app-card animate-pulse">
          <div className="flex items-start gap-4">
            <span className="app-icon app-icon--md bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-11 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="app-detail" aria-hidden="true">
      <div className="apps-shell-narrow animate-pulse">
        <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800 mb-10" />
        <div className="flex items-start gap-6">
          <span className="app-icon app-icon--lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-5 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, text, children }) {
  return (
    <div className="app-panel" role="status">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      {text && <p className="mt-2 text-sm leading-7 text-zinc-500 dark:text-zinc-400">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function AppsEmpty({ title, text }) {
  return <Panel title={title} text={text} />;
}

export function AppsLoadError({ lang, onRetry }) {
  const t = (ar, en) => (lang === 'ar' ? ar : en);
  return (
    <Panel
      title={t('تعذّر تحميل التطبيقات', 'Could not load the apps')}
      text={t('تحقق من اتصالك بالإنترنت ثم أعد المحاولة.', 'Check your connection and try again.')}
    >
      <button type="button" className="app-btn app-btn-primary" onClick={onRetry}>
        {t('إعادة المحاولة', 'Try again')}
      </button>
    </Panel>
  );
}

export function AppsNotFound({ lang }) {
  const t = (ar, en) => (lang === 'ar' ? ar : en);
  return (
    <div className="app-detail">
      <div className="apps-shell-narrow">
        <Panel
          title={t('هذا التطبيق غير موجود', 'App not found')}
          text={t('قد يكون الرابط غير صحيح أو أن التطبيق غير منشور حالياً.', 'The link may be wrong, or the app is not published right now.')}
        >
          <AppsLink href="/apps" className="app-btn app-btn-primary">
            <BackArrowIcon className="rtl:rotate-180" />
            {t('كل التطبيقات', 'All apps')}
          </AppsLink>
        </Panel>
      </div>
    </div>
  );
}

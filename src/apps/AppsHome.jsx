import './apps.css';
import { AppCard } from './AppCard.jsx';
import { AppsContact } from './AppsContact.jsx';
import { AppsEmpty, AppsLoadError, CardsSkeleton } from './AppsStates.jsx';
import { pageText } from './appsDefaults.js';

export function AppsHome({ lang, page, status, apps, contacts, onRetry }) {
  const t = (key) => pageText(page, key, lang);
  const loading = status === 'loading';

  return (
    <>
      <section className="apps-hero" aria-labelledby="apps-hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="apps-hero-bg absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/10 via-zinc-50 dark:via-zinc-950 to-zinc-50 dark:to-zinc-950" aria-hidden="true" />

        {loading ? (
          <div className="w-full max-w-3xl space-y-6 animate-pulse" aria-hidden="true">
            <div className="h-14 sm:h-20 w-3/4 mx-auto rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-2/3 mx-auto rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-1/2 mx-auto rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ) : (
          <>
            <h1 id="apps-hero-title" className="apps-hero-title hero-reveal" dir="auto">{t('hero_title')}</h1>
            <p className="apps-hero-sub hero-reveal text-zinc-600 dark:text-zinc-400" style={{ animationDelay: '.14s' }}>
              {t('hero_subtitle')}
            </p>
            <div className="apps-actions hero-reveal" style={{ animationDelay: '.26s' }}>
              <a href="#apps-list" className="app-btn app-btn-primary app-btn-lg">{t('hero_cta_primary')}</a>
              <a href="#apps-contact" className="app-btn app-btn-ghost app-btn-lg">{t('hero_cta_secondary')}</a>
            </div>
          </>
        )}
      </section>

      <section id="apps-list" className="apps-section">
        <div className="apps-shell">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-5 text-zinc-900 dark:text-zinc-50 tracking-tight">{t('apps_title')}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">{t('apps_subtitle')}</p>
          </div>

          {loading && <CardsSkeleton />}
          {status === 'error' && <AppsLoadError lang={lang} onRetry={onRetry} />}
          {status === 'ready' && apps.length === 0 && (
            <AppsEmpty title={t('empty_title')} text={t('empty_text')} />
          )}
          {status === 'ready' && apps.length > 0 && (
            <div className="apps-grid">
              {apps.map((app) => (
                <AppCard key={app.id} app={app} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </section>

      {!loading && <AppsContact lang={lang} page={page} contacts={contacts} />}
    </>
  );
}

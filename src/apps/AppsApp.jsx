import { useCallback, useEffect, useMemo, useState } from 'react';
import './apps.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import { applyPageSeo } from '../seo';
import { AppsRouterContext, parseAppsPath } from './appsRouter.js';
import { readLang, readTheme, useApplyPrefs } from './prefs.js';
import { fetchAppsPage, fetchPublishedApps, fetchSiteSettings } from './appsApi.js';
import { DEFAULT_APPS_PAGE, mergeAppsPage, pageText } from './appsDefaults.js';
import { pick } from './appsLib.js';
import { AppsHome } from './AppsHome.jsx';
import { AppDetail } from './AppDetail.jsx';
import { AppsLoadError, AppsNotFound, DetailSkeleton } from './AppsStates.jsx';

export default function AppsApp() {
  const [lang, setLang] = useState(readLang);
  const [theme, setTheme] = useState(readTheme);
  const [path, setPath] = useState(() => window.location.pathname);
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState({
    status: 'loading',
    apps: [],
    page: DEFAULT_APPS_PAGE,
    site: DEFAULT_SETTINGS,
  });

  useApplyPrefs(lang, theme);

  // الرجوع/التقدّم في المتصفح داخل مسارات /apps
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to) => {
    const url = new URL(to, window.location.origin);
    window.history.pushState({}, '', url.pathname + url.search + url.hash);
    setPath(url.pathname);
    requestAnimationFrame(() => {
      const el = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
      if (el) el.scrollIntoView();
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, []);

  // البيانات الحقيقية من قاعدة البيانات: التطبيقات المنشورة + محتوى الصفحة + بيانات التواصل.
  useEffect(() => {
    let alive = true;
    Promise.allSettled([fetchPublishedApps(), fetchAppsPage(), fetchSiteSettings()]).then(([a, p, s]) => {
      if (!alive) return;
      setData({
        status: a.status === 'fulfilled' ? 'ready' : 'error',
        apps: a.status === 'fulfilled' ? a.value : [],
        page: mergeAppsPage(p.status === 'fulfilled' ? p.value : null),
        site: s.status === 'fulfilled' && s.value ? s.value : DEFAULT_SETTINGS,
      });
    });
    return () => { alive = false; };
  }, [attempt]);

  const retry = useCallback(() => {
    setData((d) => ({ ...d, status: 'loading' }));
    setAttempt((n) => n + 1);
  }, []);

  const route = useMemo(() => parseAppsPath(path), [path]);
  const app = route.view === 'detail' ? data.apps.find((x) => x.slug === route.slug) : null;

  useEffect(() => {
    if (data.status === 'loading') return;
    const siteTitle = pageText(data.page, 'seo_title', lang);
    if (route.view === 'detail' && app) {
      applyPageSeo({
        lang,
        title: `${pick(app.name, lang)} | ${siteTitle}`,
        description: pick(app.shortDesc, lang) || pageText(data.page, 'seo_description', lang),
        path: `/apps/${app.slug}`,
      });
    } else if (route.view === 'list') {
      applyPageSeo({ lang, title: siteTitle, description: pageText(data.page, 'seo_description', lang), path: '/apps' });
    } else if (data.status === 'ready') {
      applyPageSeo({
        lang,
        title: `${lang === 'ar' ? 'التطبيق غير موجود' : 'App not found'} | ${siteTitle}`,
        description: pageText(data.page, 'seo_description', lang),
        path: '/apps',
        noindex: true,
      });
    }
  }, [route, app, lang, data]);

  const routerValue = useMemo(() => ({ navigate }), [navigate]);

  let view;
  if (route.view === 'list') {
    view = (
      <AppsHome
        lang={lang}
        page={data.page}
        status={data.status}
        apps={data.apps}
        contacts={data.site.contacts}
        onRetry={retry}
      />
    );
  } else if (route.view === 'detail' && data.status === 'loading') {
    view = <DetailSkeleton />;
  } else if (route.view === 'detail' && data.status === 'error') {
    view = (
      <div className="app-detail">
        <div className="apps-shell-narrow"><AppsLoadError lang={lang} onRetry={retry} /></div>
      </div>
    );
  } else if (route.view === 'detail' && app) {
    view = <AppDetail app={app} lang={lang} contacts={data.site.contacts} />;
  } else {
    view = <AppsNotFound lang={lang} />;
  }

  return (
    <AppsRouterContext.Provider value={routerValue}>
      <div className="apps-page min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 font-arabic">
        <Navbar lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} currentPath={path} />
        <main>{view}</main>
        <Footer
          lang={lang}
          settings={data.site}
          backLink={{ href: '/', label: pageText(data.page, 'footer_back', lang) }}
        />
      </div>
    </AppsRouterContext.Provider>
  );
}

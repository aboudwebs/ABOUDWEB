import { lazy, Suspense } from 'react';
import App from './App.jsx';

// صفحة التطبيقات تُحمَّل عند الحاجة فقط، فلا تزيد حجم الصفحة الرئيسية.
const AppsApp = lazy(() => import('./apps/AppsApp.jsx'));

const isAppsPath = (pathname) => /^\/apps(\/|$)/i.test(pathname);

export default function Root() {
  if (isAppsPath(window.location.pathname)) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-[#09090b]" />}>
        <AppsApp />
      </Suspense>
    );
  }
  return <App />;
}

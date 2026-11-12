import { createContext, useContext } from 'react';

// سياق توجيه خفيف لمسارات /apps و /apps/:slug.
// إذا لم يوجد مزوّد (navigate = null) تعمل الروابط كروابط عادية.
export const AppsRouterContext = createContext({ navigate: null });

export function useAppsRouter() {
  return useContext(AppsRouterContext);
}

export function parseAppsPath(pathname) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  if (parts[0] !== 'apps' || parts.length === 1) return { view: 'list' };
  if (parts.length === 2) {
    try {
      return { view: 'detail', slug: decodeURIComponent(parts[1]).toLowerCase() };
    } catch {
      return { view: 'notfound' };
    }
  }
  return { view: 'notfound' };
}

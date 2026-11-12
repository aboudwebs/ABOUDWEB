import './apps.css';
import { AppsLink } from './AppsLink.jsx';
import { AppIcon } from './AppIcon.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { DownloadIcon } from './AppIcons.jsx';
import { externalProps, getDownloadLinks, pick } from './appsLib.js';

export function AppCard({ app, lang }) {
  const t = (ar, en) => (lang === 'ar' ? ar : en);
  const name = pick(app.name, lang);
  const desc = pick(app.shortDesc, lang);
  const links = getDownloadLinks(app, lang);
  const single = links.length === 1 ? links[0] : null;
  const detailHref = `/apps/${app.slug}`;

  return (
    <article className="app-card">
      <div className="flex items-start gap-4">
        <AppIcon app={app} lang={lang} size="md" />
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 dir="auto" className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50 break-words">
            <AppsLink href={detailHref} className="app-card-link">{name}</AppsLink>
          </h3>
          <div className="mt-2.5">
            <StatusBadge status={app.status} lang={lang} />
          </div>
        </div>
      </div>

      {desc && (
        <p dir="auto" className="app-card-desc text-sm leading-7 text-zinc-600 dark:text-zinc-400">{desc}</p>
      )}

      <div className="app-card-actions">
        <AppsLink href={detailHref} className="app-btn app-btn-ghost flex-1">
          {t('عرض التفاصيل', 'View details')}
        </AppsLink>
        {single && (
          <a href={single.url} {...externalProps(single)} className="app-btn app-btn-primary flex-1">
            <DownloadIcon />
            {t('تحميل', 'Download')}
          </a>
        )}
        {links.length > 1 && (
          <AppsLink href={`${detailHref}#download`} className="app-btn app-btn-primary flex-1">
            <DownloadIcon />
            {t('خيارات التحميل', 'Download options')}
          </AppsLink>
        )}
      </div>
    </article>
  );
}

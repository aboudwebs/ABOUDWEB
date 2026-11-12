import './apps.css';
import { Check } from 'lucide-react';
import { AppsLink } from './AppsLink.jsx';
import { AppIcon } from './AppIcon.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { AppGallery } from './AppGallery.jsx';
import { BackArrowIcon, DownloadIcon } from './AppIcons.jsx';
import { externalProps, getDownloadLinks, pick, whatsappHref } from './appsLib.js';

export function AppDetail({ app, lang, contacts }) {
  const t = (ar, en) => (lang === 'ar' ? ar : en);
  const name = pick(app.name, lang);
  const short = pick(app.shortDesc, lang);
  const long = pick(app.longDesc, lang);
  const features = app.features[lang].length ? app.features[lang] : app.features[lang === 'ar' ? 'en' : 'ar'];
  const links = getDownloadLinks(app, lang);
  const wa = whatsappHref(
    contacts?.whatsapp,
    t(`مرحباً، أريد الاستفسار عن تطبيق ${name}.`, `Hello, I would like to ask about the ${name} app.`)
  );

  let note = '';
  if (!links.length) {
    if (app.status === 'available') note = t('رابط التحميل غير متوفر حالياً.', 'The download link is not available right now.');
    else if (app.status === 'in_development') note = t('هذا التطبيق قيد التطوير ولم يُطلق بعد.', 'This app is still in development and has not launched yet.');
    else note = t('هذا التطبيق لم يُطلق بعد وسيتوفر قريباً.', 'This app has not launched yet and will be available soon.');
  }

  return (
    <article className="app-detail">
      <div className="apps-shell-narrow">
        <AppsLink href="/apps" className="app-back">
          <BackArrowIcon className="rtl:rotate-180" />
          {t('كل التطبيقات', 'All apps')}
        </AppsLink>

        <header className="app-detail-head">
          <AppIcon app={app} lang={lang} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={app.status} lang={lang} />
              {app.version && (
                <span className="app-chip">{t('الإصدار', 'Version')} <bdi>{app.version}</bdi></span>
              )}
            </div>
            <h1 className="app-detail-title" dir="auto">{name}</h1>
            {short && <p className="app-detail-short" dir="auto">{short}</p>}

            <div id="download" className="app-detail-actions">
              {links.map((link, i) => (
                <a
                  key={link.key}
                  href={link.url}
                  {...externalProps(link)}
                  className={`app-btn app-btn-lg ${i === 0 ? 'app-btn-primary' : 'app-btn-ghost'}`}
                >
                  <DownloadIcon />
                  {link.label}
                </a>
              ))}
              {note && <p className="app-note">{note}</p>}
            </div>
          </div>
        </header>

        {app.screenshots.length > 0 && (
          <section className="app-block" aria-label={t('صور التطبيق', 'Screenshots')}>
            <AppGallery images={app.screenshots} title={name} lang={lang} />
          </section>
        )}

        {(long || features.length > 0) && (
          <section className="app-block app-about">
            {long && (
              <div>
                <h2 className="app-block-title">{t('عن التطبيق', 'About the app')}</h2>
                <p className="app-long" dir="auto">{long}</p>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <h2 className="app-block-title">{t('المزايا', 'Features')}</h2>
                <ul className="app-features">
                  {features.map((f, i) => (
                    <li key={`${f}-${i}`}>
                      <Check className="app-feature-check" aria-hidden="true" />
                      <span dir="auto">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {wa && (
          <section className="app-strip">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t('لديك سؤال عن هذا التطبيق؟', 'Have a question about this app?')}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('راسلنا مباشرة وسنرد عليك.', 'Message us directly and we will get back to you.')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="app-btn app-btn-primary">WhatsApp</a>
              <AppsLink href="/apps#apps-contact" className="app-btn app-btn-ghost">{t('كل قنوات التواصل', 'All channels')}</AppsLink>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

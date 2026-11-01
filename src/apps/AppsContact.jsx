import './apps.css';
import { buildChannels } from './appsLib.js';
import { pageText } from './appsDefaults.js';

export function AppsContact({ lang, page, contacts }) {
  const channels = buildChannels({
    contacts,
    page,
    lang,
    message: pageText(page, 'contact_whatsapp_message', lang),
  });
  if (!channels.length) return null;

  return (
    <section id="apps-contact" className="apps-section">
      <div className="apps-shell">
        <div className="text-center mb-12">
          <div className="portfolio-eyebrow">CONTACT</div>
          <h2 className="text-4xl md:text-6xl font-bold mb-5 text-zinc-900 dark:text-zinc-50 tracking-tight">
            {pageText(page, 'contact_title', lang)}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {pageText(page, 'contact_subtitle', lang)}
          </p>
        </div>

        <div className="app-channels">
          {channels.map((ch) => (
            <a
              key={ch.key}
              href={ch.href}
              {...(ch.external === false ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className={`app-channel${ch.primary ? ' app-channel--primary' : ''}`}
            >
              <span className="app-channel-label">{ch.label}</span>
              <span className="app-channel-hint"><bdi>{ch.hint}</bdi></span>
              <span className="app-channel-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

import { pick } from './appsLib.js';

export function AppIcon({ app, lang, size = 'md' }) {
  const name = pick(app.name, lang);
  const initial = ([...name][0] || '•').toUpperCase();
  return (
    <span className={`app-icon app-icon--${size}`}>
      {app.iconUrl ? (
        <img src={app.iconUrl} alt="" decoding="async" draggable="false" />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}

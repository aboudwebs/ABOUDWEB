import { STATUS_LABELS } from './appsLib.js';

const TONE = {
  available: 'app-status--available',
  in_development: 'app-status--dev',
  coming_soon: 'app-status--soon',
};

export function StatusBadge({ status, lang }) {
  const label = (STATUS_LABELS[status] || STATUS_LABELS.coming_soon)[lang];
  return (
    <span className={`app-status ${TONE[status] || TONE.coming_soon}`}>
      <i aria-hidden="true" />
      {label}
    </span>
  );
}

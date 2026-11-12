import { useCallback, useEffect, useRef, useState } from 'react';
import './apps.css';
import { ChevronLeftIcon, ChevronRightIcon } from './AppIcons.jsx';

// معرض صور التطبيق: شريط أفقي قابل للتمرير + عارض مكبّر يستخدم نفس تصميم عارض معرض الأعمال.
export function AppGallery({ images, title, lang }) {
  const [openIndex, setOpenIndex] = useState(null);
  const opener = useRef(null);
  const total = images.length;

  const close = useCallback(() => {
    setOpenIndex(null);
    if (opener.current && opener.current.focus) opener.current.focus();
  }, []);
  const step = useCallback((d) => setOpenIndex((i) => (i === null ? i : (i + d + total) % total)), [total]);

  useEffect(() => {
    if (openIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, step]);

  if (!total) return null;
  const t = (ar, en) => (lang === 'ar' ? ar : en);

  return (
    <>
      <div className="app-shots" aria-label={t('صور التطبيق', 'App screenshots')}>
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className="app-shot"
            onClick={(e) => { opener.current = e.currentTarget; setOpenIndex(i); }}
            aria-label={`${title} — ${i + 1} / ${total}`}
          >
            <img src={src} alt="" loading="lazy" decoding="async" draggable="false" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="portfolio-lightbox" role="dialog" aria-modal="true" aria-label={title} onClick={close}>
          <button type="button" className="portfolio-lightbox-close" onClick={close} aria-label={t('إغلاق الصورة', 'Close image')} autoFocus>×</button>
          <div className="portfolio-lightbox-frame" onClick={(e) => e.stopPropagation()}>
            <img src={images[openIndex]} alt={`${title} — ${openIndex + 1}`} />
            <div className="portfolio-lightbox-caption" dir="ltr">
              <span>{openIndex + 1} / {total}</span>
              <strong>{title}</strong>
            </div>
            {total > 1 && (
              <>
                <button type="button" className="app-lightbox-nav app-lightbox-prev" onClick={() => step(-1)} aria-label={t('الصورة السابقة', 'Previous image')}><ChevronLeftIcon /></button>
                <button type="button" className="app-lightbox-nav app-lightbox-next" onClick={() => step(1)} aria-label={t('الصورة التالية', 'Next image')}><ChevronRightIcon /></button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

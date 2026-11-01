import React from 'react';
import { DEFAULT_SETTINGS } from '../defaultSettings';

export function Hero({ lang, settings }) {
  const activeSettings = settings || DEFAULT_SETTINGS;

  const availabilityStatus = activeSettings.hero?.availability_active ?? true;
  const badgeText = lang === 'ar'
    ? (activeSettings.hero?.availability_ar || DEFAULT_SETTINGS.hero.availability_ar)
    : (activeSettings.hero?.availability_en || DEFAULT_SETTINGS.hero.availability_en);

  const title = lang === 'ar'
    ? DEFAULT_SETTINGS.hero.title_ar
    : DEFAULT_SETTINGS.hero.title_en;

  const subtitle = lang === 'ar'
    ? DEFAULT_SETTINGS.hero.subtitle_ar
    : DEFAULT_SETTINGS.hero.subtitle_en;

  const ctaPrimary = lang === 'ar'
    ? (activeSettings.hero?.cta_primary_ar || DEFAULT_SETTINGS.hero.cta_primary_ar)
    : (activeSettings.hero?.cta_primary_en || DEFAULT_SETTINGS.hero.cta_primary_en);

  const ctaSecondary = lang === 'ar'
    ? (activeSettings.hero?.cta_secondary_ar || DEFAULT_SETTINGS.hero.cta_secondary_ar)
    : (activeSettings.hero?.cta_secondary_en || DEFAULT_SETTINGS.hero.cta_secondary_en);

  const whatsappNumber = activeSettings.contacts?.whatsapp || DEFAULT_SETTINGS.contacts.whatsapp;
  const projectMessage = encodeURIComponent(
    lang === 'ar'
      ? 'مرحباً عبود، أريد مناقشة مشروع جديد معك.'
      : 'Hello Aboud, I would like to discuss a new project with you.'
  );

  React.useEffect(() => {
    const section = document.querySelector('.hero-premium');
    if (!section) return;

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const range = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / range, 0), 1);
      section.style.setProperty('--hero-scroll', progress.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateProgress);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hero-premium relative min-h-[150vh] flex flex-col items-center justify-center pt-32 pb-16 px-4 overflow-hidden">
      {/* Premium ambient background */}
      <div className="hero-orb hero-orb-one" aria-hidden="true"></div>
      <div className="hero-orb hero-orb-two" aria-hidden="true"></div>
      <div className="hero-grid" aria-hidden="true"></div>

      <div className="hero-orbit-system" aria-hidden="true">
        <div className="hero-orbit hero-orbit-a"><span></span></div>
        <div className="hero-orbit hero-orbit-b"><span></span></div>
        <div className="hero-orbit-core">
          <div className="hero-core-glow"></div>
          <div className="hero-core-dot"></div>
        </div>
        <div className="hero-orbit-label hero-orbit-label-idea">IDEA</div>
        <div className="hero-orbit-label hero-orbit-label-design">DESIGN</div>
        <div className="hero-orbit-label hero-orbit-label-build">BUILD</div>
        <div className="hero-orbit-label hero-orbit-label-launch">LAUNCH</div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-50 dark:via-zinc-950 to-zinc-50 dark:to-zinc-950"></div>

      {/* Live Badge */}
      <div className="hero-reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 backdrop-blur-sm mb-8">
        <span className="relative flex h-2 w-2">
          {availabilityStatus ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
          )}
        </span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {badgeText}
        </span>
      </div>

      {/* Hero Content */}
      <div className="max-w-5xl text-center space-y-8">
        <h1 className="hero-title hero-reveal text-[1.7rem] sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-normal text-zinc-900 dark:text-zinc-50 leading-[1.55] sm:leading-[1.35] md:leading-[1.08] text-balance break-words px-2 sm:px-0">
          {title}
        </h1>
        <p className="hero-subtitle hero-reveal text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="hero-actions hero-reveal flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a href={`https://wa.me/${whatsappNumber}?text=${projectMessage}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300">
            <span className="relative z-10 block w-full text-center">{ctaPrimary}</span>
          </a>
          <a href="#portfolio" className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-300 font-medium">
            <span className="relative z-10 block w-full text-center">{ctaSecondary}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

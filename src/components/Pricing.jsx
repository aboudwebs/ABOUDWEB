import React from 'react';
import { Check } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../defaultSettings';

export function Pricing({ lang, settings }) {
  const activeSettings = settings || DEFAULT_SETTINGS;
  const pkg1 = activeSettings.pricing?.package1 || DEFAULT_SETTINGS.pricing.package1;
  const pkg2 = activeSettings.pricing?.package2 || DEFAULT_SETTINGS.pricing.package2;

  const title = lang === 'ar' ? 'ابدأ مشروعك' : 'Start your project';
  const subtitle = lang === 'ar'
    ? 'ما في مشروعين متشابهين. احكِ لنا عن فكرتك ونبني الحل المناسب إلها.'
    : 'No two projects are the same. Tell us about your idea and we will shape the right solution.';

  const whatsappNumber = activeSettings.contacts?.whatsapp || '963951708141';
  const message = encodeURIComponent(
    lang === 'ar'
      ? 'مرحباً، أريد مناقشة مشروع جديد مع Aboud Web.'
      : 'Hello, I would like to discuss a new project with Aboud Web.'
  );

  return (
    <section id="pricing" className="relative overflow-hidden py-32 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 w-[520px] h-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-200/40 dark:bg-zinc-800/20 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-12 lg:gap-20 items-end">
          <div>
            <span className="text-[10px] tracking-[.24em] text-zinc-500 uppercase">LET'S BUILD</span>
            <h2 className="mt-5 text-5xl md:text-7xl font-semibold tracking-[-.045em] leading-[.98] text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
          </div>
          <div>
            <p className="text-base md:text-lg leading-8 text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-4 text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              <span className="relative">
                {lang === 'ar' ? 'احكي معنا عن مشروعك' : 'Talk about your project'}
                <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 group-hover:scale-x-100" />
              </span>
              <span className="transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">↗</span>
            </a>
          </div>
        </div>

        <div className="mt-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="grid md:grid-cols-2">
            <div className="py-8 md:pr-12 md:border-r border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-mono text-zinc-400">01</span>
              <h3 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {lang === 'ar' ? (pkg1.name_ar || 'موقع مخصص') : (pkg1.name_en || 'Custom Website')}
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                {lang === 'ar' ? (pkg1.desc_ar || 'حل رقمي مصمم حول احتياج نشاطك.') : (pkg1.desc_en || 'A digital solution designed around your business.')}
              </p>
            </div>
            <div className="py-8 md:pl-12">
              <span className="text-xs font-mono text-zinc-400">02</span>
              <h3 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {lang === 'ar' ? (pkg2.name_ar || 'حل مخصص') : (pkg2.name_en || 'Tailored Solution')}
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                {lang === 'ar' ? (pkg2.desc_ar || 'تجربة رقمية أوسع حسب أهداف المشروع.') : (pkg2.desc_en || 'A broader digital experience shaped around the project goals.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

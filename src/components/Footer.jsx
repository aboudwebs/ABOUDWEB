import React from 'react';
import { Logo } from './Logo';
import { DEFAULT_SETTINGS } from '../defaultSettings';

export function Footer({ lang = 'ar', settings, backLink }) {
  const activeSettings = settings || DEFAULT_SETTINGS;
  const contacts = activeSettings.contacts || DEFAULT_SETTINGS.contacts;

  const whatsappNumber = contacts.whatsapp || '963951708141';
  const telegramUsername = contacts.telegram || 'qamviir';
  const instagramUrl = contacts.instagram || 'https://instagram.com/qamvir';
  const xUrl = contacts.x || 'https://x.com/qamvir';

  const cleanTelegram = telegramUsername.replace('@', '');
  const finalInstagramUrl = instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`;
  const copyrightText = lang === 'ar'
    ? (contacts.copyright_ar || DEFAULT_SETTINGS.contacts.copyright_ar)
    : (contacts.copyright_en || DEFAULT_SETTINGS.contacts.copyright_en);

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#09090b] py-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <span className="font-english font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">QAMVIR</span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-sm leading-6">
            {copyrightText}
          </p>
        </div>

        <div className="flex flex-col items-start gap-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-400">
            {backLink && (
              <a href={backLink.href} className="font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">{backLink.label}</a>
            )}
            <a href="/apps" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">{lang === 'ar' ? 'التطبيقات' : 'Apps'}</a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">WhatsApp</a>
            <a href={`https://t.me/${cleanTelegram}`} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Telegram</a>
            <a href={finalInstagramUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Instagram</a>
            <a href={xUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">X</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

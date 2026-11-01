import React, { useState } from 'react';
import { Logo } from './Logo';
import { Moon, Sun, Globe, Menu, X } from 'lucide-react';

export function Navbar({ lang, setLang, theme, setTheme, currentPath }) {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [mobileOpen, setMobileOpen] = useState(false);

  // روابط التنقل بين الموقع الرئيسي وصفحة التطبيقات
  const path = currentPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const onApps = /^\/apps(\/|$)/i.test(path);
  const navLinks = [
    { href: '/', label: lang === 'ar' ? 'الرئيسية' : 'Home', active: !onApps },
    { href: '/apps', label: lang === 'ar' ? 'التطبيقات' : 'Apps', active: onApps },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <nav
      onPointerMove={handlePointerMove}
      className="fixed top-4 inset-x-0 mx-auto w-[calc(100%-24px)] max-w-5xl z-50 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,.08)] dark:shadow-[0_12px_50px_rgba(0,0,0,.22)]"
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: `radial-gradient(180px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,.12), transparent 70%)`,
        }}
      />

      <div className="relative flex items-center justify-between px-4 py-3 sm:px-5">
        <a href="/" className="flex items-center gap-2.5" aria-label="ABOUD WEB">
          <Logo />
          <span className="font-english font-semibold tracking-[0.16em] text-sm text-zinc-900 dark:text-zinc-50">
            ABOUD WEB
          </span>
        </a>

        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              className={`flex items-center h-9 px-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-white ${
                link.active
                  ? 'text-zinc-950 dark:text-white bg-zinc-100/80 dark:bg-zinc-800/60'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="group relative grid h-9 w-9 place-items-center rounded-xl text-zinc-600 dark:text-zinc-300 transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </button>

          <button
            onClick={toggleLang}
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-white"
            aria-label="Change language"
          >
            <Globe className="h-4 w-4" />
            <span className="font-english">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="sm:hidden group relative grid h-9 w-9 place-items-center rounded-xl text-zinc-600 dark:text-zinc-300 transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <Menu className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`relative grid transition-[grid-template-rows,opacity] duration-300 sm:hidden ${
          mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-zinc-200/70 dark:border-zinc-800/70 px-4 pt-3 flex items-center justify-between gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.active ? 'page' : undefined}
                tabIndex={mobileOpen ? 0 : -1}
                className={`flex-1 h-10 grid place-items-center rounded-xl text-sm font-medium ${
                  link.active
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                    : 'bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-2">
            <button
              onClick={() => { toggleLang(); setMobileOpen(false); }}
              className="flex-1 h-10 rounded-xl text-sm font-medium bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
            <button
              onClick={() => { toggleTheme(); setMobileOpen(false); }}
              className="flex-1 h-10 rounded-xl text-sm font-medium bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

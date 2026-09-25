import React from 'react';
import { Moon, Sun, Globe, Radio } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: 'en' | 'hi';
  onToggleLang: () => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
  isBackendConnected
}) => {
  return (
    <header className="sticky top-0 z-20 bg-[var(--surf)] border-b border-[var(--line)] px-6 py-3.5 flex items-center justify-between gap-4 transition-colors">
      <div>
        <h1 className="text-xl font-extrabold text-[var(--ink)] leading-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-[var(--mute)]">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend live status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--line)] text-xs">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[var(--mute)] font-mono text-[11px]">
            {isBackendConnected ? 'Backend Connected' : 'Connecting...'}
          </span>
        </div>

        {/* Language switch */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surf)] text-xs font-semibold hover:border-[var(--acc)] text-[var(--ink)] transition-colors"
          title="Switch language between English and Hindi"
        >
          <Globe className="w-3.5 h-3.5 text-[var(--acc)]" />
          <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surf)] text-[var(--ink)] hover:border-[var(--acc)] transition-colors"
          aria-label="Toggle theme"
          title="Toggle light/dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Officer avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[var(--line)]">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-[var(--ink)]">
              {lang === 'hi' ? 'राजस्व अधिकारी' : 'Revenue Officer'}
            </div>
            <div className="text-[11px] text-[var(--mute)]">Tehsil Office</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--okbg)] text-[var(--ok)] font-extrabold text-sm flex items-center justify-center border border-[var(--line)] shadow-sm">
            RO
          </div>
        </div>
      </div>
    </header>
  );
};

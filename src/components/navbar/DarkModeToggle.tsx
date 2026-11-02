import React, { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'bf-theme';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
};

const isDarkTheme = (theme: Theme, systemPrefersDark: boolean) =>
  theme === 'dark' || (theme === 'system' && systemPrefersDark);

const DarkModeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = isDarkTheme(theme, media.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };

    window.localStorage.setItem(STORAGE_KEY, theme);
    apply();
    if (theme === 'system') media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Day mode', icon: Sun },
    { value: 'dark', label: 'Night mode', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];
  const CurrentIcon = options.find(option => option.value === theme)?.icon || Monitor;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Choose appearance"
        aria-haspopup="menu"
        aria-expanded={open}
        title={theme === 'system' ? 'Appearance: System' : 'Appearance: ' + (theme === 'dark' ? 'Night' : 'Day')}
        onClick={() => setOpen(value => !value)}
        onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#C6AD70] bg-background text-foreground transition-colors hover:bg-[#F5F0E3] hover:text-[#6A5428] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89A55] focus-visible:ring-offset-2 dark:hover:bg-[#383222] dark:hover:text-[#E9D8A9]"
      >
        <CurrentIcon size={17} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" aria-label="Appearance options" className="absolute right-0 top-full z-[100] mt-2 min-w-[172px] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Appearance</p>
          {options.map(option => {
            const OptionIcon = option.icon;
            const selected = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => { setTheme(option.value); setOpen(false); }}
                className={'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89A55] ' + (selected ? 'bg-[#F4EEDC] font-semibold text-[#5C4720] dark:bg-[#3A3325] dark:text-[#F0DCA9]' : 'text-foreground hover:bg-muted')}
              >
                <OptionIcon size={16} aria-hidden="true" />
                <span>{option.label}</span>
                {selected && <span className="ml-auto text-xs" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DarkModeToggle;

"use client";

import React from 'react';
import { useTheme } from '@/lib/theme-provider';
import { ThemeName } from '@/lib/themes';
import { Button } from './Button';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const themeIcons: Record<ThemeName, React.ComponentType<any>> = {
  modern: SparklesIcon,
  dark: MoonIcon,
  purple: HeartIcon,
  emerald: ComputerDesktopIcon,
};

const themeNames: Record<ThemeName, string> = {
  modern: 'Modern',
  dark: 'Dark',
  purple: 'Purple',
  emerald: 'Emerald',
};

export const ThemeSelector: React.FC<{
  variant?: 'dropdown' | 'toggle' | 'pills';
}> = ({ variant = 'dropdown' }) => {
  const { themeName, setTheme, toggleTheme } = useTheme();
  const CurrentIcon = themeIcons[themeName];

  if (variant === 'toggle') {
    return (
      <Button
        variant="neutral"
        style="outline"
        size="sm"
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 glass-effect"
        aria-label={`Current theme: ${themeNames[themeName]}`}
      >
        <CurrentIcon className="h-5 w-5" />
      </Button>
    );
  }

  if (variant === 'pills') {
    return (
      <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl dark:bg-neutral-800">
        {Object.entries(themeIcons).map(([name, Icon]) => (
          <Button
            key={name}
            variant={themeName === name ? 'success' : 'neutral'}
            style={themeName === name ? 'solid' : 'soft'}
            size="sm"
            onClick={() => setTheme(name as ThemeName)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{themeNames[name as ThemeName]}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      <Button variant="neutral" style="outline" className="flex items-center gap-2">
        <CurrentIcon className="h-4 w-4" />
        <span>{themeNames[themeName]}</span>
      </Button>
      
      <div className="absolute top-full mt-2 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 py-2 min-w-[150px] dark:bg-neutral-900 dark:border-neutral-800">
          {Object.entries(themeIcons).map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => setTheme(name as ThemeName)}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Icon className="h-4 w-4 text-neutral-500" />
              <span className="text-sm">{themeNames[name as ThemeName]}</span>
              {themeName === name && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

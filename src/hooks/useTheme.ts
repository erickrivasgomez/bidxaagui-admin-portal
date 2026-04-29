import { useState, useEffect } from 'react';

export type ThemeScheme = 'organic-luxury' | 'earth' | 'olive';
export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeConfig {
  scheme: ThemeScheme;
  mode: ColorMode;
}

const THEME_STORAGE_KEY = 'bidxaagui-theme';

export const useTheme = () => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    // Load from localStorage or default to organic-luxury
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { scheme: 'organic-luxury', mode: 'system' } as ThemeConfig;
      }
    }
    return { scheme: 'organic-luxury', mode: 'system' } as ThemeConfig;
  });

  const [isDark, setIsDark] = useState(false);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.removeAttribute('data-theme');
    
    // Determine actual color mode
    let actualMode = themeConfig.mode;
    if (themeConfig.mode === 'system') {
      actualMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Apply theme attribute
    const themeValue = `${themeConfig.scheme}-${actualMode}`;
    root.setAttribute('data-theme', themeValue);
    
    // Update dark mode state
    setIsDark(actualMode === 'dark');
    
    // Update meta theme-color for PWA
    const themeColor = actualMode === 'dark' ? '#141612' : '#868466';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [themeConfig]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeConfig.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        const root = document.documentElement;
        const themeValue = `${themeConfig.scheme}-${mediaQuery.matches ? 'dark' : 'light'}`;
        root.setAttribute('data-theme', themeValue);
        setIsDark(mediaQuery.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeConfig]);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    const newConfig = { ...themeConfig, ...updates };
    setThemeConfig(newConfig);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newConfig));
  };

  const setScheme = (scheme: ThemeScheme) => {
    updateTheme({ scheme });
  };

  const setMode = (mode: ColorMode) => {
    updateTheme({ mode });
  };

  const toggleDarkMode = () => {
    if (themeConfig.mode === 'system') {
      setMode('light');
    } else if (themeConfig.mode === 'light') {
      setMode('dark');
    } else {
      setMode('system');
    }
  };

  // Get current theme colors
  const getThemeColors = () => {
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    
    return {
      primary: computed.getPropertyValue('--primary').trim(),
      secondary: computed.getPropertyValue('--secondary').trim(),
      accentGold: computed.getPropertyValue('--accent-gold').trim(),
      accentSoft: computed.getPropertyValue('--accent-soft').trim(),
      background: computed.getPropertyValue('--background').trim(),
      surface: computed.getPropertyValue('--surface').trim(),
      surfaceSecondary: computed.getPropertyValue('--surface-secondary').trim(),
      textPrimary: computed.getPropertyValue('--text-primary').trim(),
      textSecondary: computed.getPropertyValue('--text-secondary').trim(),
      textTertiary: computed.getPropertyValue('--text-tertiary').trim(),
      border: computed.getPropertyValue('--border').trim(),
      success: computed.getPropertyValue('--success').trim(),
      warning: computed.getPropertyValue('--warning').trim(),
      error: computed.getPropertyValue('--error').trim(),
      info: computed.getPropertyValue('--info').trim(),
      // Button colors
      buttonPrimary: computed.getPropertyValue('--button-primary').trim(),
      buttonSecondary: computed.getPropertyValue('--button-secondary').trim(),
      buttonPremium: computed.getPropertyValue('--button-premium').trim(),
      buttonGhost: computed.getPropertyValue('--button-ghost').trim(),
      // Card colors
      cardBg: computed.getPropertyValue('--card-bg').trim(),
      cardBorder: computed.getPropertyValue('--card-border').trim(),
      // Input colors
      inputBg: computed.getPropertyValue('--input-bg').trim(),
      inputBorder: computed.getPropertyValue('--input-border').trim(),
      inputBorderFocus: computed.getPropertyValue('--input-border-focus').trim(),
    };
  };

  // Utility functions for Organic Luxury theme
  const getButtonVariant = (variant: 'primary' | 'secondary' | 'premium' | 'ghost') => {
    const colors = getThemeColors();
    switch (variant) {
      case 'primary': return colors.buttonPrimary;
      case 'secondary': return colors.buttonSecondary;
      case 'premium': return colors.buttonPremium;
      case 'ghost': return colors.buttonGhost;
    }
  };

  const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info') => {
    const colors = getThemeColors();
    switch (status) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      case 'info': return colors.info;
    }
  };

  return {
    scheme: themeConfig.scheme,
    mode: themeConfig.mode,
    isDark,
    setScheme,
    setMode,
    toggleDarkMode,
    getThemeColors,
    getButtonVariant,
    getStatusColor,
    themeConfig
  };
};

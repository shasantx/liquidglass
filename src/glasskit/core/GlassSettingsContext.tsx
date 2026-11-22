import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supportsSvgBackdropFilter } from './liquidGlassEngine';

export type BackdropTheme = 'alpine' | 'sunset' | 'light' | 'dark';
export type SiteTheme = 'dark' | 'light';
export type GlassPreset = 'clear' | 'regular' | 'crystal' | 'prism';
export type GlassRenderMode = 'auto' | 'webgl' | 'svg' | 'css';

export interface GlassSettings {
  refraction: number; // 0 to 1.8 (iOS 26 calibrated default ~0.88)
  blur: number; // 0 to 6 (creamy optical frost, default 3.4)
  bezelWidth: number; // 12 to 42 px (default 24)
  specular: number; // 0 to 1.5 (default 0.95)
  aberration: number; // 0 to 0.45 (physical RGB dispersion, default 0.16)
  saturation: number; // 1.0 to 1.6 (restrained Apple vibrancy, default 1.16)
  morphStrength: number; // 0 to 0.14 (organic liquid merge)
  useSvgRefraction: boolean;
  renderMode: GlassRenderMode;
  siteTheme: SiteTheme;
}

export interface GlassSettingsContextValue {
  settings: GlassSettings;
  svgSupported: boolean;
  updateSetting: <K extends keyof GlassSettings>(key: K, value: GlassSettings[K]) => void;
  applyPreset: (preset: GlassPreset) => void;
  resetSettings: () => void;
}

const THEME_STORAGE_KEY = 'glasskit-site-theme';

export const DEFAULT_GLASS_SETTINGS: GlassSettings = {
  refraction: 0.88,
  blur: 3.4,
  bezelWidth: 24,
  specular: 0.95,
  aberration: 0.16,
  saturation: 1.16,
  morphStrength: 0.075,
  useSvgRefraction: true,
  renderMode: 'auto',
  siteTheme: 'dark',
};

function resolveInitialSiteTheme(
  explicitTheme: SiteTheme | undefined,
  persistTheme: boolean
): SiteTheme {
  if (explicitTheme) return explicitTheme;
  if (typeof window === 'undefined') return 'dark';
  if (persistTheme) {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage restrictions
    }
  }
  return 'dark';
}

const GlassSettingsContext = createContext<GlassSettingsContextValue | null>(null);

export interface GlassSettingsProviderProps {
  children: React.ReactNode;
  /** Override default optical parameters for your app */
  defaultSettings?: Partial<GlassSettings>;
  /** Persist siteTheme changes to localStorage (default: true) */
  persistTheme?: boolean;
}

export const GlassSettingsProvider: React.FC<GlassSettingsProviderProps> = ({
  children,
  defaultSettings,
  persistTheme = true,
}) => {
  const [svgSupported] = useState(() => supportsSvgBackdropFilter());
  const [settings, setSettings] = useState<GlassSettings>(() => ({
    ...DEFAULT_GLASS_SETTINGS,
    useSvgRefraction: supportsSvgBackdropFilter(),
    ...defaultSettings,
    siteTheme: resolveInitialSiteTheme(defaultSettings?.siteTheme, persistTheme),
  }));

  useEffect(() => {
    if (!persistTheme || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, settings.siteTheme);
    } catch {
      // ignore storage restrictions
    }
  }, [settings.siteTheme, persistTheme]);

  const updateSetting = useCallback(
    <K extends keyof GlassSettings>(key: K, value: GlassSettings[K]) => {
      setSettings((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
    },
    []
  );

  const applyPreset = useCallback((preset: GlassPreset) => {
    setSettings((prev) => {
      if (preset === 'clear') {
        return {
          ...prev,
          refraction: 0.88,
          blur: 3.4,
          bezelWidth: 24,
          specular: 0.95,
          aberration: 0.16,
          saturation: 1.16,
        };
      }
      if (preset === 'regular') {
        return {
          ...prev,
          refraction: 0.65,
          blur: 5.2,
          bezelWidth: 20,
          specular: 0.85,
          aberration: 0.08,
          saturation: 1.12,
        };
      }
      if (preset === 'crystal') {
        return {
          ...prev,
          refraction: 1.25,
          blur: 1.2,
          bezelWidth: 28,
          specular: 1.15,
          aberration: 0.18,
          saturation: 1.22,
        };
      }
      return {
        ...prev,
        refraction: 1.15,
        blur: 2.2,
        bezelWidth: 26,
        specular: 1.1,
        aberration: 0.34,
        saturation: 1.24,
      };
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings((prev) => ({
      ...DEFAULT_GLASS_SETTINGS,
      ...defaultSettings,
      siteTheme: prev.siteTheme,
      useSvgRefraction: svgSupported,
      renderMode: 'auto',
    }));
  }, [defaultSettings, svgSupported]);

  const value = useMemo<GlassSettingsContextValue>(
    () => ({
      settings,
      svgSupported,
      updateSetting,
      applyPreset,
      resetSettings,
    }),
    [settings, svgSupported, updateSetting, applyPreset, resetSettings]
  );

  return (
    <GlassSettingsContext.Provider value={value}>
      {children}
    </GlassSettingsContext.Provider>
  );
};

export function useGlassSettings(): GlassSettingsContextValue {
  const ctx = useContext(GlassSettingsContext);
  if (!ctx) {
    // Graceful standalone default so components still work without an explicit provider
    return {
      settings: DEFAULT_GLASS_SETTINGS,
      svgSupported: supportsSvgBackdropFilter(),
      updateSetting: () => {},
      applyPreset: () => {},
      resetSettings: () => {},
    };
  }
  return ctx;
}

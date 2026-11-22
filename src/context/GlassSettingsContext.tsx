import React, { createContext, useContext, useMemo, useState } from 'react';
import { supportsSvgBackdropFilter } from '../lib/liquidGlassEngine';

export type BackdropTheme = 'alpine' | 'sunset' | 'light' | 'dark';
export type SiteTheme = 'dark' | 'light';
export type GlassPreset = 'clear' | 'regular' | 'crystal' | 'prism';

export interface GlassSettings {
  refraction: number; // 0 to 1.8 (iOS 26-27 calibrated default ~0.85)
  blur: number; // 0 to 6 (creamy optical frost, default 3.4)
  bezelWidth: number; // 12 to 42 px (default 24)
  specular: number; // 0 to 1.5 (default 0.95)
  aberration: number; // 0 to 0.45 (physical RGB dispersion, default 0.16)
  saturation: number; // 1.0 to 1.6 (restrained Apple vibrancy, default 1.16)
  morphStrength: number; // 0 to 0.14 (organic liquid merge)
  useSvgRefraction: boolean;
  siteTheme: SiteTheme;
}

interface GlassSettingsContextValue {
  settings: GlassSettings;
  svgSupported: boolean;
  updateSetting: <K extends keyof GlassSettings>(key: K, value: GlassSettings[K]) => void;
  applyPreset: (preset: GlassPreset) => void;
  resetSettings: () => void;
}

/**
 * Calibrated directly to Apple iOS 26 / iOS 27 Liquid Glass:
 * calm creamy frosted interior, refined convex rim lensing, physical RGB dispersion
 * (no overcooked fisheye or artificial rainbow halo).
 */
const DEFAULT_SETTINGS: GlassSettings = {
  refraction: 0.88,
  blur: 3.4,
  bezelWidth: 24,
  specular: 0.95,
  aberration: 0.16,
  saturation: 1.16,
  morphStrength: 0.075,
  useSvgRefraction: true,
  siteTheme: 'dark',
};

const GlassSettingsContext = createContext<GlassSettingsContextValue | null>(null);

export const GlassSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [svgSupported] = useState(() => supportsSvgBackdropFilter());
  const [settings, setSettings] = useState<GlassSettings>(() => ({
    ...DEFAULT_SETTINGS,
    useSvgRefraction: supportsSvgBackdropFilter(),
  }));

  const updateSetting = <K extends keyof GlassSettings>(
    key: K,
    value: GlassSettings[K]
  ) => {
    setSettings((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  };

  const applyPreset = (preset: GlassPreset) => {
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
  };

  const resetSettings = () => {
    setSettings((prev) => ({
      ...DEFAULT_SETTINGS,
      siteTheme: prev.siteTheme,
      useSvgRefraction: svgSupported,
    }));
  };

  const value = useMemo(
    () => ({
      settings,
      svgSupported,
      updateSetting,
      applyPreset,
      resetSettings,
    }),
    [settings, svgSupported]
  );

  return (
    <GlassSettingsContext.Provider value={value}>
      {children}
    </GlassSettingsContext.Provider>
  );
};

export function useGlassSettings() {
  const ctx = useContext(GlassSettingsContext);
  if (!ctx) {
    throw new Error('useGlassSettings must be used inside GlassSettingsProvider');
  }
  return ctx;
}

import React from 'react';
export type BackdropTheme = 'alpine' | 'sunset' | 'light' | 'dark';
export type SiteTheme = 'dark' | 'light';
export type GlassPreset = 'clear' | 'regular' | 'crystal' | 'prism';
export type GlassRenderMode = 'auto' | 'webgl' | 'svg' | 'css';
export interface GlassSettings {
    refraction: number;
    blur: number;
    bezelWidth: number;
    specular: number;
    aberration: number;
    saturation: number;
    morphStrength: number;
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
export declare const DEFAULT_GLASS_SETTINGS: GlassSettings;
export interface GlassSettingsProviderProps {
    children: React.ReactNode;
    /** Override default optical parameters for your app */
    defaultSettings?: Partial<GlassSettings>;
    /** Persist siteTheme changes to localStorage (default: true) */
    persistTheme?: boolean;
}
export declare const GlassSettingsProvider: React.FC<GlassSettingsProviderProps>;
export declare function useGlassSettings(): GlassSettingsContextValue;

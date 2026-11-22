import React from 'react';
import { GlassRenderMode } from '../core/GlassSettingsContext';
import { GlassVariantId } from '../core/webglGlassRenderer';
export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Corner radius in pixels (use 999 for full pill/circle) */
    radius?: number;
    /** Override global refraction multiplier (0 - 1.8) */
    refraction?: number;
    /** Override global frost blur amount (0 - 6) */
    blur?: number;
    /** Override global bezel thickness (px) */
    bezelWidth?: number;
    /** Override global chromatic aberration (0 - 0.45) */
    aberration?: number;
    /** Override global specular intensity (0 - 1.5) */
    specular?: number;
    /** Material tone */
    variant?: GlassVariantId;
    /** Enable interactive pointer-following specular glint */
    interactive?: boolean;
    /** Override rendering tier for this surface */
    renderMode?: GlassRenderMode;
    /** Force SVG DOM displacement mode when supported */
    forceSvg?: boolean;
}
export declare const LiquidGlass: React.NamedExoticComponent<LiquidGlassProps>;

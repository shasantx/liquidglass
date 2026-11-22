import React from 'react';
import { DropletDescriptor, GlassVariantId, WallpaperScene } from '../core/webglGlassRenderer';
import { GlassRenderMode } from '../core/GlassSettingsContext';
export interface RegisteredGlassElement {
    id: string;
    el: HTMLElement;
    radius: number;
    variant: GlassVariantId;
    bezelWidth?: number;
    refraction?: number;
    blur?: number;
    aberration?: number;
    specular?: number;
    pointerX: number;
    pointerY: number;
    pointerAlpha: number;
}
export interface GlassStageContextValue {
    gpuActive: boolean;
    stageRenderMode: GlassRenderMode;
    register: (entry: RegisteredGlassElement) => void;
    unregister: (id: string) => void;
    updateMeta: (id: string, patch: Partial<RegisteredGlassElement>) => void;
    requestBurst: (durationMs?: number) => void;
}
export declare function useGlassStage(): GlassStageContextValue | null;
export interface GlassStageHandle {
    requestFrame: () => void;
    requestBurst: (durationMs?: number) => void;
    setDroplet: (droplet: DropletDescriptor | null) => void;
}
export interface GlassStageProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Built-in calibrated wallpaper scene (default: 'tahoe') */
    scene?: WallpaperScene;
    /** Custom background image URL (https://, /local.webp, data:, or blob:) */
    backgroundImage?: string;
    /** Explicit optical contrast tone; defaults to 'light' when scene='light', else 'dark' */
    tone?: 'dark' | 'light';
    /** Override rendering tier for this stage */
    renderMode?: GlassRenderMode;
    children: React.ReactNode;
    onStagePointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onStagePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onStagePointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onStagePointerLeave?: (e: React.PointerEvent<HTMLDivElement>) => void;
    underlay?: React.ReactNode;
}
export declare const GlassStage: React.ForwardRefExoticComponent<GlassStageProps & React.RefAttributes<GlassStageHandle>>;

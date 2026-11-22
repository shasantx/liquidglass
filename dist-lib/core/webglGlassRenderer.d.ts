/**
 * GlassKit Production Full-HD WebGL2 Optical Glass Engine (iOS 26 / macOS Tahoe Calibrated)
 *
 * Features:
 * - ONE shared offscreen WebGL2 context for the entire app (zero context limits, 0% idle GPU).
 * - Supports both built-in procedural/photo scenes AND arbitrary custom background image URLs
 *   (remote URLs, local public paths, data URLs, or uploaded File blob URLs).
 * - Pre-baked 2-pass separable 17-tap Gaussian frost texture for creamy, artifact-free diffusion.
 * - Per-element optical overrides (`uOptics[12]`) for refraction, frost blur, chromatic dispersion,
 *   and specular intensity alongside global stage defaults.
 */
export type WallpaperScene = 'tahoe' | 'sunset' | 'light' | 'dark' | 'prism';
export type GlassVariantId = 'clear' | 'tinted' | 'dark' | 'prominent';
export interface GlassRectDescriptor {
    cx: number;
    cy: number;
    hw: number;
    hh: number;
    radius: number;
    opacity: number;
    variant: GlassVariantId;
    bezelPx: number;
    pointerX: number;
    pointerY: number;
    pointerAlpha: number;
    /** Optional per-element optical overrides (falls back to stage settings when omitted) */
    refraction?: number;
    blur?: number;
    aberration?: number;
    specular?: number;
}
export interface DropletDescriptor {
    x: number;
    y: number;
    radius: number;
    morph: number;
    opacity: number;
}
export interface StageRenderOptions {
    scene: WallpaperScene;
    /** Arbitrary custom image URL (https://, /path, data:, blob:) rendered instead of scene */
    backgroundImage?: string;
    isLightStage: boolean;
    stageWidth: number;
    stageHeight: number;
    rects: GlassRectDescriptor[];
    droplet?: DropletDescriptor | null;
    refraction: number;
    blur: number;
    aberration: number;
    specular: number;
    saturation: number;
}
export declare const DEFAULT_SCENE_IMAGE_URLS: Partial<Record<WallpaperScene, string>>;
export declare const SCENE_CSS_FALLBACKS: Record<WallpaperScene, string>;
declare class SharedWebGLGlassEngine {
    private canvas;
    private gl;
    private wallProg;
    private coverProg;
    private blurProg;
    private glassProg;
    private quadBuf;
    private fbo;
    private wallpaperCache;
    private loadedImages;
    private loadingImages;
    private failedImages;
    private assetListeners;
    private readonly MAX_WALLPAPERS;
    private readonly MAX_LOADED_IMAGES;
    private ready;
    private initialized;
    private wallUniforms;
    private coverUniforms;
    private blurUniforms;
    private glassUniforms;
    private rectArr;
    private paramArr;
    private hoverArr;
    private opticsArr;
    private posLocCache;
    private ctx2dCache;
    isAvailable(): boolean;
    onAssetLoaded(cb: () => void): () => void;
    private notifyAssetLoaded;
    private uploadImageTexture;
    private ensureImageLoaded;
    evictImage(backgroundImageUrl: string): void;
    private init;
    private bindQuad;
    private getOrBakeWallpaper;
    renderToCanvas(target: HTMLCanvasElement, opts: StageRenderOptions): boolean;
}
export declare const sharedGlassEngine: SharedWebGLGlassEngine;
export {};

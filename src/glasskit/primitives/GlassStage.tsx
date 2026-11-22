import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_SCENE_IMAGE_URLS,
  DropletDescriptor,
  GlassRectDescriptor,
  GlassVariantId,
  SCENE_CSS_FALLBACKS,
  sharedGlassEngine,
  WallpaperScene,
} from '../core/webglGlassRenderer';
import { GlassRenderMode, useGlassSettings } from '../core/GlassSettingsContext';

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

const GlassStageContext = createContext<GlassStageContextValue | null>(null);

export function useGlassStage() {
  return useContext(GlassStageContext);
}

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

export const GlassStage = React.forwardRef<GlassStageHandle, GlassStageProps>(
  (
    {
      scene = 'tahoe',
      backgroundImage,
      tone,
      renderMode,
      className = '',
      style,
      children,
      onStagePointerMove,
      onStagePointerDown,
      onStagePointerUp,
      onStagePointerLeave,
      onPointerMove,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onClick,
      underlay,
      ...rest
    },
    ref
  ) => {
    const { settings } = useGlassSettings();
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const entriesRef = useRef<Map<string, RegisteredGlassElement>>(new Map());
    const dropletRef = useRef<DropletDescriptor | null>(null);
    const settingsRef = useRef(settings);
    settingsRef.current = settings;
    const sceneRef = useRef(scene);
    sceneRef.current = scene;
    const bgImageRef = useRef(backgroundImage);
    bgImageRef.current = backgroundImage;

    const resolvedTone: 'dark' | 'light' =
      tone ?? (backgroundImage ? 'dark' : scene === 'light' ? 'light' : 'dark');
    const isLightStageRef = useRef(resolvedTone === 'light');
    isLightStageRef.current = resolvedTone === 'light';

    const effectiveRenderMode: GlassRenderMode = renderMode ?? settings.renderMode;
    const [engineAvailable] = useState(() => sharedGlassEngine.isAvailable());
    const gpuActive =
      engineAvailable && (effectiveRenderMode === 'auto' || effectiveRenderMode === 'webgl');

    const inViewRef = useRef(false);
    const rafRef = useRef<number>(0);
    const burstUntilRef = useRef<number>(0);

    const drawOnce = useCallback(() => {
      const stageEl = stageRef.current;
      const canvas = canvasRef.current;
      if (!stageEl || !canvas || !gpuActive || !inViewRef.current || document.hidden) {
        return;
      }

      const stageRect = stageEl.getBoundingClientRect();
      if (stageRect.width < 10 || stageRect.height < 10) return;

      const s = settingsRef.current;
      const rects: GlassRectDescriptor[] = [];

      entriesRef.current.forEach((entry) => {
        if (!entry.el.isConnected) return;
        const r = entry.el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;

        const computed = window.getComputedStyle(entry.el);
        const opacity = parseFloat(computed.opacity);
        if (Number.isNaN(opacity) || opacity <= 0.01) return;

        const parentOpacity = entry.el.parentElement
          ? parseFloat(window.getComputedStyle(entry.el.parentElement).opacity)
          : 1;
        const finalOpacity = opacity * (Number.isNaN(parentOpacity) ? 1 : parentOpacity);
        if (finalOpacity <= 0.01) return;

        const cx = r.left - stageRect.left + r.width * 0.5;
        const cy = r.top - stageRect.top + r.height * 0.5;
        const hw = r.width * 0.5;
        const hh = r.height * 0.5;
        const radius = Math.min(entry.radius, Math.min(hw, hh));

        rects.push({
          cx,
          cy,
          hw,
          hh,
          radius,
          opacity: finalOpacity,
          variant: entry.variant,
          bezelPx: entry.bezelWidth ?? s.bezelWidth,
          refraction: entry.refraction,
          blur: entry.blur,
          aberration: entry.aberration,
          specular: entry.specular,
          pointerX: entry.pointerX,
          pointerY: entry.pointerY,
          pointerAlpha: entry.pointerAlpha,
        });
      });

      sharedGlassEngine.renderToCanvas(canvas, {
        scene: sceneRef.current,
        backgroundImage: bgImageRef.current,
        isLightStage: isLightStageRef.current,
        stageWidth: stageRect.width,
        stageHeight: stageRect.height,
        rects,
        droplet: dropletRef.current,
        refraction: s.refraction,
        blur: s.blur,
        aberration: s.aberration,
        specular: s.specular,
        saturation: s.saturation,
      });
    }, [gpuActive]);

    const tick = useCallback(
      (now: number) => {
        rafRef.current = 0;
        drawOnce();
        if (now < burstUntilRef.current && inViewRef.current && !document.hidden) {
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      [drawOnce]
    );

    const requestFrame = useCallback(() => {
      if (!inViewRef.current || document.hidden || !gpuActive) return;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }, [gpuActive, tick]);

    const requestBurst = useCallback(
      (durationMs = 460) => {
        if (!gpuActive) return;
        burstUntilRef.current = Math.max(burstUntilRef.current, performance.now() + durationMs);
        if (inViewRef.current && !document.hidden && !rafRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      [gpuActive, tick]
    );

    useImperativeHandle(
      ref,
      () => ({
        requestFrame,
        requestBurst,
        setDroplet: (d) => {
          dropletRef.current = d;
        },
      }),
      [requestFrame, requestBurst]
    );

    useEffect(() => {
      const stageEl = stageRef.current;
      if (!stageEl || !gpuActive) return;

      const io =
        typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(
              (entries) => {
                const visible = entries[0]?.isIntersecting ?? false;
                inViewRef.current = visible;
                if (visible) {
                  requestBurst(820);
                } else if (rafRef.current) {
                  cancelAnimationFrame(rafRef.current);
                  rafRef.current = 0;
                }
              },
              { rootMargin: '120px 0px' }
            )
          : null;

      if (io) {
        io.observe(stageEl);
      } else {
        inViewRef.current = true;
        requestFrame();
      }

      const ro = new ResizeObserver(() => requestBurst(120));
      ro.observe(stageEl);

      const onVis = () => {
        if (!document.hidden && inViewRef.current) {
          requestFrame();
        } else if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      };
      document.addEventListener('visibilitychange', onVis);
      const unsubAsset = sharedGlassEngine.onAssetLoaded(() => requestFrame());

      const onTransitionStart = () => requestBurst(540);
      const onOrientation = () => requestBurst(420);
      stageEl.addEventListener('transitionstart', onTransitionStart);
      window.addEventListener('orientationchange', onOrientation);

      return () => {
        io?.disconnect();
        ro.disconnect();
        unsubAsset();
        stageEl.removeEventListener('transitionstart', onTransitionStart);
        window.removeEventListener('orientationchange', onOrientation);
        document.removeEventListener('visibilitychange', onVis);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      };
    }, [gpuActive, requestBurst, requestFrame]);

    useEffect(() => {
      requestFrame();
    }, [
      scene,
      backgroundImage,
      resolvedTone,
      gpuActive,
      settings.refraction,
      settings.blur,
      settings.bezelWidth,
      settings.specular,
      settings.aberration,
      settings.saturation,
      requestFrame,
    ]);

    const register = useCallback(
      (entry: RegisteredGlassElement) => {
        entriesRef.current.set(entry.id, entry);
        requestBurst(120);
      },
      [requestBurst]
    );

    const unregister = useCallback(
      (id: string) => {
        entriesRef.current.delete(id);
        requestFrame();
      },
      [requestFrame]
    );

    const updateMeta = useCallback(
      (id: string, patch: Partial<RegisteredGlassElement>) => {
        const curr = entriesRef.current.get(id);
        if (curr) {
          Object.assign(curr, patch);
          requestFrame();
        }
      },
      [requestFrame]
    );

    const ctxVal = useMemo<GlassStageContextValue>(
      () => ({
        gpuActive,
        stageRenderMode: effectiveRenderMode,
        register,
        unregister,
        updateMeta,
        requestBurst,
      }),
      [gpuActive, effectiveRenderMode, register, unregister, updateMeta, requestBurst]
    );

    const fallbackBgStyle = useMemo<React.CSSProperties | undefined>(() => {
      if (gpuActive) return undefined;
      const imgUrl = backgroundImage ?? DEFAULT_SCENE_IMAGE_URLS[scene];
      return {
        backgroundImage: imgUrl
          ? `url("${imgUrl}"), ${SCENE_CSS_FALLBACKS[scene]}`
          : SCENE_CSS_FALLBACKS[scene],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }, [gpuActive, backgroundImage, scene]);

    const toneClass = className.includes('stage-tone-')
      ? ''
      : resolvedTone === 'light'
      ? 'stage-tone-light'
      : 'stage-tone-dark';

    return (
      <GlassStageContext.Provider value={ctxVal}>
        <div
          ref={stageRef}
          className={`glass-stage-root ${toneClass} ${className}`.trim()}
          style={style}
          onPointerMove={(e) => {
            onStagePointerMove?.(e);
            onPointerMove?.(e);
          }}
          onPointerDown={(e) => {
            requestBurst(480);
            onStagePointerDown?.(e);
            onPointerDown?.(e);
          }}
          onPointerUp={(e) => {
            requestBurst(480);
            onStagePointerUp?.(e);
            onPointerUp?.(e);
          }}
          onPointerLeave={(e) => {
            requestBurst(320);
            onStagePointerLeave?.(e);
            onPointerLeave?.(e);
          }}
          onClick={(e) => {
            requestBurst(540);
            onClick?.(e);
          }}
          {...rest}
        >
          {gpuActive ? (
            <canvas
              ref={canvasRef}
              className="glass-stage-canvas"
              aria-hidden="true"
            />
          ) : (
            <div
              className="glass-stage-fallback-bg"
              style={fallbackBgStyle}
              aria-hidden="true"
            />
          )}
          {underlay && (
            <div className="glass-stage-underlay" aria-hidden="true">
              {underlay}
            </div>
          )}
          <div className="glass-stage-foreground">{children}</div>
        </div>
      </GlassStageContext.Provider>
    );
  }
);

GlassStage.displayName = 'GlassStage';

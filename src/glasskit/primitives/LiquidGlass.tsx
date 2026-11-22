import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { GlassRenderMode, useGlassSettings } from '../core/GlassSettingsContext';
import { useGlassStage } from './GlassStage';
import { GlassVariantId } from '../core/webglGlassRenderer';
import { generateLiquidGlassMaps, GeneratedGlassMaps } from '../core/liquidGlassEngine';

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

const LiquidGlassInner: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  style,
  radius = 24,
  refraction,
  blur,
  bezelWidth,
  aberration,
  specular,
  variant = 'clear',
  interactive = true,
  renderMode,
  forceSvg = false,
  onPointerMove,
  onPointerLeave,
  ...rest
}) => {
  const rawId = useId();
  const safeFilterId = useMemo(
    () => `lg-svg-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [rawId]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const stage = useGlassStage();
  const { settings, svgSupported } = useGlassSettings();

  const resolvedMode: GlassRenderMode = forceSvg
    ? 'svg'
    : renderMode ?? stage?.stageRenderMode ?? settings.renderMode;

  const useGpuStage = Boolean(
    stage && stage.gpuActive && (resolvedMode === 'auto' || resolvedMode === 'webgl')
  );
  const useSvgDom =
    !useGpuStage &&
    svgSupported &&
    (resolvedMode === 'svg' || (resolvedMode === 'auto' && settings.useSvgRefraction));

  const [svgMaps, setSvgMaps] = useState<GeneratedGlassMaps | null>(null);

  const effRefraction = refraction ?? settings.refraction;
  const effBlur = blur ?? settings.blur;
  const effBezel = bezelWidth ?? settings.bezelWidth;
  const effAberration = aberration ?? settings.aberration;
  const effSpecular = specular ?? settings.specular;

  // Tier 1: Register live DOM geometry + per-element optics with parent WebGL2 GlassStage
  useEffect(() => {
    const el = containerRef.current;
    if (!useGpuStage || !stage || !el) return;

    stage.register({
      id: rawId,
      el,
      radius,
      variant,
      bezelWidth,
      refraction,
      blur,
      aberration,
      specular,
      pointerX: 0.5,
      pointerY: 0.3,
      pointerAlpha: 0,
    });

    const ro = new ResizeObserver(() => {
      stage.requestBurst(120);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      stage.unregister(rawId);
    };
  }, [rawId, stage, useGpuStage]);

  // Keep registered metadata synced when props change
  useEffect(() => {
    if (!useGpuStage || !stage) return;
    stage.updateMeta(rawId, {
      radius,
      variant,
      bezelWidth,
      refraction,
      blur,
      aberration,
      specular,
    });
  }, [rawId, stage, useGpuStage, radius, variant, bezelWidth, refraction, blur, aberration, specular]);

  // Tier 2: Quantized SVG Snell displacement map for standalone DOM surfaces in Chromium
  useEffect(() => {
    const el = containerRef.current;
    if (!useSvgDom || !el) {
      setSvgMaps(null);
      return;
    }

    const rebuild = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 12 || rect.height < 12) return;
      const maps = generateLiquidGlassMaps({
        width: rect.width,
        height: rect.height,
        radius: Math.min(radius, Math.min(rect.width, rect.height) / 2),
        bezelWidth: effBezel,
        refractionStrength: Math.max(0.25, effRefraction * 1.65),
      });
      setSvgMaps(maps);
    };

    rebuild();
    const ro = new ResizeObserver(rebuild);
    ro.observe(el);
    return () => ro.disconnect();
  }, [useSvgDom, radius, effBezel, effRefraction]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (interactive && e.pointerType === 'mouse' && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
        const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
        if (useGpuStage && stage) {
          stage.updateMeta(rawId, { pointerX: nx, pointerY: ny, pointerAlpha: 1 });
        } else {
          containerRef.current.style.setProperty('--lg-mx', `${(nx * 100).toFixed(1)}%`);
          containerRef.current.style.setProperty('--lg-my', `${(ny * 100).toFixed(1)}%`);
          containerRef.current.style.setProperty('--lg-pointer-alpha', '1');
        }
      }
      onPointerMove?.(e);
    },
    [rawId, interactive, onPointerMove, stage, useGpuStage]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (interactive) {
        if (useGpuStage && stage) {
          stage.updateMeta(rawId, { pointerAlpha: 0 });
        } else if (containerRef.current) {
          containerRef.current.style.setProperty('--lg-pointer-alpha', '0');
        }
      }
      onPointerLeave?.(e);
    },
    [rawId, interactive, onPointerLeave, stage, useGpuStage]
  );

  // Tier 1: GPU-accelerated WebGL2 stage surface
  if (useGpuStage) {
    return (
      <div
        ref={containerRef}
        className={`lg-surface-gpu lg-variant-${variant} ${className}`.trim()}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          borderRadius: `${radius}px`,
          ...style,
        }}
        {...rest}
      >
        <div className="lg-content">{children}</div>
      </div>
    );
  }

  // Tier 2 (SVG DOM Snell displacement in Chromium) & Tier 3 (Pure CSS fallback)
  const blurPx = Math.max(2, effBlur * 3.8);
  const satPct = Math.round(settings.saturation * 145);
  const svgActive = Boolean(useSvgDom && svgMaps && svgMaps.displacementUrl);
  const backdropValue = svgActive
    ? `url(#${safeFilterId}) saturate(${satPct}%) brightness(1.04)`
    : `blur(${Math.max(10, blurPx).toFixed(1)}px) saturate(${satPct}%)`;

  return (
    <div
      ref={containerRef}
      className={`lg-surface lg-variant-${variant} ${svgActive ? 'lg-tier-svg' : 'lg-tier-css'} ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          borderRadius: `${radius}px`,
          '--lg-specular': effSpecular,
          '--lg-aberration': effAberration,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {svgActive && svgMaps && (
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          style={{ position: 'absolute', pointerEvents: 'none' }}
        >
          <defs>
            <filter id={safeFilterId} colorInterpolationFilters="sRGB">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation={Math.max(0.4, effBlur * 0.65).toFixed(2)}
                result="blur"
              />
              <feImage
                href={svgMaps.displacementUrl}
                x="0"
                y="0"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="dispMap"
              />
              <feDisplacementMap
                in="blur"
                in2="dispMap"
                scale={svgMaps.maxScale.toFixed(1)}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
      <div
        className="lg-backdrop"
        aria-hidden="true"
        style={{
          backdropFilter: backdropValue,
          WebkitBackdropFilter: `blur(${Math.max(10, blurPx).toFixed(1)}px) saturate(${satPct}%)`,
        }}
      />
      {interactive && <div className="lg-pointer-sheen" aria-hidden="true" />}
      <div className="lg-rim-highlight" aria-hidden="true" />
      <div className="lg-content">{children}</div>
    </div>
  );
};

export const LiquidGlass = React.memo(LiquidGlassInner);

import React, { useCallback, useEffect, useId, useRef } from 'react';
import { useGlassSettings } from '../context/GlassSettingsContext';
import { useGlassStage } from './GlassStage';
import { GlassVariantId } from '../lib/webglGlassRenderer';

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner radius in pixels (use 999 for full pill/circle) */
  radius?: number;
  /** Override global refraction multiplier */
  refraction?: number;
  /** Override global blur amount */
  blur?: number;
  /** Override global bezel thickness (px) */
  bezelWidth?: number;
  /** Override global chromatic aberration */
  aberration?: number;
  /** Override global specular intensity */
  specular?: number;
  /** Material tone */
  variant?: GlassVariantId;
  /** Enable interactive pointer-following specular glint */
  interactive?: boolean;
  /** Legacy prop kept for API compatibility */
  forceSvg?: boolean;
}

const LiquidGlassInner: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  style,
  radius = 24,
  bezelWidth,
  specular,
  variant = 'clear',
  interactive = true,
  onPointerMove,
  onPointerLeave,
  ...rest
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const stage = useGlassStage();
  const { settings } = useGlassSettings();
  const useGpuStage = Boolean(stage && stage.gpuActive);

  // Register live DOM geometry with parent Full-HD WebGL2 GlassStage
  useEffect(() => {
    const el = containerRef.current;
    if (!useGpuStage || !stage || !el) return;

    stage.register({
      id,
      el,
      radius,
      variant,
      bezelWidth,
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
      stage.unregister(id);
    };
  }, [id, stage, useGpuStage]);

  // Keep registered metadata synced when props change
  useEffect(() => {
    if (!useGpuStage || !stage) return;
    stage.updateMeta(id, { radius, variant, bezelWidth });
  }, [id, stage, useGpuStage, radius, variant, bezelWidth]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (interactive && e.pointerType === 'mouse' && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
        const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
        if (useGpuStage && stage) {
          stage.updateMeta(id, { pointerX: nx, pointerY: ny, pointerAlpha: 1 });
        } else {
          containerRef.current.style.setProperty('--lg-mx', `${(nx * 100).toFixed(1)}%`);
          containerRef.current.style.setProperty('--lg-my', `${(ny * 100).toFixed(1)}%`);
          containerRef.current.style.setProperty('--lg-pointer-alpha', '1');
        }
      }
      onPointerMove?.(e);
    },
    [id, interactive, onPointerMove, stage, useGpuStage]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (interactive) {
        if (useGpuStage && stage) {
          stage.updateMeta(id, { pointerAlpha: 0 });
        } else if (containerRef.current) {
          containerRef.current.style.setProperty('--lg-pointer-alpha', '0');
        }
      }
      onPointerLeave?.(e);
    },
    [id, interactive, onPointerLeave, stage, useGpuStage]
  );

  const effSpecular = specular ?? settings.specular;

  // When hosted inside a Full-HD WebGL2 GlassStage, the GPU shader renders the entire
  // refracted glass surface, physical RGB dispersion, creamy frost, Fresnel rim, and shadow
  // pixel-accurately directly behind this element.
  if (useGpuStage) {
    return (
      <div
        ref={containerRef}
        className={`lg-surface-gpu lg-variant-${variant} ${className}`}
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

  // Graceful pure-CSS fallback when WebGL2 is unavailable or used outside a GlassStage
  return (
    <div
      ref={containerRef}
      className={`lg-surface lg-variant-${variant} ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          borderRadius: `${radius}px`,
          '--lg-specular': effSpecular,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div
        className="lg-backdrop"
        aria-hidden="true"
        style={{
          backdropFilter: `blur(${Math.max(12, settings.blur * 4)}px) saturate(${Math.round(
            settings.saturation * 135
          )}%)`,
          WebkitBackdropFilter: `blur(${Math.max(12, settings.blur * 4)}px) saturate(${Math.round(
            settings.saturation * 135
          )}%)`,
        }}
      />
      {interactive && <div className="lg-pointer-sheen" aria-hidden="true" />}
      <div className="lg-rim-highlight" aria-hidden="true" />
      <div className="lg-content">{children}</div>
    </div>
  );
};

export const LiquidGlass = React.memo(LiquidGlassInner);

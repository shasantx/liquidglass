import React, { useRef, useState } from 'react';

export interface GlassSliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: React.ReactNode;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  accent?: 'blue' | 'amber';
  ariaLabel?: string;
  className?: string;
}

export const GlassSlider: React.FC<GlassSliderProps> = ({
  value: controlledValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  showValue = true,
  formatValue = (v) => `${v}%`,
  accent = 'blue',
  ariaLabel = 'Slider',
  className = '',
}) => {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const val = controlledValue !== undefined ? controlledValue : uncontrolled;
  const pct = Math.max(0, Math.min(100, ((val - min) / Math.max(1e-6, max - min)) * 100));

  const commitValue = (nextRaw: number) => {
    const stepped = Math.round(nextRaw / step) * step;
    const clamped = Math.max(min, Math.min(max, Number(stepped.toFixed(4))));
    if (controlledValue === undefined) setUncontrolled(clamped);
    onChange?.(clamped);
  };

  const updateFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    commitValue(min + ratio * (max - min));
  };

  return (
    <div className={`ios-slider-block ${className}`.trim()}>
      {(label || showValue) && (
        <div className="ios-slider-header">
          <span className="ios-slider-label">{label}</span>
          {showValue && <span className="ios-slider-value">{formatValue(val)}</span>}
        </div>
      )}

      <div
        ref={trackRef}
        className={`ios-liquid-slider ${dragging ? 'is-dragging' : ''}`}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          updateFromClientX(e.clientX);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(e) => {
          const delta = Math.max(step, (max - min) * 0.05);
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            commitValue(val + delta);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            commitValue(val - delta);
          }
        }}
      >
        <div className="ios-slider-track">
          <div
            className={`ios-slider-fill ${accent === 'amber' ? 'ios-slider-fill-amber' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="ios-slider-knob-wrap" style={{ left: `${pct}%` }}>
          <div className="ios-slider-knob" />
        </div>
      </div>
    </div>
  );
};

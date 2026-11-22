import React, { useRef, useState } from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';

export interface GlassConnectivityOrb {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  tone?: 'blue' | 'green' | 'orange';
  onToggle: () => void;
}

export interface GlassVerticalSliderProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  icon?: React.ReactNode;
  ariaLabel: string;
  min?: number;
  max?: number;
}

export const GlassVerticalSlider: React.FC<GlassVerticalSliderProps> = ({
  value: controlledValue,
  defaultValue = 65,
  onChange,
  icon,
  ariaLabel,
  min = 4,
  max = 100,
}) => {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const val = controlledValue !== undefined ? controlledValue : uncontrolled;
  const setVal = (next: number) => {
    const clamped = Math.max(min, Math.min(max, Math.round(next)));
    if (controlledValue === undefined) setUncontrolled(clamped);
    onChange?.(clamped);
  };

  const updateFromClientY = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((rect.bottom - clientY) / Math.max(1, rect.height)) * 100;
    setVal(pct);
  };

  return (
    <LiquidGlass radius={26} bezelWidth={18} className="cc-vslider-shell">
      <div
        ref={trackRef}
        className="cc-vslider"
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={val}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          draggingRef.current = true;
          updateFromClientY(e.clientY);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) updateFromClientY(e.clientY);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            setVal(val + 5);
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            setVal(val - 5);
          }
        }}
      >
        <div className="cc-vslider-fill" style={{ height: `${val}%` }} />
        {icon && <div className="cc-vslider-icon">{icon}</div>}
      </div>
    </LiquidGlass>
  );
};

export interface GlassControlCenterProps {
  orbs: GlassConnectivityOrb[];
  sliders: GlassVerticalSliderProps[];
  focus?: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    active: boolean;
    onToggle: () => void;
  };
  className?: string;
}

export const GlassControlCenter: React.FC<GlassControlCenterProps> = ({
  orbs,
  sliders,
  focus,
  className = '',
}) => (
  <div className={`cc-grid ${className}`.trim()}>
    <LiquidGlass radius={30} bezelWidth={22} className="cc-connectivity-card">
      <div className="cc-connectivity-grid">
        {orbs.map((orb) => (
          <button
            key={orb.id}
            type="button"
            className={`cc-orb ${orb.active ? `is-${orb.tone ?? 'blue'}` : ''}`.trim()}
            onClick={orb.onToggle}
            aria-label={orb.label}
            aria-pressed={orb.active}
          >
            {orb.icon}
          </button>
        ))}
      </div>
    </LiquidGlass>

    <div className="cc-sliders-pair">
      {sliders.map((slider) => (
        <GlassVerticalSlider key={slider.ariaLabel} {...slider} />
      ))}
    </div>

    {focus && (
      <LiquidGlass
        radius={999}
        bezelWidth={18}
        variant={focus.active ? 'tinted' : 'clear'}
        className="cc-focus-pill-wrap"
      >
        <button
          type="button"
          className={`cc-focus-pill ${focus.active ? 'is-on' : ''}`.trim()}
          onClick={focus.onToggle}
          aria-pressed={focus.active}
        >
          <span className="cc-focus-icon">{focus.icon}</span>
          <span className="cc-focus-text">
            <strong>{focus.title}</strong>
            <small>{focus.subtitle}</small>
          </span>
        </button>
      </LiquidGlass>
    )}
  </div>
);

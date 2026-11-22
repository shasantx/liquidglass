import React, { useRef, useState } from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';
import { GlassVariantId } from '../core/webglGlassRenderer';

export interface GlassSegmentOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface GlassSegmentedControlProps {
  options: GlassSegmentOption[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number, option: GlassSegmentOption) => void;
  compact?: boolean;
  iconOnly?: boolean;
  variant?: GlassVariantId;
  ariaLabel?: string;
  className?: string;
}

export const GlassSegmentedControl: React.FC<GlassSegmentedControlProps> = ({
  options,
  value: controlledValue,
  defaultValue = 0,
  onChange,
  compact = false,
  iconOnly = false,
  variant = 'clear',
  ariaLabel = 'Segmented control (drag or tap)',
  className = '',
}) => {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = controlledValue !== undefined ? controlledValue : uncontrolled;

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [stretch, setStretch] = useState(0);
  const [gliding, setGliding] = useState(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(false);
  const glideTimerRef = useRef<number | null>(null);

  const count = Math.max(1, options.length);

  const selectIndex = (idx: number) => {
    if (controlledValue === undefined) setUncontrolled(idx);
    if (options[idx]) onChange?.(idx, options[idx]);
  };

  const calcProg = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return selected;
    const rect = el.getBoundingClientRect();
    const pad = 5;
    const slotW = Math.max(1, (rect.width - pad * 2) / count);
    return Math.max(0, Math.min(count - 1, (clientX - rect.left - pad - slotW * 0.5) / slotW));
  };

  const triggerGlide = () => {
    setGliding(true);
    if (glideTimerRef.current !== null) window.clearTimeout(glideTimerRef.current);
    glideTimerRef.current = window.setTimeout(() => setGliding(false), 360);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    movedRef.current = false;
    lastXRef.current = e.clientX;
    setDragProgress(calcProg(e.clientX));
    setStretch(0);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - lastXRef.current;
    if (Math.abs(dx) > 2) movedRef.current = true;
    lastXRef.current = e.clientX;
    setDragProgress(calcProg(e.clientX));
    setStretch(Math.min(0.22, Math.abs(dx) * 0.011));
  };

  const onUp = (clientX: number) => {
    if (!dragging) return;
    const snapped = Math.round(calcProg(clientX));
    if (snapped !== selected) {
      triggerGlide();
      selectIndex(snapped);
    }
    setDragging(false);
    setDragProgress(null);
    setStretch(0);
  };

  const visualProg = dragProgress !== null ? dragProgress : selected;
  const highlighted = Math.round(visualProg);

  return (
    <LiquidGlass
      radius={999}
      bezelWidth={compact ? 16 : 18}
      variant={variant}
      className={`ios-segmented-shell ${compact ? 'ios-segmented-compact' : ''} ${className}`.trim()}
    >
      <div
        ref={trackRef}
        className={`ios-segmented-track ${dragging ? 'is-swiping' : ''}`}
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        role="tablist"
        aria-label={ariaLabel}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={(e) => onUp(e.clientX)}
        onPointerCancel={(e) => onUp(e.clientX)}
      >
        <div
          className={`ios-segmented-thumb-wrap ${dragging ? 'is-dragging-pill' : ''} ${
            gliding ? 'is-gliding-pill' : ''
          }`}
          style={{
            width: `calc((100% - 10px) / ${count})`,
            transform: `translate3d(${visualProg * 100}%, 0, 0)`,
          }}
          aria-hidden="true"
        >
          <div
            className="ios-segmented-thumb"
            style={
              dragging
                ? {
                    transform: `scale(${(1.08 + stretch).toFixed(3)}, ${(
                      1.16 -
                      stretch * 0.35
                    ).toFixed(3)})`,
                  }
                : undefined
            }
          />
        </div>

        {options.map((opt, idx) => (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected === idx}
            aria-label={iconOnly ? opt.label : undefined}
            className={`ios-segmented-btn ${iconOnly ? 'ios-segmented-icon-btn' : ''} ${
              highlighted === idx ? 'is-active' : ''
            }`.trim()}
            onClick={() => {
              if (movedRef.current) return;
              if (idx !== selected) {
                triggerGlide();
                selectIndex(idx);
              }
            }}
          >
            {iconOnly ? opt.icon : opt.label}
          </button>
        ))}
      </div>
    </LiquidGlass>
  );
};

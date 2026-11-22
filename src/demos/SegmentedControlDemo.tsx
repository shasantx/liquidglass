import React, { useRef, useState } from 'react';
import { Grid, List, Columns, Sparkles } from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';

const VIEWS = ['Years', 'Months', 'Days', 'All Photos'];
const LAYOUTS = [
  { id: 'grid', label: 'Grid', icon: Grid },
  { id: 'columns', label: 'Columns', icon: Columns },
  { id: 'list', label: 'List', icon: List },
  { id: 'smart', label: 'Curated', icon: Sparkles },
];

interface SwipeableSegmentProps {
  count: number;
  selected: number;
  onSelect: (idx: number) => void;
  ariaLabel: string;
  compact?: boolean;
  renderItem: (idx: number, isHighlighted: boolean, onClick: () => void) => React.ReactNode;
}

const SwipeableSegment: React.FC<SwipeableSegmentProps> = ({
  count,
  selected,
  onSelect,
  ariaLabel,
  compact = false,
  renderItem,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [stretch, setStretch] = useState(0);
  const [gliding, setGliding] = useState(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(false);
  const glideTimerRef = useRef<number | null>(null);

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
      onSelect(snapped);
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
      className={`ios-segmented-shell ${compact ? 'ios-segmented-compact' : ''}`}
    >
      <div
        ref={trackRef}
        className={`ios-segmented-track ${dragging ? 'is-swiping' : ''}`}
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

        {Array.from({ length: count }).map((_, idx) =>
          renderItem(idx, highlighted === idx, () => {
            if (movedRef.current) return;
            if (idx !== selected) {
              triggerGlide();
              onSelect(idx);
            }
          })
        )}
      </div>
    </LiquidGlass>
  );
};

export const SegmentedControlDemo: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState(1);
  const [selectedLayout, setSelectedLayout] = useState(0);

  return (
    <div className="demo-segmented-stack">
      <SwipeableSegment
        count={VIEWS.length}
        selected={selectedTime}
        onSelect={setSelectedTime}
        ariaLabel="Photo timeline scale (drag or tap)"
        renderItem={(idx, isHighlighted, onClick) => (
          <button
            key={VIEWS[idx]}
            type="button"
            role="tab"
            aria-selected={selectedTime === idx}
            className={`ios-segmented-btn ${isHighlighted ? 'is-active' : ''}`}
            onClick={onClick}
          >
            {VIEWS[idx]}
          </button>
        )}
      />

      <SwipeableSegment
        count={LAYOUTS.length}
        selected={selectedLayout}
        onSelect={setSelectedLayout}
        ariaLabel="View layout (drag or tap)"
        compact
        renderItem={(idx, isHighlighted, onClick) => {
          const item = LAYOUTS[idx];
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selectedLayout === idx}
              aria-label={item.label}
              className={`ios-segmented-btn ios-segmented-icon-btn ${
                isHighlighted ? 'is-active' : ''
              }`}
              onClick={onClick}
            >
              <Icon size={17} strokeWidth={isHighlighted ? 2.2 : 1.85} />
            </button>
          );
        }}
      />
    </div>
  );
};

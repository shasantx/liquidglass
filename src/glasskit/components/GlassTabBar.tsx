import React, { useRef, useState } from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';
import { GlassVariantId } from '../core/webglGlassRenderer';

export interface GlassTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface GlassTabBarProps {
  items: GlassTabItem[];
  /** Controlled active tab index */
  activeIndex?: number;
  /** Initial active tab index when uncontrolled */
  defaultActiveIndex?: number;
  onChange?: (index: number, item: GlassTabItem) => void;
  /** Show detached liquid search orb that expands into an inline glass input */
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  searchIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  variant?: GlassVariantId;
  ariaLabel?: string;
  className?: string;
}

const DefaultSearchSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const DefaultCloseSvg: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const GlassTabBar: React.FC<GlassTabBarProps> = ({
  items,
  activeIndex: controlledIndex,
  defaultActiveIndex = 0,
  onChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue: controlledQuery,
  onSearchChange,
  searchIcon,
  closeIcon,
  variant = 'clear',
  ariaLabel = 'Primary navigation (drag or tap)',
  className = '',
}) => {
  const [uncontrolledIdx, setUncontrolledIdx] = useState(defaultActiveIndex);
  const [searchOpen, setSearchOpen] = useState(false);
  const [uncontrolledQuery, setUncontrolledQuery] = useState('');

  const activeIndex = controlledIndex !== undefined ? controlledIndex : uncontrolledIdx;
  const query = controlledQuery !== undefined ? controlledQuery : uncontrolledQuery;

  const setActiveIndex = (idx: number) => {
    if (controlledIndex === undefined) setUncontrolledIdx(idx);
    if (items[idx]) onChange?.(idx, items[idx]);
  };

  const setQuery = (next: string) => {
    if (controlledQuery === undefined) setUncontrolledQuery(next);
    onSearchChange?.(next);
  };

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [stretch, setStretch] = useState(0);
  const [gliding, setGliding] = useState(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(false);
  const glideTimerRef = useRef<number | null>(null);

  const count = Math.max(1, items.length);

  const computeProgressFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return activeIndex;
    const rect = el.getBoundingClientRect();
    const pad = 6;
    const innerW = Math.max(1, rect.width - pad * 2);
    const slotW = innerW / count;
    const raw = (clientX - rect.left - pad - slotW * 0.5) / slotW;
    return Math.max(0, Math.min(count - 1, raw));
  };

  const triggerGlidePulse = () => {
    setGliding(true);
    if (glideTimerRef.current !== null) window.clearTimeout(glideTimerRef.current);
    glideTimerRef.current = window.setTimeout(() => setGliding(false), 380);
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    movedRef.current = false;
    lastXRef.current = e.clientX;
    setDragProgress(computeProgressFromClientX(e.clientX));
    setStretch(0);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - lastXRef.current;
    if (Math.abs(dx) > 2) movedRef.current = true;
    lastXRef.current = e.clientX;
    setDragProgress(computeProgressFromClientX(e.clientX));
    setStretch(Math.min(0.24, Math.abs(dx) * 0.012));
  };

  const finishDrag = (clientX: number) => {
    if (!dragging) return;
    const snapped = Math.round(computeProgressFromClientX(clientX));
    if (snapped !== activeIndex) {
      triggerGlidePulse();
      setActiveIndex(snapped);
    }
    setDragging(false);
    setDragProgress(null);
    setStretch(0);
  };

  const selectTab = (idx: number) => {
    if (movedRef.current) return;
    if (idx !== activeIndex) {
      triggerGlidePulse();
      setActiveIndex(idx);
    }
  };

  const visualProgress = dragProgress !== null ? dragProgress : activeIndex;
  const highlightedIndex = Math.round(visualProgress);

  return (
    <div className={`demo-tabbar-wrap ${className}`.trim()}>
      <div className={`ios-tabbar-row ${searchOpen ? 'is-searching' : ''}`}>
        {!searchOpen ? (
          <LiquidGlass radius={999} bezelWidth={20} variant={variant} className="ios-tabbar-capsule">
            <div
              ref={trackRef}
              className={`ios-tabbar-inner ${dragging ? 'is-swiping' : ''}`}
              style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
              role="tablist"
              aria-label={ariaLabel}
              onPointerDown={handleTrackPointerDown}
              onPointerMove={handleTrackPointerMove}
              onPointerUp={(e) => finishDrag(e.clientX)}
              onPointerCancel={(e) => finishDrag(e.clientX)}
            >
              <div
                className={`ios-tabbar-indicator ${dragging ? 'is-dragging-pill' : ''} ${
                  gliding ? 'is-gliding-pill' : ''
                }`}
                style={{
                  width: `calc((100% - 12px) / ${count})`,
                  transform: `translate3d(${visualProgress * 100}%, 0, 0)`,
                }}
                aria-hidden="true"
              >
                <div
                  className="ios-tabbar-indicator-pill"
                  style={
                    dragging
                      ? {
                          transform: `scale(${(1.09 + stretch).toFixed(3)}, ${(
                            1.14 -
                            stretch * 0.35
                          ).toFixed(3)})`,
                        }
                      : undefined
                  }
                />
              </div>

              {items.map((tab, i) => {
                const active = i === highlightedIndex;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={i === activeIndex}
                    className={`ios-tab-item ${active ? 'is-active' : ''}`}
                    onClick={() => selectTab(i)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </LiquidGlass>
        ) : (
          <LiquidGlass
            radius={999}
            bezelWidth={20}
            variant={variant}
            className="ios-search-expanded blur-morph-in"
          >
            <div className="ios-search-field">
              <span className="ios-search-icon" aria-hidden="true">
                {searchIcon ?? <DefaultSearchSvg />}
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
                aria-label={searchPlaceholder}
              />
              {query && (
                <button
                  type="button"
                  className="ios-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  {closeIcon ?? <DefaultCloseSvg size={14} />}
                </button>
              )}
            </div>
          </LiquidGlass>
        )}

        {searchable && (
          <LiquidGlass
            radius={999}
            bezelWidth={18}
            variant={variant}
            className="ios-tabbar-search-btn-wrap"
          >
            <button
              type="button"
              className="ios-tabbar-search-btn"
              onClick={() => {
                setSearchOpen((prev) => {
                  if (prev) setQuery('');
                  return !prev;
                });
              }}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
            >
              {searchOpen ? closeIcon ?? <DefaultCloseSvg /> : searchIcon ?? <DefaultSearchSvg />}
            </button>
          </LiquidGlass>
        )}
      </div>
    </div>
  );
};

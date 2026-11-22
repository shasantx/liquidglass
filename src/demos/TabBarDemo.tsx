import React, { useRef, useState } from 'react';
import { Home, Compass, Library, Radio, Search, X } from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'new', label: 'New', icon: Compass },
  { id: 'radio', label: 'Radio', icon: Radio },
  { id: 'library', label: 'Library', icon: Library },
];

export const TabBarDemo: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Swipeable & hold-to-drag liquid pill state
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null); // 0 .. TABS.length - 1
  const [stretch, setStretch] = useState(0); // horizontal liquid velocity stretch
  const [gliding, setGliding] = useState(false);
  const lastXRef = useRef<number>(0);
  const movedRef = useRef<boolean>(false);
  const glideTimerRef = useRef<number | null>(null);

  const count = TABS.length;

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
    const nextProg = computeProgressFromClientX(e.clientX);
    setDragProgress(nextProg);
    setStretch(0);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - lastXRef.current;
    if (Math.abs(dx) > 2) movedRef.current = true;
    lastXRef.current = e.clientX;

    const nextProg = computeProgressFromClientX(e.clientX);
    setDragProgress(nextProg);
    // Elastic velocity-driven liquid jelly stretch while dragging
    setStretch(Math.min(0.24, Math.abs(dx) * 0.012));
  };

  const finishDrag = (clientX: number) => {
    if (!dragging) return;
    const finalProg = computeProgressFromClientX(clientX);
    const snapped = Math.round(finalProg);
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
    <div className="demo-tabbar-wrap">
      <div className={`ios-tabbar-row ${searchOpen ? 'is-searching' : ''}`}>
        {!searchOpen ? (
          <LiquidGlass
            radius={999}
            bezelWidth={20}
            className="ios-tabbar-capsule"
          >
            <div
              ref={trackRef}
              className={`ios-tabbar-inner ${dragging ? 'is-swiping' : ''}`}
              role="tablist"
              aria-label="Primary navigation (drag or tap)"
              onPointerDown={handleTrackPointerDown}
              onPointerMove={handleTrackPointerMove}
              onPointerUp={(e) => finishDrag(e.clientX)}
              onPointerCancel={(e) => finishDrag(e.clientX)}
            >
              {/* Swipeable iOS 26 Liquid Glass active pill */}
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

              {TABS.map((tab, i) => {
                const Icon = tab.icon;
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
                    <Icon size={20} strokeWidth={active ? 2.25 : 1.85} />
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
            className="ios-search-expanded blur-morph-in"
          >
            <div className="ios-search-field">
              <Search size={18} className="ios-search-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Artists, songs, playlists..."
                autoFocus
                aria-label="Search library"
              />
              {query && (
                <button
                  type="button"
                  className="ios-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </LiquidGlass>
        )}

        <LiquidGlass
          radius={999}
          bezelWidth={18}
          className="ios-tabbar-search-btn-wrap"
        >
          <button
            type="button"
            className="ios-tabbar-search-btn"
            onClick={() => {
              setSearchOpen((prev) => !prev);
              if (searchOpen) setQuery('');
            }}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            {searchOpen ? <X size={20} strokeWidth={2.1} /> : <Search size={20} strokeWidth={2.1} />}
          </button>
        </LiquidGlass>
      </div>
    </div>
  );
};

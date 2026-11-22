import React, { useEffect, useState } from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';
import { useGlassStage } from '../primitives/GlassStage';
import { GlassVariantId } from '../core/webglGlassRenderer';

export interface GlassDockItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  running?: boolean;
  hideOnCompact?: boolean;
  hideOnMobile?: boolean;
  onClick?: () => void;
}

export interface GlassDockProps {
  items: GlassDockItem[];
  utilityItems?: GlassDockItem[];
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (id: string, item: GlassDockItem) => void;
  magnification?: number;
  variant?: GlassVariantId;
  className?: string;
}

export const GlassDock: React.FC<GlassDockProps> = ({
  items,
  utilityItems = [],
  activeId: controlledActiveId,
  defaultActiveId,
  onSelect,
  magnification = 1.36,
  variant = 'clear',
  className = '',
}) => {
  const stage = useGlassStage();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<string>(
    defaultActiveId ?? items[0]?.id ?? ''
  );
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  const activeId = controlledActiveId !== undefined ? controlledActiveId : uncontrolledActiveId;

  useEffect(() => {
    stage?.requestBurst(320);
  }, [hoveredIdx, bouncingId, stage]);

  const getScale = (idx: number) => {
    if (hoveredIdx === null) return 1;
    const dist = Math.abs(hoveredIdx - idx);
    const boost = magnification - 1;
    if (dist === 0) return 1 + boost;
    if (dist === 1) return 1 + boost * 0.5;
    if (dist === 2) return 1 + boost * 0.19;
    return 1;
  };

  const launchApp = (app: GlassDockItem) => {
    if (controlledActiveId === undefined) setUncontrolledActiveId(app.id);
    setBouncingId(app.id);
    window.setTimeout(() => setBouncingId((curr) => (curr === app.id ? null : curr)), 520);
    app.onClick?.();
    onSelect?.(app.id, app);
  };

  const renderDockButton = (app: GlassDockItem, globalIdx: number, isUtility = false) => {
    const scale = getScale(globalIdx);
    const isHovered = hoveredIdx === globalIdx;
    const isRunning = !isUtility && (app.running || activeId === app.id);
    const spreadPx = Math.round((scale - 1) * 18);

    return (
      <button
        key={app.id}
        type="button"
        className={`dock-item ${bouncingId === app.id ? 'is-bouncing' : ''} ${
          app.hideOnCompact ? 'dock-item-optional' : ''
        } ${app.hideOnMobile ? 'dock-item-mobile-hide' : ''}`.trim()}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setHoveredIdx(globalIdx);
        }}
        onClick={() => launchApp(app)}
        aria-label={app.name}
        style={{
          marginLeft: spreadPx ? `${spreadPx}px` : undefined,
          marginRight: spreadPx ? `${spreadPx}px` : undefined,
          zIndex: isHovered ? 4 : scale > 1 ? 2 : 1,
        }}
      >
        {isHovered && <span className="dock-tooltip">{app.name}</span>}
        <span
          className="dock-icon-wrap"
          style={{
            transform: `translateY(${((scale - 1) * -14).toFixed(1)}px) scale(${scale})`,
          }}
        >
          {app.icon}
        </span>
        <span className={`dock-dot ${isRunning ? 'is-visible' : ''}`} />
      </button>
    );
  };

  return (
    <div className={`dock-demo-stage ${className}`.trim()}>
      <LiquidGlass radius={22} bezelWidth={12} variant={variant} className="macos-dock-shell">
        <div
          className="macos-dock-row"
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') setHoveredIdx(null);
          }}
        >
          {items.map((app, idx) => renderDockButton(app, idx))}
          {utilityItems.length > 0 && <span className="dock-divider" aria-hidden="true" />}
          {utilityItems.map((app, idx) =>
            renderDockButton(app, items.length + idx, true)
          )}
        </div>
      </LiquidGlass>
    </div>
  );
};

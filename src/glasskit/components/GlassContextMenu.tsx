import React, { useState } from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';
import { GlassVariantId } from '../core/webglGlassRenderer';

export interface GlassContextQuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onSelect?: () => void;
}

export interface GlassContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
  dividerBefore?: boolean;
  onSelect?: () => void;
}

export interface GlassContextMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  closeLabel?: string;
  triggerIcon?: React.ReactNode;
  quickActions?: GlassContextQuickAction[];
  items: GlassContextMenuItem[];
  feedback?: React.ReactNode;
  variant?: GlassVariantId;
  className?: string;
}

export const GlassContextMenu: React.FC<GlassContextMenuProps> = ({
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  triggerLabel = 'Open Context Menu',
  closeLabel = 'Hide Menu',
  triggerIcon,
  quickActions,
  items,
  feedback,
  variant = 'clear',
  className = '',
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const toggleOpen = () => {
    const next = !isOpen;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div className={`ctx-demo-wrap ${className}`.trim()}>
      <div className="ctx-trigger-row">
        <LiquidGlass radius={999} bezelWidth={16} variant={variant} className="ios-glass-btn-wrap">
          <button
            type="button"
            className="ios-glass-btn"
            onClick={toggleOpen}
            aria-expanded={isOpen}
          >
            {triggerIcon}
            <span>{isOpen ? closeLabel : triggerLabel}</span>
          </button>
        </LiquidGlass>

        {feedback && <span className="ctx-feedback-pill">{feedback}</span>}
      </div>

      <div className={`ctx-popover-slot ${isOpen ? 'is-open' : ''}`}>
        <LiquidGlass radius={24} bezelWidth={22} variant={variant} className="ctx-menu-card">
          {quickActions && quickActions.length > 0 && (
            <>
              <div
                className="ctx-quick-row"
                style={{ gridTemplateColumns: `repeat(${quickActions.length}, 1fr)` }}
              >
                {quickActions.map((qa) => (
                  <button key={qa.id} type="button" onClick={qa.onSelect}>
                    {qa.icon}
                    <span>{qa.label}</span>
                  </button>
                ))}
              </div>
              <div className="ios-hairline" />
            </>
          )}

          <div className="ctx-list" role="menu">
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.dividerBefore && <div className="ios-hairline" />}
                <button
                  type="button"
                  role="menuitem"
                  className={`ctx-item ${item.destructive ? 'is-destructive' : ''}`.trim()}
                  onClick={item.onSelect}
                >
                  <span className="ctx-item-left">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.shortcut && <kbd>{item.shortcut}</kbd>}
                </button>
              </React.Fragment>
            ))}
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
};

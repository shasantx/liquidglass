import React from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';
import { GlassVariantId } from '../core/webglGlassRenderer';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassVariantId;
  bezelWidth?: number;
  radius?: number;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'clear',
  bezelWidth = 18,
  radius = 999,
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}) => (
  <LiquidGlass
    radius={radius}
    bezelWidth={bezelWidth}
    variant={variant}
    className={`ios-glass-btn-wrap ${className}`.trim()}
  >
    <button
      type={type}
      className={`ios-glass-btn ${variant === 'prominent' ? 'ios-glass-btn-prominent' : ''}`.trim()}
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </button>
  </LiquidGlass>
);

export interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassVariantId;
  bezelWidth?: number;
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  variant = 'clear',
  bezelWidth = 16,
  children,
  className = '',
  type = 'button',
  ...rest
}) => (
  <LiquidGlass
    radius={999}
    bezelWidth={bezelWidth}
    variant={variant}
    className={`ios-circle-btn-wrap ${className}`.trim()}
  >
    <button type={type} className="ios-circle-btn" {...rest}>
      {children}
    </button>
  </LiquidGlass>
);

export interface GlassButtonGroupAction {
  id: string;
  icon: React.ReactNode;
  ariaLabel: string;
  active?: boolean;
  activeTone?: 'rose' | 'amber' | 'default';
  onClick?: () => void;
}

export interface GlassButtonGroupProps {
  actions: GlassButtonGroupAction[];
  variant?: GlassVariantId;
  bezelWidth?: number;
  className?: string;
}

export const GlassButtonGroup: React.FC<GlassButtonGroupProps> = ({
  actions,
  variant = 'clear',
  bezelWidth = 18,
  className = '',
}) => (
  <LiquidGlass
    radius={999}
    bezelWidth={bezelWidth}
    variant={variant}
    className={`ios-grouped-pill ${className}`.trim()}
  >
    <div className="ios-grouped-pill-inner">
      {actions.map((action, idx) => (
        <React.Fragment key={action.id}>
          {idx > 0 && <span className="ios-pill-divider" />}
          <button
            type="button"
            className={`ios-pill-action ${
              action.active && action.activeTone === 'rose'
                ? 'is-rose'
                : action.active && action.activeTone === 'amber'
                ? 'is-amber'
                : ''
            }`.trim()}
            onClick={action.onClick}
            aria-label={action.ariaLabel}
            aria-pressed={action.active}
          >
            {action.icon}
          </button>
        </React.Fragment>
      ))}
    </div>
  </LiquidGlass>
);

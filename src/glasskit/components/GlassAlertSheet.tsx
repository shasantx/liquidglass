import React from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';
import { GlassVariantId } from '../core/webglGlassRenderer';

export interface GlassAlertSheetProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryLabel: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  variant?: GlassVariantId;
  className?: string;
}

export const GlassAlertSheet: React.FC<GlassAlertSheetProps> = ({
  title,
  description,
  icon,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  variant = 'clear',
  className = '',
}) => (
  <div className={`alert-demo-wrap ${className}`.trim()}>
    <LiquidGlass radius={32} bezelWidth={24} variant={variant} className="ios-alert-card">
      <div className="ios-alert-body">
        {icon && <div className="ios-alert-icon">{icon}</div>}
        <h4>{title}</h4>
        <p>{description}</p>
      </div>

      <div
        className="ios-alert-actions"
        style={!secondaryLabel ? { gridTemplateColumns: '1fr' } : undefined}
      >
        {secondaryLabel && (
          <button
            type="button"
            className="ios-alert-btn ios-alert-btn-secondary"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
        <button
          type="button"
          className="ios-alert-btn ios-alert-btn-primary"
          onClick={onPrimary}
        >
          {primaryLabel}
        </button>
      </div>
    </LiquidGlass>
  </div>
);

import React, { useState } from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';
import { GlassVariantId } from '../core/webglGlassRenderer';

export interface GlassNotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  icon?: React.ReactNode;
}

export interface GlassNotificationStackProps {
  items: GlassNotificationItem[];
  onDismiss?: (id: string) => void;
  onRestore?: () => void;
  canRestore?: boolean;
  defaultExpanded?: boolean;
  emptyLabel?: string;
  variant?: GlassVariantId;
  className?: string;
}

const ChevronUpSvg: React.FC<{ rotated: boolean }> = ({ rotated }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{
      transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.25s ease',
    }}
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const RestoreSvg = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const GlassNotificationStack: React.FC<GlassNotificationStackProps> = ({
  items,
  onDismiss,
  onRestore,
  canRestore = false,
  defaultExpanded = true,
  emptyLabel = 'All caught up',
  variant = 'clear',
  className = '',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`notif-demo-wrap ${className}`.trim()}>
      <div className="notif-header-bar">
        <span className="notif-count">
          {items.length > 0
            ? `${items.length} Notification${items.length === 1 ? '' : 's'}`
            : emptyLabel}
        </span>
        <div className="notif-actions">
          {items.length > 1 && (
            <button
              type="button"
              className="notif-chip-btn"
              onClick={() => setExpanded((e) => !e)}
            >
              <ChevronUpSvg rotated={!expanded} />
              {expanded ? 'Stack' : 'Expand'}
            </button>
          )}
          {canRestore && onRestore && (
            <button
              type="button"
              className="notif-chip-btn"
              onClick={() => {
                onRestore();
                setExpanded(true);
              }}
            >
              <RestoreSvg /> Restore
            </button>
          )}
        </div>
      </div>

      <div className={`notif-stack ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
        {items.map((item, idx) => {
          const stackedOffset = expanded ? 0 : idx * 10;
          const stackedScale = expanded ? 1 : Math.max(0.88, 1 - idx * 0.05);
          return (
            <div
              key={item.id}
              className="notif-card-slot"
              style={{
                zIndex: items.length - idx,
                transform: expanded
                  ? 'translateY(0) scale(1)'
                  : `translateY(${stackedOffset}px) scale(${stackedScale})`,
                marginTop: expanded ? (idx === 0 ? 0 : 10) : idx === 0 ? 0 : -66,
                opacity: expanded ? 1 : Math.max(0.55, 1 - idx * 0.2),
              }}
              onClick={() => {
                if (!expanded) setExpanded(true);
              }}
            >
              <LiquidGlass radius={24} bezelWidth={20} variant={variant} className="notif-glass-card">
                <div className="notif-inner">
                  {item.icon && (
                    <div className="notif-app-icon-svg" aria-hidden="true">
                      {item.icon}
                    </div>
                  )}
                  <div className="notif-copy">
                    <div className="notif-top-line">
                      <strong>{item.title}</strong>
                      <span>{item.time}</span>
                    </div>
                    <p>{item.body}</p>
                  </div>
                  {expanded && onDismiss && (
                    <button
                      type="button"
                      className="notif-dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(item.id);
                      }}
                      aria-label={`Dismiss ${item.title}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              </LiquidGlass>
            </div>
          );
        })}
      </div>
    </div>
  );
};

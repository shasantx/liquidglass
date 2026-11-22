import React, { useState } from 'react';
import { RotateCcw, ChevronUp } from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';
import {
  MessagesAppIcon,
  CalendarAppIcon,
  MailAppIcon,
} from '../components/AppleAppIcons';

interface NotifItem {
  id: string;
  app: string;
  title: string;
  body: string;
  time: string;
  Icon: React.FC<{ size?: number }>;
}

const INITIAL_NOTIFS: NotifItem[] = [
  {
    id: '1',
    app: 'Messages',
    title: 'Maya Lin',
    body: 'The new optical glass prototype feels unreal on the studio display.',
    time: 'now',
    Icon: MessagesAppIcon,
  },
  {
    id: '2',
    app: 'Calendar',
    title: 'Design System Critique',
    body: 'Starting in 10 minutes in Studio B — Motion & Materials',
    time: '4m ago',
    Icon: CalendarAppIcon,
  },
  {
    id: '3',
    app: 'Mail',
    title: 'TestFlight Build 26.4',
    body: 'Liquid Glass shader pipeline is ready for external review.',
    time: '18m ago',
    Icon: MailAppIcon,
  },
];

export const NotificationsDemo: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [items, setItems] = useState<NotifItem[]>(INITIAL_NOTIFS);

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="notif-demo-wrap">
      <div className="notif-header-bar">
        <span className="notif-count">
          {items.length > 0 ? `${items.length} Notifications` : 'All caught up'}
        </span>
        <div className="notif-actions">
          {items.length > 1 && (
            <button
              type="button"
              className="notif-chip-btn"
              onClick={() => setExpanded((e) => !e)}
            >
              <ChevronUp
                size={14}
                style={{
                  transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.25s ease',
                }}
              />
              {expanded ? 'Stack' : 'Expand'}
            </button>
          )}
          {items.length < INITIAL_NOTIFS.length && (
            <button
              type="button"
              className="notif-chip-btn"
              onClick={() => {
                setItems(INITIAL_NOTIFS);
                setExpanded(true);
              }}
            >
              <RotateCcw size={13} /> Restore
            </button>
          )}
        </div>
      </div>

      <div className={`notif-stack ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
        {items.map((item, idx) => {
          const AppIcon = item.Icon;
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
              <LiquidGlass radius={24} bezelWidth={20} className="notif-glass-card">
                <div className="notif-inner">
                  <div className="notif-app-icon-svg" aria-hidden="true">
                    <AppIcon size={40} />
                  </div>
                  <div className="notif-copy">
                    <div className="notif-top-line">
                      <strong>{item.title}</strong>
                      <span>{item.time}</span>
                    </div>
                    <p>{item.body}</p>
                  </div>
                  {expanded && (
                    <button
                      type="button"
                      className="notif-dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(item.id);
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

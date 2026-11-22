import React, { useEffect, useState } from 'react';
import { LiquidGlass } from '../components/LiquidGlass';
import { useGlassStage } from '../components/GlassStage';
import {
  FinderAppIcon,
  LaunchpadAppIcon,
  SafariAppIcon,
  MessagesAppIcon,
  MailAppIcon,
  MapsAppIcon,
  PhotosAppIcon,
  FaceTimeAppIcon,
  CalendarAppIcon,
  NotesAppIcon,
  AppleTVAppIcon,
  MusicAppIcon,
  AppStoreAppIcon,
  SettingsAppIcon,
  DownloadsFolderIcon,
  TrashGlassIcon,
} from '../components/AppleAppIcons';

interface DockItemSpec {
  id: string;
  name: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  running?: boolean;
  hideOnCompact?: boolean;
  hideOnMobile?: boolean;
}

const PRIMARY_DOCK_APPS: DockItemSpec[] = [
  { id: 'finder', name: 'Finder', Icon: FinderAppIcon, running: true },
  { id: 'apps', name: 'Apps', Icon: LaunchpadAppIcon, hideOnMobile: true },
  { id: 'safari', name: 'Safari', Icon: SafariAppIcon, running: true },
  { id: 'messages', name: 'Messages', Icon: MessagesAppIcon },
  { id: 'mail', name: 'Mail', Icon: MailAppIcon, hideOnMobile: true },
  { id: 'maps', name: 'Maps', Icon: MapsAppIcon, hideOnCompact: true },
  { id: 'photos', name: 'Photos', Icon: PhotosAppIcon },
  { id: 'facetime', name: 'FaceTime', Icon: FaceTimeAppIcon, hideOnCompact: true },
  { id: 'calendar', name: 'Calendar', Icon: CalendarAppIcon, hideOnMobile: true },
  { id: 'notes', name: 'Notes', Icon: NotesAppIcon, hideOnCompact: true },
  { id: 'tv', name: 'Apple TV', Icon: AppleTVAppIcon, hideOnCompact: true },
  { id: 'music', name: 'Music', Icon: MusicAppIcon, running: true },
  { id: 'appstore', name: 'App Store', Icon: AppStoreAppIcon, hideOnCompact: true },
  { id: 'settings', name: 'System Settings', Icon: SettingsAppIcon },
];

const UTILITY_DOCK_APPS: DockItemSpec[] = [
  { id: 'downloads', name: 'Downloads', Icon: DownloadsFolderIcon, hideOnMobile: true },
  { id: 'trash', name: 'Trash', Icon: TrashGlassIcon },
];

export const DockDemo: React.FC = () => {
  const stage = useGlassStage();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string>('finder');
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  // Keep the underlying WebGL2 glass tray smoothly synced as icons magnify & spread
  useEffect(() => {
    stage?.requestBurst(320);
  }, [hoveredIdx, bouncingId, stage]);

  const getScale = (idx: number) => {
    if (hoveredIdx === null) return 1;
    const dist = Math.abs(hoveredIdx - idx);
    if (dist === 0) return 1.36;
    if (dist === 1) return 1.18;
    if (dist === 2) return 1.07;
    return 1;
  };

  const launchApp = (id: string) => {
    setActiveId(id);
    setBouncingId(id);
    setTimeout(() => setBouncingId((curr) => (curr === id ? null : curr)), 520);
  };

  const renderDockButton = (app: DockItemSpec, globalIdx: number, isUtility = false) => {
    const AppIcon = app.Icon;
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
        } ${app.hideOnMobile ? 'dock-item-mobile-hide' : ''}`}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setHoveredIdx(globalIdx);
        }}
        onClick={() => launchApp(app.id)}
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
          <AppIcon size={42} className="dock-app-svg" />
        </span>
        <span className={`dock-dot ${isRunning ? 'is-visible' : ''}`} />
      </button>
    );
  };

  return (
    <div className="dock-demo-stage">
      <LiquidGlass radius={22} bezelWidth={12} variant="clear" className="macos-dock-shell">
        <div
          className="macos-dock-row"
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') setHoveredIdx(null);
          }}
        >
          {PRIMARY_DOCK_APPS.map((app, idx) => renderDockButton(app, idx))}
          <span className="dock-divider" aria-hidden="true" />
          {UTILITY_DOCK_APPS.map((app, idx) =>
            renderDockButton(app, PRIMARY_DOCK_APPS.length + idx, true)
          )}
        </div>
      </LiquidGlass>
    </div>
  );
};

import React from 'react';
import { GlassDock } from '../glasskit';
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

const PRIMARY_ITEMS = [
  { id: 'finder', name: 'Finder', icon: <FinderAppIcon size={42} className="dock-app-svg" />, running: true },
  { id: 'apps', name: 'Apps', icon: <LaunchpadAppIcon size={42} className="dock-app-svg" />, hideOnMobile: true },
  { id: 'safari', name: 'Safari', icon: <SafariAppIcon size={42} className="dock-app-svg" />, running: true },
  { id: 'messages', name: 'Messages', icon: <MessagesAppIcon size={42} className="dock-app-svg" /> },
  { id: 'mail', name: 'Mail', icon: <MailAppIcon size={42} className="dock-app-svg" />, hideOnMobile: true },
  { id: 'maps', name: 'Maps', icon: <MapsAppIcon size={42} className="dock-app-svg" />, hideOnCompact: true },
  { id: 'photos', name: 'Photos', icon: <PhotosAppIcon size={42} className="dock-app-svg" /> },
  { id: 'facetime', name: 'FaceTime', icon: <FaceTimeAppIcon size={42} className="dock-app-svg" />, hideOnCompact: true },
  { id: 'calendar', name: 'Calendar', icon: <CalendarAppIcon size={42} className="dock-app-svg" />, hideOnMobile: true },
  { id: 'notes', name: 'Notes', icon: <NotesAppIcon size={42} className="dock-app-svg" />, hideOnCompact: true },
  { id: 'tv', name: 'Apple TV', icon: <AppleTVAppIcon size={42} className="dock-app-svg" />, hideOnCompact: true },
  { id: 'music', name: 'Music', icon: <MusicAppIcon size={42} className="dock-app-svg" />, running: true },
  { id: 'appstore', name: 'App Store', icon: <AppStoreAppIcon size={42} className="dock-app-svg" />, hideOnCompact: true },
  { id: 'settings', name: 'System Settings', icon: <SettingsAppIcon size={42} className="dock-app-svg" /> },
];

const UTILITY_ITEMS = [
  { id: 'downloads', name: 'Downloads', icon: <DownloadsFolderIcon size={42} className="dock-app-svg" />, hideOnMobile: true },
  { id: 'trash', name: 'Trash', icon: <TrashGlassIcon size={42} className="dock-app-svg" /> },
];

export const DockDemo: React.FC = () => (
  <GlassDock items={PRIMARY_ITEMS} utilityItems={UTILITY_ITEMS} defaultActiveId="finder" />
);

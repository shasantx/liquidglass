import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/** Authentic macOS Tahoe Finder Icon */
export const FinderAppIcon: React.FC<IconProps> = ({ size = 50, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="finder-bg" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#66C2FF" />
        <stop offset="52%" stopColor="#2A8CFF" />
        <stop offset="100%" stopColor="#1462E8" />
      </linearGradient>
      <linearGradient id="finder-right" x1="34" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5FAFF" />
        <stop offset="100%" stopColor="#D7E6F8" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#finder-bg)" />
    <path d="M35.5 0H49C57.284 0 64 6.716 64 15V49C64 57.284 57.284 64 49 64H34.5C31.5 52 31.2 42 35.5 34.5H27.5C28.8 21.5 31.4 10 35.5 0Z" fill="url(#finder-right)" />
    <path d="M35.5 0C31.4 10 28.8 21.5 27.5 34.5H35.5C31.2 42 31.5 52 34.5 64" stroke="#0B3B96" strokeOpacity="0.22" strokeWidth="1.4" />
    <rect x="19" y="20" width="4.4" height="9.2" rx="2.2" fill="#0D264B" />
    <rect x="41.2" y="20" width="4.4" height="9.2" rx="2.2" fill="#0D264B" />
    <path d="M17.5 41.5C22.4 47.2 41.6 47.2 46.5 41.5" stroke="#0D264B" strokeWidth="3.6" strokeLinecap="round" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.32" strokeWidth="1.5" />
  </svg>
);

/** Authentic macOS Tahoe Safari Icon */
export const SafariAppIcon: React.FC<IconProps> = ({ size = 50, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="safari-shell" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E4E9F2" />
      </linearGradient>
      <linearGradient id="safari-dial" x1="32" y1="7" x2="32" y2="57" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#58D2FF" />
        <stop offset="50%" stopColor="#1E90FF" />
        <stop offset="100%" stopColor="#0E52D8" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#safari-shell)" />
    <circle cx="32" cy="32" r="24" fill="url(#safari-dial)" />
    <circle cx="32" cy="32" r="21" stroke="white" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="1.5 3.8" />
    <polygon points="46,18 35.5,35.5 28.5,28.5" fill="#FF3B30" />
    <polygon points="18,46 28.5,28.5 35.5,35.5" fill="#F8FAFC" />
    <circle cx="32" cy="32" r="2.4" fill="#CBD5E1" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.65" strokeWidth="1.5" />
  </svg>
);

/** Authentic iOS / macOS Messages Icon */
export const MessagesAppIcon: React.FC<IconProps> = ({ size = 50, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="msg-bg" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#69F07E" />
        <stop offset="55%" stopColor="#30D158" />
        <stop offset="100%" stopColor="#19A842" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#msg-bg)" />
    <path
      d="M32 15C20.4 15 12 22.1 12 31C12 35.8 14.5 40.1 18.5 43C18.2 46.1 16.4 48.8 15.6 49.8C15.3 50.2 15.7 50.8 16.2 50.6C19.6 49.7 23.1 47.9 25 46.5C27.2 47.1 29.5 47.4 32 47.4C43.6 47.4 52 40.2 52 31C52 22.1 43.6 15 32 15Z"
      fill="white"
    />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
  </svg>
);

/** Authentic iOS / macOS Mail Icon */
export const MailAppIcon: React.FC<IconProps> = ({ size = 50, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="mail-bg" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#45B4FF" />
        <stop offset="100%" stopColor="#1761E8" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#mail-bg)" />
    <rect x="11" y="18" width="42" height="28" rx="4.5" fill="white" />
    <path d="M12.8 20L32 34.8L51.2 20" stroke="#1E78F0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 44L25 32.5M51 44L39 32.5" stroke="#1E78F0" strokeOpacity="0.32" strokeWidth="2" strokeLinecap="round" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
  </svg>
);

/** Authentic Apple Photos Flower Wheel Icon */
export const PhotosAppIcon: React.FC<IconProps> = ({ size = 50, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="photos-shell" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EFF3F8" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#photos-shell)" />
    <g transform="translate(32 32)">
      <ellipse cx="0" cy="-12" rx="6.2" ry="11.2" fill="#FF9500" fillOpacity="0.88" />
      <ellipse cx="0" cy="-12" rx="6.2" ry="11.2" fill="#FFCC00" fillOpacity="0.88" transform="rotate(45)" />
      <ellipse cx="0" cy="-12" rx="6.2" ry="11.2" fill="#34C759" fillOpacity="0.86" transform="rotate(90)" />
      <ellipse cx="0" cy="-12" rx="6.2" ry="11.2" fill="#32ADE6" fillOpacity="0.86" transform="rotate(135)" />
      <ellipse cx="0" cy="-12" rx="6.2" ry="11.2" fill="#007AFF" fillOpacity="0.86" transform="rotate(180)" />
      <ellipse cx="0" cy="-12" rx="6.2" ry="11.2" fill="#AF52DE" fillOpacity="0.86" transform="rotate(225)" />
      <ellipse cx="0" cy="-12" rx="6.2" ry="11.2" fill="#FF2D55" fillOpacity="0.86" transform="rotate(270)" />
      <ellipse cx="0" cy="-12" rx="6.2" ry="11.2" fill="#FF3B30" fillOpacity="0.86" transform="rotate(315)" />
    </g>
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.75" strokeWidth="1.5" />
  </svg>
);

/** Authentic Apple Music Icon */
export const MusicAppIcon: React.FC<IconProps> = ({ size = 50, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="music-bg" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF5B75" />
        <stop offset="100%" stopColor="#FA1D44" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#music-bg)" />
    <path
      d="M44.5 14.5L25.5 18.8C24.4 19.05 23.6 20 23.6 21.1V40.6C22.4 40 20.9 39.8 19.3 40.2C16.2 40.9 14.1 43.5 14.7 46C15.3 48.6 18.3 50 21.4 49.3C24.2 48.6 26.2 46.5 26.2 44.1V26.8L43.2 23V36.8C42 36.2 40.5 36 38.9 36.4C35.8 37.1 33.7 39.7 34.3 42.2C34.9 44.8 37.9 46.2 41 45.5C43.8 44.8 45.8 42.7 45.8 40.3V16.4C45.8 15.1 45.3 14.3 44.5 14.5Z"
      fill="white"
    />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.32" strokeWidth="1.5" />
  </svg>
);

/** Authentic macOS Terminal Icon */
export const TerminalAppIcon: React.FC<IconProps> = ({ size = 50, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="term-frame" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
      <linearGradient id="term-screen" x1="0" y1="6" x2="0" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1C2029" />
        <stop offset="100%" stopColor="#0D1017" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#term-frame)" />
    <rect x="4" y="4" width="56" height="56" rx="11.5" fill="url(#term-screen)" />
    <path d="M16 21L26 28.5L16 36" stroke="#F8FAFC" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="29.5" y1="36" x2="43.5" y2="36" stroke="#F8FAFC" strokeWidth="3.6" strokeLinecap="round" />
  </svg>
);

/** Authentic macOS System Settings Gear Icon */
export const SettingsAppIcon: React.FC<IconProps> = ({ size = 50, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="set-bg" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D6DCE6" />
        <stop offset="100%" stopColor="#7C8596" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#set-bg)" />
    <circle cx="32" cy="32" r="19" fill="#2A2F3A" fillOpacity="0.22" />
    <g transform="translate(32 32)">
      <path
        d="M-3.5-20H3.5L4.8-14.8C6.3-14.4 7.7-13.8 9-13L13.7-15.8L18.6-10.9L15.8-6.2C16.6-4.9 17.2-3.5 17.6-2L22.8-0.7V6.3L17.6 7.6C17.2 9.1 16.6 10.5 15.8 11.8L18.6 16.5L13.7 21.4L9 18.6C7.7 19.4 6.3 20 4.8 20.4L3.5 25.6H-3.5L-4.8 20.4C-6.3 20-7.7 19.4-9 18.6L-13.7 21.4L-18.6 16.5L-15.8 11.8C-16.6 10.5-17.2 9.1-17.6 7.6L-22.8 6.3V-0.7L-17.6-2C-17.2-3.5-16.6-4.9-15.8-6.2L-18.6-10.9L-13.7-15.8L-9-13C-7.7-13.8-6.3-14.4-4.8-14.8L-3.5-20Z"
        transform="translate(0 -2.8) scale(0.84)"
        fill="#F8FAFC"
      />
      <circle cx="0" cy="0" r="8.2" fill="#5F6777" />
      <circle cx="0" cy="0" r="4.5" fill="#E2E8F0" />
    </g>
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.45" strokeWidth="1.5" />
  </svg>
);

/** Authentic iOS / macOS Calendar Icon (macOS Tahoe style) */
export const CalendarAppIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="cal-shell" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EEF2F7" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#cal-shell)" />
    <text x="32" y="21" textAnchor="middle" fill="#FF3B30" fontSize="11.5" fontWeight="700" fontFamily="Outfit, -apple-system, sans-serif">
      Mon
    </text>
    <text x="32" y="50" textAnchor="middle" fill="#1C1C1E" fontSize="30" fontWeight="600" fontFamily="Outfit, -apple-system, sans-serif">
      15
    </text>
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
  </svg>
);

/** Authentic macOS Tahoe Apps / Launchpad Icon */
export const LaunchpadAppIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="lp-bg" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E6ECF5" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#lp-bg)" />
    <rect x="14" y="13" width="36" height="8.5" rx="4.25" fill="#94A3B8" fillOpacity="0.55" />
    <circle cx="19" cy="17.25" r="2.2" fill="#FFFFFF" />
    <rect x="14" y="26" width="9" height="9" rx="2.6" fill="#FF6B6B" />
    <rect x="27.5" y="26" width="9" height="9" rx="2.6" fill="#FF9F43" />
    <rect x="41" y="26" width="9" height="9" rx="2.6" fill="#54A0FF" />
    <rect x="14" y="39.5" width="9" height="9" rx="2.6" fill="#5F27CD" />
    <rect x="27.5" y="39.5" width="9" height="9" rx="2.6" fill="#1DD1A1" />
    <rect x="41" y="39.5" width="9" height="9" rx="2.6" fill="#FF9FF3" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.75" strokeWidth="1.5" />
  </svg>
);

/** Authentic Apple Maps Icon */
export const MapsAppIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <clipPath id="maps-clip">
      <rect width="64" height="64" rx="15" />
    </clipPath>
    <g clipPath="url(#maps-clip)">
      <rect width="64" height="64" fill="#F2F0E8" />
      <rect x="0" y="0" width="26" height="32" fill="#82E085" />
      <rect x="38" y="0" width="26" height="28" fill="#5CC5FF" />
      <rect x="36" y="34" width="28" height="30" fill="#9AE68D" />
      <path d="M0 32H64" stroke="#FFD666" strokeWidth="7" />
      <path d="M26 0V64" stroke="#FFFFFF" strokeWidth="7" />
      <path d="M26 0V64" stroke="#3B82F6" strokeWidth="3.5" />
      <rect x="14" y="10" width="24" height="12" rx="4" fill="#22C55E" />
      <circle cx="24" cy="44" r="14" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M24 35.5L30.5 50L24 46.8L17.5 50L24 35.5Z" fill="#FFFFFF" />
    </g>
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" />
  </svg>
);

/** Authentic Apple FaceTime Icon */
export const FaceTimeAppIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="ft-bg" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#65F27B" />
        <stop offset="100%" stopColor="#1DB94A" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#ft-bg)" />
    <rect x="12" y="20" width="27" height="24" rx="6" fill="white" />
    <path d="M41.5 27.5L52 20.5V43.5L41.5 36.5V27.5Z" fill="white" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.38" strokeWidth="1.5" />
  </svg>
);

/** Authentic Apple Notes Icon */
export const NotesAppIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="notes-top" x1="0" y1="0" x2="0" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE15A" />
        <stop offset="100%" stopColor="#F5B800" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="#FFFFFF" />
    <path d="M0 15C0 6.716 6.716 0 15 0H49C57.284 0 64 6.716 64 15V19H0V15Z" fill="url(#notes-top)" />
    <line x1="0" y1="22.5" x2="64" y2="22.5" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="2 2.5" />
    <line x1="10" y1="33" x2="54" y2="33" stroke="#E2E8F0" strokeWidth="1.6" />
    <line x1="10" y1="43" x2="54" y2="43" stroke="#E2E8F0" strokeWidth="1.6" />
    <line x1="10" y1="53" x2="54" y2="53" stroke="#E2E8F0" strokeWidth="1.6" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
  </svg>
);

/** Authentic Apple TV Icon */
export const AppleTVAppIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="tv-bg" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2A2D36" />
        <stop offset="100%" stopColor="#090A0E" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#tv-bg)" />
    <text x="32" y="40" textAnchor="middle" fill="#FFFFFF" fontSize="21" fontWeight="700" fontFamily="Outfit, -apple-system, sans-serif" letterSpacing="-0.5">
      tv
    </text>
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.24" strokeWidth="1.5" />
  </svg>
);

/** Authentic Apple App Store Icon */
export const AppStoreAppIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="as-bg" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3BB8FF" />
        <stop offset="100%" stopColor="#1463E8" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill="url(#as-bg)" />
    <path d="M32 14L17.5 41.5" stroke="white" strokeWidth="4.6" strokeLinecap="round" />
    <path d="M32 14L46.5 41.5" stroke="white" strokeWidth="4.6" strokeLinecap="round" />
    <path d="M15 39H39" stroke="white" strokeWidth="4.6" strokeLinecap="round" />
    <path d="M14.5 47L17.2 42" stroke="white" strokeWidth="4.6" strokeLinecap="round" />
    <path d="M49.5 47L44.8 39" stroke="white" strokeWidth="4.6" strokeLinecap="round" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="white" strokeOpacity="0.38" strokeWidth="1.5" />
  </svg>
);

/** Authentic macOS Tahoe Translucent Blue Downloads Folder */
export const DownloadsFolderIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="dl-back" x1="32" y1="10" x2="32" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#65BEFF" />
        <stop offset="100%" stopColor="#3B96F0" />
      </linearGradient>
      <linearGradient id="dl-front" x1="32" y1="18" x2="32" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8ED4FF" stopOpacity="0.94" />
        <stop offset="100%" stopColor="#4BA3F7" stopOpacity="0.96" />
      </linearGradient>
    </defs>
    <path d="M7 16C7 12.686 9.686 10 13 10H24.5C26.3 10 28 10.9 29 12.3L31.4 15.5H51C54.314 15.5 57 18.186 57 21.5V48C57 51.866 53.866 55 50 55H14C10.134 55 7 51.866 7 48V16Z" fill="url(#dl-back)" />
    <rect x="6" y="19" width="52" height="36" rx="8" fill="url(#dl-front)" stroke="white" strokeOpacity="0.48" strokeWidth="1.2" />
    <circle cx="32" cy="37" r="10.5" stroke="#1E60B8" strokeOpacity="0.45" strokeWidth="2" />
    <path d="M32 31.5V41.5M32 41.5L28 37.5M32 41.5L36 37.5" stroke="#1E60B8" strokeOpacity="0.6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Authentic macOS Tahoe Frosted Liquid Glass Trash Bin */
export const TrashGlassIcon: React.FC<IconProps> = ({ size = 44, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="trash-body" x1="14" y1="14" x2="50" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
        <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.48" />
        <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.62" />
      </linearGradient>
    </defs>
    <path d="M13 14.5H51L46.5 53C46.2 55.3 44.3 57 42 57H22C19.7 57 17.8 55.3 17.5 53L13 14.5Z" fill="url(#trash-body)" stroke="white" strokeOpacity="0.72" strokeWidth="1.5" />
    <ellipse cx="32" cy="14.5" rx="19" ry="3.8" fill="white" fillOpacity="0.45" stroke="white" strokeOpacity="0.82" strokeWidth="1.2" />
    <line x1="23" y1="22" x2="25" y2="51" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="32" y1="22" x2="32" y2="51" stroke="white" strokeOpacity="0.42" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="41" y1="22" x2="39" y2="51" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Crisp stylized album art for Old Scratch Blues (cobalt clouds & monochrome studio aesthetic) */
export const OldScratchArtwork: React.FC<{ size?: number }> = ({ size = 82 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" style={{ display: 'block' }}>
    <defs>
      <radialGradient id="art-sky" cx="52%" cy="22%" r="72%">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="36%" stopColor="#38BDF8" />
        <stop offset="72%" stopColor="#0C4A6E" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      <radialGradient id="art-glow" cx="50%" cy="62%" r="42%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#CBD5E1" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#020617" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="100" height="100" fill="#020617" />
    <rect width="100" height="100" fill="url(#art-sky)" />
    <ellipse cx="26" cy="24" rx="34" ry="20" fill="#BAE6FD" fillOpacity="0.52" />
    <ellipse cx="74" cy="20" rx="30" ry="18" fill="#E0F2FE" fillOpacity="0.65" />
    <ellipse cx="52" cy="14" rx="28" ry="15" fill="#FFFFFF" fillOpacity="0.78" />
    <path d="M16 98C22 72 34 62 50 62C66 62 78 72 84 98H16Z" fill="url(#art-glow)" />
    <ellipse cx="50" cy="48" rx="16" ry="21" fill="#F1F5F9" />
    <ellipse cx="50" cy="47" rx="13" ry="17" fill="#FFFFFF" />
    <path d="M32 34C38 22 62 22 68 34C64 40 58 36 50 37C42 36 36 40 32 34Z" fill="#0F172A" fillOpacity="0.88" />
    <circle cx="44" cy="46" r="1.8" fill="#0F172A" />
    <circle cx="56" cy="46" r="1.8" fill="#0F172A" />
    <path d="M46.5 55.5C48.5 57 51.5 57 53.5 55.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

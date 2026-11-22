import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Share,
  Heart,
} from 'lucide-react';
import { GlassMediaPlayer } from '../glasskit';
import { OldScratchArtwork } from '../components/AppleAppIcons';

const DEMO_TRACKS = [
  {
    title: 'Old Scratch Blues',
    artist: 'Jack White',
    duration: 173,
    artwork: <OldScratchArtwork size={82} />,
  },
  {
    title: 'Tahoe Horizon',
    artist: 'Glassworks Trio',
    duration: 186,
    artworkGradient: 'linear-gradient(135deg, #34d399 0%, #0ea5e9 55%, #1d4ed8 100%)',
  },
  {
    title: 'Specular Drift',
    artist: 'Solstice Radio',
    duration: 242,
    artworkGradient: 'linear-gradient(135deg, #fb923c 0%, #f43f5e 55%, #a855f7 100%)',
  },
];

export const MediaPlayerDemo: React.FC = () => (
  <GlassMediaPlayer
    tracks={DEMO_TRACKS}
    icons={{
      play: <Play size={24} fill="currentColor" style={{ marginLeft: 2 }} />,
      pause: <Pause size={24} fill="currentColor" />,
      prev: <SkipBack size={22} fill="currentColor" />,
      next: <SkipForward size={22} fill="currentColor" />,
      rewind: <RotateCcw size={18} />,
      share: <Share size={18} />,
      heart: (active) => <Heart size={17} fill={active ? 'currentColor' : 'none'} />,
    }}
  />
);

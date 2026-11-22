import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Share,
  Heart,
} from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';
import { OldScratchArtwork } from '../components/AppleAppIcons';

const TRACKS = [
  {
    title: 'Old Scratch Blues',
    artist: 'Jack White',
    duration: 173,
    customArt: true,
    gradient: '',
  },
  {
    title: 'Tahoe Horizon',
    artist: 'Glassworks Trio',
    duration: 186,
    customArt: false,
    gradient: 'linear-gradient(135deg, #34d399 0%, #0ea5e9 55%, #1d4ed8 100%)',
  },
  {
    title: 'Specular Drift',
    artist: 'Solstice Radio',
    duration: 242,
    customArt: false,
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f43f5e 55%, #a855f7 100%)',
  },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const MediaPlayerDemo: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(22);
  const [favorited, setFavorited] = useState(false);

  const track = TRACKS[trackIdx];

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const timer = window.setInterval(() => {
      setElapsed((prev) => (prev + 1 >= track.duration ? 0 : prev + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, inView, track.duration]);

  const switchTrack = (dir: number) => {
    setTrackIdx((prev) => (prev + dir + TRACKS.length) % TRACKS.length);
    setElapsed(0);
  };

  const progress = (elapsed / track.duration) * 100;

  return (
    <div ref={wrapRef} className="media-demo-shell">
      <LiquidGlass radius={38} bezelWidth={26} className="media-glass-card">
        <div className="media-top">
          <div
            className={`media-artwork ${playing ? 'is-playing' : ''}`}
            style={track.customArt ? undefined : { background: track.gradient }}
            aria-hidden="true"
          >
            {track.customArt ? (
              <OldScratchArtwork size={82} />
            ) : (
              <div className="media-artwork-ring" />
            )}
          </div>

          <div className="media-info">
            <div className="media-title">{track.title}</div>
            <div className="media-artist">{track.artist}</div>
          </div>

          <button
            type="button"
            className={`media-fav-btn ${favorited ? 'is-active' : ''}`}
            onClick={() => setFavorited((v) => !v)}
            aria-label="Favorite track"
          >
            <Heart size={17} fill={favorited ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="media-scrubber-wrap">
          <div className="media-times media-times-top">
            <span>{formatTime(elapsed)}</span>
            <span>-{formatTime(track.duration - elapsed)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={track.duration}
            value={elapsed}
            onChange={(e) => setElapsed(Number(e.target.value))}
            className="media-scrubber"
            aria-label="Track progress"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
        </div>

        <div className="media-controls">
          <button
            type="button"
            className="media-ctrl-btn media-side-btn"
            onClick={() => setElapsed((prev) => Math.max(0, prev - 10))}
            aria-label="Rewind 10 seconds"
            title="Rewind 10s"
          >
            <RotateCcw size={18} />
          </button>

          <div className="media-center-transport">
            <button
              type="button"
              className="media-ctrl-btn"
              onClick={() => switchTrack(-1)}
              aria-label="Previous track"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button
              type="button"
              className="media-play-btn"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" style={{ marginLeft: 2 }} />
              )}
            </button>

            <button
              type="button"
              className="media-ctrl-btn"
              onClick={() => switchTrack(1)}
              aria-label="Next track"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          <button
            type="button"
            className="media-ctrl-btn media-side-btn"
            onClick={() => switchTrack(1)}
            aria-label="Share track"
            title="Next track"
          >
            <Share size={18} />
          </button>
        </div>
      </LiquidGlass>
    </div>
  );
};

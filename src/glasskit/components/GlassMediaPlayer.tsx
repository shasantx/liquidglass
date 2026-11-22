import React, { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '../primitives/LiquidGlass';
import { GlassVariantId } from '../core/webglGlassRenderer';

export interface GlassMediaTrack {
  title: string;
  artist: string;
  duration: number;
  artwork?: React.ReactNode;
  artworkGradient?: string;
}

export interface GlassMediaPlayerProps {
  tracks: GlassMediaTrack[];
  initialTrackIndex?: number;
  autoTick?: boolean;
  defaultPlaying?: boolean;
  defaultElapsed?: number;
  variant?: GlassVariantId;
  onTrackChange?: (index: number, track: GlassMediaTrack) => void;
  onPlayChange?: (playing: boolean) => void;
  onFavoriteChange?: (favorited: boolean) => void;
  icons?: {
    play?: React.ReactNode;
    pause?: React.ReactNode;
    prev?: React.ReactNode;
    next?: React.ReactNode;
    rewind?: React.ReactNode;
    share?: React.ReactNode;
    heart?: (active: boolean) => React.ReactNode;
  };
  className?: string;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const DefaultPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }} aria-hidden="true">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);
const DefaultPause = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);
const DefaultPrev = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" x2="5" y1="19" y2="5" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);
const DefaultNext = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" x2="19" y1="5" y2="19" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);
const DefaultRewind = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const DefaultShare = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" x2="12" y1="2" y2="15" />
  </svg>
);
const DefaultHeart: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const GlassMediaPlayer: React.FC<GlassMediaPlayerProps> = ({
  tracks,
  initialTrackIndex = 0,
  autoTick = true,
  defaultPlaying = true,
  defaultElapsed = 22,
  variant = 'clear',
  onTrackChange,
  onPlayChange,
  onFavoriteChange,
  icons,
  className = '',
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [trackIdx, setTrackIdx] = useState(initialTrackIndex);
  const [playing, setPlaying] = useState(defaultPlaying);
  const [elapsed, setElapsed] = useState(defaultElapsed);
  const [favorited, setFavorited] = useState(false);

  const safeIdx = tracks.length > 0 ? trackIdx % tracks.length : 0;
  const track = tracks[safeIdx] ?? {
    title: 'Untitled Track',
    artist: 'Unknown Artist',
    duration: 180,
    artworkGradient: 'linear-gradient(135deg, #34d399 0%, #0ea5e9 55%, #1d4ed8 100%)',
  };

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
    if (!autoTick || !playing || !inView) return;
    const timer = window.setInterval(() => {
      setElapsed((prev) => (prev + 1 >= track.duration ? 0 : prev + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [autoTick, playing, inView, track.duration]);

  const switchTrack = (dir: number) => {
    if (tracks.length === 0) return;
    const nextIdx = (safeIdx + dir + tracks.length) % tracks.length;
    setTrackIdx(nextIdx);
    setElapsed(0);
    onTrackChange?.(nextIdx, tracks[nextIdx]);
  };

  const progress = Math.min(100, Math.max(0, (elapsed / Math.max(1, track.duration)) * 100));

  return (
    <div ref={wrapRef} className={`media-demo-shell ${className}`.trim()}>
      <LiquidGlass radius={38} bezelWidth={26} variant={variant} className="media-glass-card">
        <div className="media-top">
          <div
            className={`media-artwork ${playing ? 'is-playing' : ''}`}
            style={
              track.artwork
                ? undefined
                : {
                    background:
                      track.artworkGradient ??
                      'linear-gradient(135deg, #34d399 0%, #0ea5e9 55%, #1d4ed8 100%)',
                  }
            }
            aria-hidden="true"
          >
            {track.artwork ?? <div className="media-artwork-ring" />}
          </div>

          <div className="media-info">
            <div className="media-title">{track.title}</div>
            <div className="media-artist">{track.artist}</div>
          </div>

          <button
            type="button"
            className={`media-fav-btn ${favorited ? 'is-active' : ''}`}
            onClick={() => {
              const next = !favorited;
              setFavorited(next);
              onFavoriteChange?.(next);
            }}
            aria-label="Favorite track"
            aria-pressed={favorited}
          >
            {icons?.heart ? icons.heart(favorited) : <DefaultHeart active={favorited} />}
          </button>
        </div>

        <div className="media-scrubber-wrap">
          <div className="media-times media-times-top">
            <span>{formatTime(elapsed)}</span>
            <span>-{formatTime(Math.max(0, track.duration - elapsed))}</span>
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
            {icons?.rewind ?? <DefaultRewind />}
          </button>

          <div className="media-center-transport">
            <button
              type="button"
              className="media-ctrl-btn"
              onClick={() => switchTrack(-1)}
              aria-label="Previous track"
            >
              {icons?.prev ?? <DefaultPrev />}
            </button>

            <button
              type="button"
              className="media-play-btn"
              onClick={() => {
                const next = !playing;
                setPlaying(next);
                onPlayChange?.(next);
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? icons?.pause ?? <DefaultPause /> : icons?.play ?? <DefaultPlay />}
            </button>

            <button
              type="button"
              className="media-ctrl-btn"
              onClick={() => switchTrack(1)}
              aria-label="Next track"
            >
              {icons?.next ?? <DefaultNext />}
            </button>
          </div>

          <button
            type="button"
            className="media-ctrl-btn media-side-btn"
            onClick={() => switchTrack(1)}
            aria-label="Next track"
            title="Next track"
          >
            {icons?.share ?? <DefaultShare />}
          </button>
        </div>
      </LiquidGlass>
    </div>
  );
};

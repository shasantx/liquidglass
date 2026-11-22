import React from 'react';
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
export declare const GlassMediaPlayer: React.FC<GlassMediaPlayerProps>;

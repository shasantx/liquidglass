import React, { useState } from 'react';
import {
  Share,
  Heart,
  Bookmark,
  Plus,
  Play,
  SlidersHorizontal,
  Sparkles,
  Check,
} from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';

export const ButtonsDemo: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(true);
  const [shared, setShared] = useState(false);

  const triggerShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 1600);
  };

  return (
    <div className="demo-buttons-grid">
      {/* Row 1: Primary capsule buttons */}
      <div className="demo-btn-row">
        <LiquidGlass radius={999} bezelWidth={18} variant="clear" className="ios-glass-btn-wrap">
          <button type="button" className="ios-glass-btn">
            <Play size={16} fill="currentColor" />
            <span>Play Preview</span>
          </button>
        </LiquidGlass>

        <LiquidGlass radius={999} bezelWidth={18} variant="prominent" className="ios-glass-btn-wrap">
          <button type="button" className="ios-glass-btn ios-glass-btn-prominent">
            <Sparkles size={16} />
            <span>Get Liquid Library</span>
          </button>
        </LiquidGlass>

        <LiquidGlass radius={999} bezelWidth={18} variant="tinted" className="ios-glass-btn-wrap">
          <button type="button" className="ios-glass-btn">
            <SlidersHorizontal size={16} />
            <span>Customize</span>
          </button>
        </LiquidGlass>
      </div>

      {/* Row 2: Grouped toolbar capsule + circular glass icon buttons */}
      <div className="demo-btn-row">
        <LiquidGlass radius={999} bezelWidth={18} className="ios-grouped-pill">
          <div className="ios-grouped-pill-inner">
            <button
              type="button"
              className={`ios-pill-action ${liked ? 'is-rose' : ''}`}
              onClick={() => setLiked((v) => !v)}
              aria-label="Favorite"
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <span className="ios-pill-divider" />
            <button
              type="button"
              className={`ios-pill-action ${saved ? 'is-amber' : ''}`}
              onClick={() => setSaved((v) => !v)}
              aria-label="Bookmark"
            >
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <span className="ios-pill-divider" />
            <button
              type="button"
              className="ios-pill-action"
              onClick={triggerShare}
              aria-label="Share"
            >
              {shared ? <Check size={18} /> : <Share size={18} />}
            </button>
          </div>
        </LiquidGlass>

        <LiquidGlass radius={999} bezelWidth={16} className="ios-circle-btn-wrap">
          <button type="button" className="ios-circle-btn" aria-label="Add new item">
            <Plus size={20} strokeWidth={2.2} />
          </button>
        </LiquidGlass>
      </div>
    </div>
  );
};

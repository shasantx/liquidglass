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
import { GlassButton, GlassButtonGroup, GlassIconButton } from '../glasskit';

export const ButtonsDemo: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(true);
  const [shared, setShared] = useState(false);

  const triggerShare = () => {
    setShared(true);
    window.setTimeout(() => setShared(false), 1600);
  };

  return (
    <div className="demo-buttons-grid">
      <div className="demo-btn-row">
        <GlassButton variant="clear" icon={<Play size={16} fill="currentColor" />}>
          Play Preview
        </GlassButton>

        <GlassButton variant="prominent" icon={<Sparkles size={16} />}>
          Get Liquid Library
        </GlassButton>

        <GlassButton variant="tinted" icon={<SlidersHorizontal size={16} />}>
          Customize
        </GlassButton>
      </div>

      <div className="demo-btn-row">
        <GlassButtonGroup
          actions={[
            {
              id: 'favorite',
              ariaLabel: 'Favorite',
              active: liked,
              activeTone: 'rose',
              icon: <Heart size={18} fill={liked ? 'currentColor' : 'none'} />,
              onClick: () => setLiked((v) => !v),
            },
            {
              id: 'bookmark',
              ariaLabel: 'Bookmark',
              active: saved,
              activeTone: 'amber',
              icon: <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />,
              onClick: () => setSaved((v) => !v),
            },
            {
              id: 'share',
              ariaLabel: 'Share',
              icon: shared ? <Check size={18} /> : <Share size={18} />,
              onClick: triggerShare,
            },
          ]}
        />

        <GlassIconButton aria-label="Add new item">
          <Plus size={20} strokeWidth={2.2} />
        </GlassIconButton>
      </div>
    </div>
  );
};

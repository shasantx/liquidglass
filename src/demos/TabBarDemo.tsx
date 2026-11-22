import React, { useState } from 'react';
import { Home, Compass, Library, Radio, Search, X } from 'lucide-react';
import { GlassTabBar } from '../glasskit';

export const TabBarDemo: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <GlassTabBar
      activeIndex={activeIndex}
      onChange={(idx) => setActiveIndex(idx)}
      searchable
      searchPlaceholder="Artists, songs, playlists..."
      searchIcon={<Search size={20} strokeWidth={2.1} />}
      closeIcon={<X size={20} strokeWidth={2.1} />}
      items={[
        { id: 'home', label: 'Home', icon: <Home size={20} strokeWidth={activeIndex === 0 ? 2.25 : 1.85} /> },
        { id: 'new', label: 'New', icon: <Compass size={20} strokeWidth={activeIndex === 1 ? 2.25 : 1.85} /> },
        { id: 'radio', label: 'Radio', icon: <Radio size={20} strokeWidth={activeIndex === 2 ? 2.25 : 1.85} /> },
        { id: 'library', label: 'Library', icon: <Library size={20} strokeWidth={activeIndex === 3 ? 2.25 : 1.85} /> },
      ]}
    />
  );
};

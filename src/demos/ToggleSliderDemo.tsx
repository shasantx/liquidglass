import React, { useState } from 'react';
import { Volume1, Sun } from 'lucide-react';
import { LiquidGlass, GlassSwitch, GlassSlider } from '../glasskit';

export const ToggleSliderDemo: React.FC = () => {
  const [spatialOn, setSpatialOn] = useState(true);
  const [adaptiveOn, setAdaptiveOn] = useState(false);
  const [volume, setVolume] = useState(64);
  const [specular, setSpecular] = useState(42);

  return (
    <div className="demo-controls-stack">
      <LiquidGlass radius={26} bezelWidth={20} className="ios-controls-card">
        <GlassSwitch
          checked={spatialOn}
          onChange={setSpatialOn}
          label="Spatial Audio"
          description="Hold or click to see droplet lens"
        />
        <div className="ios-hairline" />
        <GlassSwitch
          checked={adaptiveOn}
          onChange={setAdaptiveOn}
          label="Adaptive Transparency"
          description="Auto-adjusts glass tint over bright scenes"
        />
      </LiquidGlass>

      <LiquidGlass radius={26} bezelWidth={20} className="ios-controls-card">
        <GlassSlider
          value={volume}
          onChange={setVolume}
          ariaLabel="Output Volume"
          label={
            <>
              <Volume1 size={15} /> Output Volume
            </>
          }
        />
        <GlassSlider
          value={specular}
          onChange={setSpecular}
          accent="amber"
          ariaLabel="Display Specular"
          label={
            <>
              <Sun size={15} /> Display Specular
            </>
          }
        />
      </LiquidGlass>
    </div>
  );
};

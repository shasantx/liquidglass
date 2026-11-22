import React, { useRef, useState } from 'react';
import { Volume1, Sun } from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';

export const ToggleSliderDemo: React.FC = () => {
  const [wifiOn, setWifiOn] = useState(true);
  const [airdropOn, setAirdropOn] = useState(false);
  const [pressingToggle, setPressingToggle] = useState<string | null>(null);

  const [sliderVal, setSliderVal] = useState(64);
  const [draggingSlider, setDraggingSlider] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const [brightVal, setBrightVal] = useState(42);
  const [draggingBright, setDraggingBright] = useState(false);
  const brightTrackRef = useRef<HTMLDivElement>(null);

  const updateFromPointer = (
    clientX: number,
    ref: React.RefObject<HTMLDivElement>,
    setter: (v: number) => void
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setter(Math.max(0, Math.min(100, Math.round(pct))));
  };

  return (
    <div className="demo-controls-stack">
      {/* Row 1: iOS 26 Liquid Glass Switches */}
      <LiquidGlass radius={26} bezelWidth={20} className="ios-controls-card">
        <div className="ios-toggle-row">
          <div className="ios-toggle-meta">
            <span className="ios-toggle-title">Spatial Audio</span>
            <span className="ios-toggle-sub">Hold or click to see droplet lens</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={wifiOn}
            className={`ios-liquid-switch ${wifiOn ? 'is-on' : ''} ${
              pressingToggle === 'spatial' ? 'is-pressed' : ''
            }`}
            onPointerDown={() => setPressingToggle('spatial')}
            onPointerUp={() => setPressingToggle(null)}
            onPointerLeave={() => setPressingToggle(null)}
            onPointerCancel={() => setPressingToggle(null)}
            onClick={() => setWifiOn((v) => !v)}
          >
            <span className="ios-liquid-thumb" />
          </button>
        </div>

        <div className="ios-hairline" />

        <div className="ios-toggle-row">
          <div className="ios-toggle-meta">
            <span className="ios-toggle-title">Adaptive Transparency</span>
            <span className="ios-toggle-sub">Auto-adjusts glass tint over bright scenes</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={airdropOn}
            className={`ios-liquid-switch ${airdropOn ? 'is-on' : ''} ${
              pressingToggle === 'adaptive' ? 'is-pressed' : ''
            }`}
            onPointerDown={() => setPressingToggle('adaptive')}
            onPointerUp={() => setPressingToggle(null)}
            onPointerLeave={() => setPressingToggle(null)}
            onPointerCancel={() => setPressingToggle(null)}
            onClick={() => setAirdropOn((v) => !v)}
          >
            <span className="ios-liquid-thumb" />
          </button>
        </div>
      </LiquidGlass>

      {/* Row 2: iOS 26 Liquid Glass Magnifying Sliders */}
      <LiquidGlass radius={26} bezelWidth={20} className="ios-controls-card">
        <div className="ios-slider-block">
          <div className="ios-slider-header">
            <span className="ios-slider-label">
              <Volume1 size={15} /> Output Volume
            </span>
            <span className="ios-slider-value">{sliderVal}%</span>
          </div>

          <div
            ref={trackRef}
            className={`ios-liquid-slider ${draggingSlider ? 'is-dragging' : ''}`}
            role="slider"
            tabIndex={0}
            aria-label="Output Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sliderVal}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDraggingSlider(true);
              updateFromPointer(e.clientX, trackRef, setSliderVal);
            }}
            onPointerMove={(e) => {
              if (!draggingSlider) return;
              updateFromPointer(e.clientX, trackRef, setSliderVal);
            }}
            onPointerUp={() => setDraggingSlider(false)}
            onPointerCancel={() => setDraggingSlider(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') setSliderVal((v) => Math.min(100, v + 5));
              if (e.key === 'ArrowLeft') setSliderVal((v) => Math.max(0, v - 5));
            }}
          >
            <div className="ios-slider-track">
              <div className="ios-slider-fill" style={{ width: `${sliderVal}%` }} />
            </div>
            <div
              className="ios-slider-knob-wrap"
              style={{ left: `${sliderVal}%` }}
            >
              <div className="ios-slider-knob" />
            </div>
          </div>
        </div>

        <div className="ios-slider-block">
          <div className="ios-slider-header">
            <span className="ios-slider-label">
              <Sun size={15} /> Display Specular
            </span>
            <span className="ios-slider-value">{brightVal}%</span>
          </div>

          <div
            ref={brightTrackRef}
            className={`ios-liquid-slider ${draggingBright ? 'is-dragging' : ''}`}
            role="slider"
            tabIndex={0}
            aria-label="Display Specular"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={brightVal}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDraggingBright(true);
              updateFromPointer(e.clientX, brightTrackRef, setBrightVal);
            }}
            onPointerMove={(e) => {
              if (!draggingBright) return;
              updateFromPointer(e.clientX, brightTrackRef, setBrightVal);
            }}
            onPointerUp={() => setDraggingBright(false)}
            onPointerCancel={() => setDraggingBright(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') setBrightVal((v) => Math.min(100, v + 5));
              if (e.key === 'ArrowLeft') setBrightVal((v) => Math.max(0, v - 5));
            }}
          >
            <div className="ios-slider-track">
              <div
                className="ios-slider-fill ios-slider-fill-amber"
                style={{ width: `${brightVal}%` }}
              />
            </div>
            <div
              className="ios-slider-knob-wrap"
              style={{ left: `${brightVal}%` }}
            >
              <div className="ios-slider-knob" />
            </div>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
};

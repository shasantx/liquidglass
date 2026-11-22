import React, { useRef, useState } from 'react';
import {
  Wifi,
  Bluetooth,
  Radio,
  Plane,
  Sun,
  Volume2,
  Moon,
} from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';

export const ControlCenterDemo: React.FC = () => {
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(true);
  const [focusOn, setFocusOn] = useState(false);

  const [brightness, setBrightness] = useState(74);
  const [volume, setVolume] = useState(56);

  const brightRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'bright' | 'vol' | null>(null);

  const updateVertical = (
    clientY: number,
    ref: React.RefObject<HTMLDivElement>,
    setter: (val: number) => void
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pct = ((rect.bottom - clientY) / rect.height) * 100;
    setter(Math.max(4, Math.min(100, Math.round(pct))));
  };

  return (
    <div className="cc-grid">
      {/* Left 2x2 Connectivity Tile */}
      <LiquidGlass radius={30} bezelWidth={22} className="cc-connectivity-card">
        <div className="cc-connectivity-grid">
          <button
            type="button"
            className={`cc-orb ${airplane ? 'is-orange' : ''}`}
            onClick={() => setAirplane((v) => !v)}
            aria-label="Airplane Mode"
            aria-pressed={airplane}
          >
            <Plane size={20} />
          </button>
          <button
            type="button"
            className={`cc-orb ${wifi ? 'is-blue' : ''}`}
            onClick={() => setWifi((v) => !v)}
            aria-label="Wi-Fi"
            aria-pressed={wifi}
          >
            <Wifi size={20} />
          </button>
          <button
            type="button"
            className={`cc-orb ${bluetooth ? 'is-blue' : ''}`}
            onClick={() => setBluetooth((v) => !v)}
            aria-label="Bluetooth"
            aria-pressed={bluetooth}
          >
            <Bluetooth size={20} />
          </button>
          <button
            type="button"
            className={`cc-orb ${airdrop ? 'is-green' : ''}`}
            onClick={() => setAirdrop((v) => !v)}
            aria-label="AirDrop"
            aria-pressed={airdrop}
          >
            <Radio size={20} />
          </button>
        </div>
      </LiquidGlass>

      {/* Vertical Brightness & Volume Sliders */}
      <div className="cc-sliders-pair">
        <LiquidGlass radius={26} bezelWidth={18} className="cc-vslider-shell">
          <div
            ref={brightRef}
            className="cc-vslider"
            role="slider"
            tabIndex={0}
            aria-label="Screen Brightness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={brightness}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragging.current = 'bright';
              updateVertical(e.clientY, brightRef, setBrightness);
            }}
            onPointerMove={(e) => {
              if (dragging.current === 'bright') {
                updateVertical(e.clientY, brightRef, setBrightness);
              }
            }}
            onPointerUp={() => {
              dragging.current = null;
            }}
            onPointerCancel={() => {
              dragging.current = null;
            }}
          >
            <div className="cc-vslider-fill" style={{ height: `${brightness}%` }} />
            <div className="cc-vslider-icon">
              <Sun size={20} />
            </div>
          </div>
        </LiquidGlass>

        <LiquidGlass radius={26} bezelWidth={18} className="cc-vslider-shell">
          <div
            ref={volRef}
            className="cc-vslider"
            role="slider"
            tabIndex={0}
            aria-label="System Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volume}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragging.current = 'vol';
              updateVertical(e.clientY, volRef, setVolume);
            }}
            onPointerMove={(e) => {
              if (dragging.current === 'vol') {
                updateVertical(e.clientY, volRef, setVolume);
              }
            }}
            onPointerUp={() => {
              dragging.current = null;
            }}
            onPointerCancel={() => {
              dragging.current = null;
            }}
          >
            <div className="cc-vslider-fill" style={{ height: `${volume}%` }} />
            <div className="cc-vslider-icon">
              <Volume2 size={20} />
            </div>
          </div>
        </LiquidGlass>
      </div>

      {/* Bottom Focus Pill */}
      <LiquidGlass
        radius={999}
        bezelWidth={18}
        variant={focusOn ? 'tinted' : 'clear'}
        className="cc-focus-pill-wrap"
      >
        <button
          type="button"
          className={`cc-focus-pill ${focusOn ? 'is-on' : ''}`}
          onClick={() => setFocusOn((v) => !v)}
          aria-pressed={focusOn}
        >
          <span className="cc-focus-icon">
            <Moon size={16} fill={focusOn ? 'currentColor' : 'none'} />
          </span>
          <span className="cc-focus-text">
            <strong>Do Not Disturb</strong>
            <small>{focusOn ? 'On until 7:00 PM' : 'Off'}</small>
          </span>
        </button>
      </LiquidGlass>
    </div>
  );
};

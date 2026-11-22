import React from 'react';
import { BackdropTheme } from '../context/GlassSettingsContext';
import { TabBarDemo } from '../demos/TabBarDemo';
import { ToggleSliderDemo } from '../demos/ToggleSliderDemo';
import { SegmentedControlDemo } from '../demos/SegmentedControlDemo';
import { ButtonsDemo } from '../demos/ButtonsDemo';
import { ControlCenterDemo } from '../demos/ControlCenterDemo';
import { MediaPlayerDemo } from '../demos/MediaPlayerDemo';
import { ContextMenuDemo } from '../demos/ContextMenuDemo';
import { NotificationsDemo } from '../demos/NotificationsDemo';
import { AlertSheetDemo } from '../demos/AlertSheetDemo';
import { DockDemo } from '../demos/DockDemo';

export interface LibraryComponentSpec {
  id: string;
  name: string;
  category: 'Navigation' | 'Controls' | 'Widgets' | 'Overlays';
  description: string;
  defaultBackdrop: BackdropTheme;
  component: React.FC;
  htmlCss: string;
  react: string;
}

export const CORE_ENGINE_CSS = `/* 1. Crystal-Clear Apple Liquid Glass utility (drop once in your stylesheet) */
.liquid-glass {
  position: relative;
  overflow: hidden;
  border-radius: var(--glass-radius, 24px);
  /* Very low fill opacity so optical refraction stays crisp & wet, not milky */
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(255, 255, 255, 0.04) 48%,
    rgba(255, 255, 255, 0.09) 100%
  );
  backdrop-filter: url(#liquid-glass-refract) saturate(175%) brightness(1.06);
  -webkit-backdrop-filter: blur(14px) saturate(190%) brightness(1.05);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.78),
    inset 0 -1px 2px rgba(255, 255, 255, 0.25),
    inset 1px 0 1px rgba(255, 255, 255, 0.34),
    0 20px 44px rgba(0, 0, 0, 0.28),
    0 4px 12px rgba(0, 0, 0, 0.16);
}

/* Dual-angle Fresnel specular rim hairline */
.liquid-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    138deg,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(255, 255, 255, 0.14) 36%,
    rgba(255, 255, 255, 0.06) 66%,
    rgba(255, 255, 255, 0.62) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Graceful fallback for Safari & Firefox where SVG backdrop-filter URL is unsupported */
@supports not (backdrop-filter: url(#liquid-glass-refract)) {
  .liquid-glass {
    backdrop-filter: blur(14px) saturate(190%) brightness(1.05);
  }
}`;

export const CORE_ENGINE_SVG_JS = `<!-- 2. Drop this hidden SVG filter once near <body> to enable live DOM edge refraction -->
<svg width="0" height="0" style="position:fixed;pointer-events:none" aria-hidden="true">
  <defs>
    <filter id="liquid-glass-refract" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="blur" />
      <feImage id="lg-disp-img" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
      <feDisplacementMap in="blur" in2="map" scale="48" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
</svg>

<script>
  // Generates a Snell's law convex squircle displacement map once on page load
  (function initLiquidGlassFilter() {
    const w = 256, h = 128, r = 64, bezel = 28, ior = 1.54;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const py = y + 0.5 - h / 2;
      for (let x = 0; x < w; x++) {
        const px = x + 0.5 - w / 2;
        const bx = w / 2 - r, by = h / 2 - r;
        const qx = Math.abs(px) - bx, qy = Math.abs(py) - by;
        const sdf = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
        const idx = (y * w + x) * 4;
        let dx = 0, dy = 0;
        if (sdf <= 0 && -sdf < bezel) {
          const t = Math.max(0.015, -sdf / bezel);
          const u = 1 - t;
          const slope = (u ** 3) / Math.pow(Math.max(0.0008, 1 - u ** 4), 0.75);
          const a1 = Math.atan(slope);
          const a2 = Math.asin(Math.min(0.995, Math.sin(a1) / ior));
          const mag = Math.min(1, Math.tan(a1 - a2) * 0.92);
          const sx = px >= 0 ? 1 : -1, sy = py >= 0 ? 1 : -1;
          const nx = qx > 0 || qy > 0 ? sx * Math.max(qx, 0) : (qx > qy ? sx : 0);
          const ny = qx > 0 || qy > 0 ? sy * Math.max(qy, 0) : (qx > qy ? 0 : sy);
          const len = Math.hypot(nx, ny) || 1;
          dx = -(nx / len) * mag;
          dy = -(ny / len) * mag;
        }
        img.data[idx] = Math.round(128 + dx * 127);
        img.data[idx + 1] = Math.round(128 + dy * 127);
        img.data[idx + 2] = 128;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    document.getElementById('lg-disp-img')?.setAttribute('href', c.toDataURL());
  })();
</script>`;

export const CORE_ENGINE_WEBGL = `// 3. Universal WebGL2 Fragment Shader (Chrome, Safari, Firefox — 60-120fps)
// Features: Snell's law convex bevel refraction, RGB chromatic dispersion,
// Schlick Fresnel grazing reflections, Blinn-Phong rim speculars, and smin metaball merging.
#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uBg;
uniform vec2 uRes;
uniform vec2 uPillPos;
uniform vec2 uDropPos;

float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float mapScene(vec2 p, float aspect) {
  float dPill = sdRoundedBox(p - (uPillPos - 0.5) * vec2(aspect, 1.0), vec2(0.30, 0.115), 0.115);
  float dDrop = length(p - (uDropPos - 0.5) * vec2(aspect, 1.0)) - 0.072;
  return smin(dPill, dDrop, 0.085);
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float d = mapScene(p, aspect);
  vec3 bg = texture(uBg, vUv).rgb;

  float mask = smoothstep(1.3 / uRes.y, -1.3 / uRes.y, d);
  if (mask <= 0.001) { fragColor = vec4(bg, 1.0); return; }

  float e = 0.002;
  vec2 n = normalize(vec2(
    mapScene(p + vec2(e, 0.0), aspect) - mapScene(p - vec2(e, 0.0), aspect),
    mapScene(p + vec2(0.0, e), aspect) - mapScene(p - vec2(0.0, e), aspect)
  ));

  float bezel = 0.08;
  float t = clamp(max(0.0, -d) / bezel, 0.0, 1.0);
  float bevelCurve = pow(1.0 - t, 2.2);
  vec2 dirUv = -n / vec2(aspect, 1.0);

  // Chromatic dispersion (R / G / B slightly offset IOR)
  float r = texture(uBg, clamp(vUv + dirUv * bevelCurve * 0.055, 0.002, 0.998)).r;
  float g = texture(uBg, clamp(vUv + dirUv * bevelCurve * 0.062, 0.002, 0.998)).g;
  float b = texture(uBg, clamp(vUv + dirUv * bevelCurve * 0.070, 0.002, 0.998)).b;
  vec3 refracted = vec3(r, g, b);

  // Directional Fresnel rim specular
  float rim = pow(1.0 - clamp(max(0.0, -d) / (bezel * 0.25), 0.0, 1.0), 2.2);
  float spec = 0.25 + 0.85 * max(0.0, dot(n, normalize(vec2(-0.7, 0.7))));
  vec3 glass = refracted * 1.05 + vec3(1.0) * rim * spec * 0.65;

  fragColor = vec4(mix(bg, glass, mask), 1.0);
}`;

export const LIBRARY_COMPONENTS: LibraryComponentSpec[] = [
  {
    id: 'floating-tab-bar',
    name: 'Floating Tab Bar',
    category: 'Navigation',
    description:
      'iOS 26 floating glass capsule with a spring-gliding active lens pill and a detached search orb that expands into a glass input.',
    defaultBackdrop: 'alpine',
    component: TabBarDemo,
    htmlCss: `<!-- Floating Liquid Glass Tab Bar -->
<nav class="lg-tabbar-row" aria-label="Primary">
  <div class="liquid-glass lg-tabbar" style="--glass-radius: 999px">
    <div class="lg-tabbar-indicator" style="transform: translateX(0%)"></div>
    <button class="lg-tab is-active">Home</button>
    <button class="lg-tab">New</button>
    <button class="lg-tab">Radio</button>
    <button class="lg-tab">Library</button>
  </div>
  <button class="liquid-glass lg-search-orb" style="--glass-radius: 999px" aria-label="Search">
    ⌕
  </button>
</nav>

<style>
.lg-tabbar-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.lg-tabbar {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(72px, 1fr));
  padding: 6px;
}
.lg-tabbar-indicator {
  position: absolute;
  top: 6px;
  left: 6px;
  width: calc(25% - 3px);
  height: calc(100% - 12px);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.34);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0,0,0,0.12);
  transition: transform 0.42s cubic-bezier(0.32, 1.25, 0.48, 1);
}
.lg-tab {
  position: relative;
  z-index: 1;
  border: 0;
  background: none;
  padding: 10px 14px;
  font: 600 13px/1 -apple-system, BlinkMacSystemFont, sans-serif;
  color: rgba(255, 255, 255, 0.86);
  cursor: pointer;
}
.lg-tab.is-active { color: #ffffff; }
.lg-search-orb {
  width: 52px;
  height: 52px;
  border: 0;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { GlassStage, GlassTabBar } from 'glasskit-liquid-glass';
import { Home, Compass, Radio, Library } from 'lucide-react';

export function FloatingTabBarExample() {
  return (
    <GlassStage scene="tahoe" style={{ height: 320 }}>
      <GlassTabBar
        searchable
        searchPlaceholder="Artists, songs, playlists..."
        items={[
          { id: 'home', label: 'Home', icon: <Home size={20} /> },
          { id: 'new', label: 'New', icon: <Compass size={20} /> },
          { id: 'radio', label: 'Radio', icon: <Radio size={20} /> },
          { id: 'library', label: 'Library', icon: <Library size={20} /> },
        ]}
      />
    </GlassStage>
  );
}`,
  },
  {
    id: 'liquid-toggle-slider',
    name: 'Liquid Toggle & Slider',
    category: 'Controls',
    description:
      'Pressing or dragging expands the solid white thumb into a translucent, refracting glass droplet before settling back with spring inertia.',
    defaultBackdrop: 'light',
    component: ToggleSliderDemo,
    htmlCss: `<!-- Liquid Glass Toggle Switch -->
<button class="ios-switch is-on" role="switch" aria-checked="true" onclick="this.classList.toggle('is-on')">
  <span class="ios-switch-thumb"></span>
</button>

<!-- Liquid Glass Magnifying Slider -->
<input class="ios-slider" type="range" min="0" max="100" value="64" />

<style>
.ios-switch {
  position: relative;
  width: 60px;
  height: 34px;
  border-radius: 999px;
  border: 0;
  background: rgba(120, 120, 128, 0.36);
  cursor: pointer;
  transition: background 0.28s ease;
}
.ios-switch.is-on { background: #34C759; }
.ios-switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 34px;
  height: 28px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 3px 10px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.9);
  transition: transform 0.36s cubic-bezier(0.32, 1.32, 0.5, 1), background 0.2s, backdrop-filter 0.2s;
}
.ios-switch.is-on .ios-switch-thumb {
  transform: translateX(20px);
}
/* Droplet refraction state while held */
.ios-switch:active .ios-switch-thumb {
  transform: translateX(10px) scale(1.22, 1.18);
  background: rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(4px) saturate(180%);
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.9), 0 8px 20px rgba(0,0,0,0.18);
}
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { useState } from 'react';
import { GlassStage, LiquidGlass, GlassSwitch, GlassSlider } from 'glasskit-liquid-glass';

export function ToggleSliderExample() {
  const [spatial, setSpatial] = useState(true);
  const [volume, setVolume] = useState(64);

  return (
    <GlassStage scene="light" tone="light" style={{ height: 320 }}>
      <LiquidGlass radius={26} bezelWidth={20} className="ios-controls-card">
        <GlassSwitch
          checked={spatial}
          onChange={setSpatial}
          label="Spatial Audio"
          description="Hold or click to see droplet lens"
        />
        <div className="ios-hairline" />
        <GlassSlider
          value={volume}
          onChange={setVolume}
          label="Output Volume"
        />
      </LiquidGlass>
    </GlassStage>
  );
}`,
  },
  {
    id: 'segmented-control',
    name: 'Segmented Control',
    category: 'Controls',
    description:
      'Fluid multi-segment selector with a luminous specular glass thumb that glides cleanly between labels or icons.',
    defaultBackdrop: 'sunset',
    component: SegmentedControlDemo,
    htmlCss: `<div class="liquid-glass lg-segmented" style="--glass-radius: 999px" role="tablist">
  <div class="lg-seg-thumb" style="transform: translateX(100%)"></div>
  <button role="tab">Years</button>
  <button role="tab" aria-selected="true">Months</button>
  <button role="tab">Days</button>
  <button role="tab">All Photos</button>
</div>

<style>
.lg-segmented {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 4px;
  min-width: 340px;
}
.lg-seg-thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(25% - 2px);
  height: calc(100% - 8px);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,255,255,0.48), rgba(255,255,255,0.26));
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.85), 0 4px 14px rgba(0,0,0,0.14);
  transition: transform 0.38s cubic-bezier(0.32, 1.25, 0.48, 1);
}
.lg-segmented button {
  position: relative;
  z-index: 1;
  border: 0;
  background: none;
  padding: 9px 14px;
  font: 600 13px/1 -apple-system, sans-serif;
  color: rgba(255,255,255,0.92);
  cursor: pointer;
}
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { useState } from 'react';
import { GlassStage, GlassSegmentedControl } from 'glasskit-liquid-glass';

export function SegmentedExample() {
  const [selected, setSelected] = useState(1);

  return (
    <GlassStage scene="sunset" style={{ height: 280 }}>
      <GlassSegmentedControl
        value={selected}
        onChange={(idx) => setSelected(idx)}
        options={[
          { id: 'years', label: 'Years' },
          { id: 'months', label: 'Months' },
          { id: 'days', label: 'Days' },
          { id: 'all', label: 'All Photos' },
        ]}
      />
    </GlassStage>
  );
}`,
  },
  {
    id: 'glass-buttons',
    name: 'Buttons & Action Capsule',
    category: 'Controls',
    description:
      'Clear, prominent azure-tinted, and grouped toolbar buttons with tactile spring compression and crisp specular rims.',
    defaultBackdrop: 'alpine',
    component: ButtonsDemo,
    htmlCss: `<div class="lg-btn-group">
  <button class="liquid-glass lg-btn" style="--glass-radius: 999px">
    ▶ Play Preview
  </button>
  <button class="liquid-glass lg-btn lg-btn-prominent" style="--glass-radius: 999px">
    Get GlassKit
  </button>
  <div class="liquid-glass lg-toolbar-pill" style="--glass-radius: 999px">
    <button aria-label="Favorite">♡</button>
    <span class="divider"></span>
    <button aria-label="Bookmark">⚑</button>
    <span class="divider"></span>
    <button aria-label="Share">↗</button>
  </div>
</div>

<style>
.lg-btn-group { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.lg-btn {
  border: 0;
  padding: 12px 22px;
  color: #fff;
  font: 600 14px/1 -apple-system, sans-serif;
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lg-btn:active { transform: scale(0.95); }
.lg-btn-prominent {
  background: linear-gradient(145deg, rgba(0, 122, 255, 0.78), rgba(10, 132, 255, 0.56));
}
.lg-toolbar-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 6px;
}
.lg-toolbar-pill button {
  width: 38px; height: 38px; border: 0; background: none; color: #fff; cursor: pointer; border-radius: 999px;
}
.lg-toolbar-pill button:hover { background: rgba(255,255,255,0.18); }
.lg-toolbar-pill .divider { width: 1px; height: 18px; background: rgba(255,255,255,0.26); }
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { GlassStage, GlassButton, GlassButtonGroup, GlassIconButton } from 'glasskit-liquid-glass';
import { Play, Sparkles, Heart, Bookmark, Share, Plus } from 'lucide-react';

export function ButtonsExample() {
  return (
    <GlassStage scene="tahoe" style={{ height: 300 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <GlassButton variant="clear" icon={<Play size={16} fill="currentColor" />}>
          Play Preview
        </GlassButton>
        <GlassButton variant="prominent" icon={<Sparkles size={16} />}>
          Get GlassKit
        </GlassButton>
        <GlassButtonGroup
          actions={[
            { id: 'like', ariaLabel: 'Favorite', icon: <Heart size={18} /> },
            { id: 'save', ariaLabel: 'Bookmark', icon: <Bookmark size={18} /> },
            { id: 'share', ariaLabel: 'Share', icon: <Share size={18} /> },
          ]}
        />
        <GlassIconButton aria-label="Add"><Plus size={20} /></GlassIconButton>
      </div>
    </GlassStage>
  );
}`,
  },
  {
    id: 'control-center',
    name: 'Control Center Modules',
    category: 'Widgets',
    description:
      'Interactive 2×2 connectivity orb tile, draggable vertical brightness and volume glass sliders, and a Focus mode pill.',
    defaultBackdrop: 'sunset',
    component: ControlCenterDemo,
    htmlCss: `<div class="cc-layout">
  <div class="liquid-glass cc-tile" style="--glass-radius: 30px">
    <button class="cc-orb is-active">Wi-Fi</button>
    <button class="cc-orb is-active">BT</button>
    <button class="cc-orb">Air</button>
    <button class="cc-orb is-green">Drop</button>
  </div>
  <div class="liquid-glass cc-vslider" style="--glass-radius: 26px">
    <div class="cc-vslider-fill" style="height: 72%"></div>
    <span class="cc-vslider-icon">☀</span>
  </div>
</div>

<style>
.cc-layout { display: flex; gap: 16px; align-items: stretch; }
.cc-tile {
  display: grid;
  grid-template-columns: repeat(2, 54px);
  gap: 12px;
  padding: 16px;
}
.cc-orb {
  height: 54px;
  border-radius: 999px;
  border: 0;
  background: rgba(255,255,255,0.2);
  color: #fff;
  font: 600 12px/1 -apple-system, sans-serif;
  cursor: pointer;
}
.cc-orb.is-active { background: #007AFF; }
.cc-orb.is-green { background: #34C759; }
.cc-vslider {
  position: relative;
  width: 68px;
  height: 152px;
  cursor: ns-resize;
}
.cc-vslider-fill {
  position: absolute;
  inset: auto 0 0 0;
  background: rgba(255,255,255,0.88);
  transition: height 0.12s ease-out;
}
.cc-vslider-icon {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  color: #1d1d1f;
  font-size: 18px;
}
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { useState } from 'react';
import { GlassStage, GlassControlCenter } from 'glasskit-liquid-glass';
import { Wifi, Bluetooth, Radio, Plane, Sun, Volume2, Moon } from 'lucide-react';

export function ControlCenterExample() {
  const [wifi, setWifi] = useState(true);
  const [brightness, setBrightness] = useState(74);
  const [volume, setVolume] = useState(56);
  const [focus, setFocus] = useState(false);

  return (
    <GlassStage scene="sunset" style={{ height: 380 }}>
      <GlassControlCenter
        orbs={[
          { id: 'air', label: 'Airplane', icon: <Plane size={20} />, active: false, tone: 'orange', onToggle: () => {} },
          { id: 'wifi', label: 'Wi-Fi', icon: <Wifi size={20} />, active: wifi, tone: 'blue', onToggle: () => setWifi((v) => !v) },
          { id: 'bt', label: 'Bluetooth', icon: <Bluetooth size={20} />, active: true, tone: 'blue', onToggle: () => {} },
          { id: 'drop', label: 'AirDrop', icon: <Radio size={20} />, active: true, tone: 'green', onToggle: () => {} },
        ]}
        sliders={[
          { ariaLabel: 'Brightness', value: brightness, onChange: setBrightness, icon: <Sun size={20} /> },
          { ariaLabel: 'Volume', value: volume, onChange: setVolume, icon: <Volume2 size={20} /> },
        ]}
        focus={{
          title: 'Do Not Disturb',
          subtitle: focus ? 'On until 7:00 PM' : 'Off',
          icon: <Moon size={16} />,
          active: focus,
          onToggle: () => setFocus((v) => !v),
        }}
      />
    </GlassStage>
  );
}`,
  },
  {
    id: 'media-player',
    name: 'Now Playing Glass Card',
    category: 'Widgets',
    description:
      'Apple Music floating glass player with live scrubbing, play/pause toggle, track switching, chromatic bezel dispersion, and adaptive specular highlights.',
    defaultBackdrop: 'alpine',
    component: MediaPlayerDemo,
    htmlCss: `<div class="liquid-glass media-card" style="--glass-radius: 38px">
  <div class="media-head">
    <div class="media-art"></div>
    <div>
      <strong>Old Scratch Blues</strong>
      <small>Jack White</small>
    </div>
  </div>
  <input type="range" class="media-range" value="18" />
  <div class="media-controls">
    <button aria-label="Previous">⏮</button>
    <button class="media-play" aria-label="Play">⏸</button>
    <button aria-label="Next">⏭</button>
  </div>
</div>

<style>
.media-card { width: 320px; padding: 20px; color: #fff; font-family: -apple-system, sans-serif; }
.media-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.media-art {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, #38bdf8, #6366f1, #ec4899);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
}
.media-head strong { display: block; font-size: 15px; }
.media-head small { opacity: 0.72; font-size: 13px; }
.media-range { width: 100%; accent-color: #fff; }
.media-controls { display: flex; justify-content: center; gap: 24px; margin-top: 12px; }
.media-controls button { border: 0; background: none; color: #fff; font-size: 18px; cursor: pointer; }
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { GlassStage, GlassMediaPlayer } from 'glasskit-liquid-glass';

export function MediaPlayerExample() {
  return (
    <GlassStage backgroundImage="/your-wallpaper.jpg" style={{ height: 400 }}>
      <GlassMediaPlayer
        tracks={[
          {
            title: 'Old Scratch Blues',
            artist: 'Jack White',
            duration: 173,
            artworkGradient: 'linear-gradient(135deg, #34d399, #0ea5e9, #1d4ed8)',
          },
          {
            title: 'Specular Drift',
            artist: 'Solstice Radio',
            duration: 242,
            artworkGradient: 'linear-gradient(135deg, #fb923c, #f43f5e, #a855f7)',
          },
        ]}
      />
    </GlassStage>
  );
}`,
  },
  {
    id: 'context-menu',
    name: 'Context Menu & Popover',
    category: 'Overlays',
    description:
      'Spring-blooming Liquid Glass popover menu with a horizontal quick-actions bar, keyboard shortcuts, and destructive row styling.',
    defaultBackdrop: 'light',
    component: ContextMenuDemo,
    htmlCss: `<div class="liquid-glass ctx-menu" style="--glass-radius: 24px" role="menu">
  <div class="ctx-quick">
    <button>Copy</button>
    <button>Share</button>
    <button>Star</button>
  </div>
  <hr />
  <button role="menuitem"><span>Rename</span><kbd>⌘R</kbd></button>
  <button role="menuitem"><span>Move to Folder</span><kbd>⇧⌘M</kbd></button>
  <hr />
  <button role="menuitem" class="danger"><span>Delete</span><kbd>⌫</kbd></button>
</div>

<style>
.ctx-menu { width: 248px; padding: 8px; font-family: -apple-system, sans-serif; }
.ctx-quick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 6px; }
.ctx-quick button {
  border: 0; background: rgba(255,255,255,0.16); color: inherit;
  padding: 10px 6px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer;
}
.ctx-menu hr { border: 0; height: 1px; background: rgba(120,120,128,0.2); margin: 6px 4px; }
.ctx-menu [role="menuitem"] {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  border: 0; background: none; padding: 9px 12px; border-radius: 12px;
  font-size: 14px; color: inherit; cursor: pointer;
}
.ctx-menu [role="menuitem"]:hover { background: rgba(255,255,255,0.25); }
.ctx-menu .danger { color: #ff3b30; }
.ctx-menu kbd { font-size: 12px; opacity: 0.6; font-family: inherit; }
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { GlassStage, GlassContextMenu } from 'glasskit-liquid-glass';
import { Copy, Share, Star, Edit3, Trash2 } from 'lucide-react';

export function ContextMenuExample() {
  return (
    <GlassStage scene="light" tone="light" style={{ height: 380 }}>
      <GlassContextMenu
        quickActions={[
          { id: 'copy', label: 'Copy', icon: <Copy size={16} /> },
          { id: 'share', label: 'Share', icon: <Share size={16} /> },
          { id: 'star', label: 'Star', icon: <Star size={16} /> },
        ]}
        items={[
          { id: 'rename', label: 'Rename', icon: <Edit3 size={15} />, shortcut: '⌘R' },
          { id: 'delete', label: 'Delete', icon: <Trash2 size={15} />, shortcut: '⌫', destructive: true, dividerBefore: true },
        ]}
      />
    </GlassStage>
  );
}`,
  },
  {
    id: 'notifications-stack',
    name: 'Notification Stack',
    category: 'Overlays',
    description:
      'Collapsible iOS 26 Liquid Glass notification banners that smoothly fan out or fold into a depth-scaled stack.',
    defaultBackdrop: 'alpine',
    component: NotificationsDemo,
    htmlCss: `<div class="liquid-glass notif-banner" style="--glass-radius: 24px">
  <div class="notif-badge">💬</div>
  <div class="notif-body">
    <div class="notif-row">
      <strong>Maya Lin</strong>
      <time>now</time>
    </div>
    <p>The new optical glass prototype feels unreal on the studio display.</p>
  </div>
</div>

<style>
.notif-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 380px;
  padding: 14px 16px;
  color: #fff;
  font-family: -apple-system, sans-serif;
}
.notif-badge {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  display: grid; place-items: center; background: #34C759;
}
.notif-row { display: flex; justify-content: space-between; font-size: 14px; }
.notif-row time { opacity: 0.65; font-size: 12px; }
.notif-body p { margin: 3px 0 0; font-size: 13px; opacity: 0.88; line-height: 1.35; }
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { useState } from 'react';
import { GlassStage, GlassNotificationStack } from 'glasskit-liquid-glass';

const INITIAL = [
  { id: '1', title: 'Maya Lin', body: 'The new optical glass prototype feels unreal.', time: 'now' },
  { id: '2', title: 'Design Critique', body: 'Starting in 10 minutes in Studio B.', time: '4m ago' },
];

export function NotificationStackExample() {
  const [items, setItems] = useState(INITIAL);

  return (
    <GlassStage scene="tahoe" style={{ height: 360 }}>
      <GlassNotificationStack
        items={items}
        onDismiss={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
        canRestore={items.length < INITIAL.length}
        onRestore={() => setItems(INITIAL)}
      />
    </GlassStage>
  );
}`,
  },
  {
    id: 'alert-dialog',
    name: 'Alert Dialog Sheet',
    category: 'Overlays',
    description:
      'iOS 26 centered Liquid Glass modal sheet with soft concentric corner geometry and pill-shaped primary and secondary actions.',
    defaultBackdrop: 'light',
    component: AlertSheetDemo,
    htmlCss: `<div class="liquid-glass ios-alert" style="--glass-radius: 32px" role="dialog" aria-modal="true">
  <h3>Publish Design Tokens?</h3>
  <p>Updates to refraction curves and corner radii will apply immediately across connected apps.</p>
  <div class="ios-alert-actions">
    <button class="btn-muted">Not Now</button>
    <button class="btn-blue">Publish</button>
  </div>
</div>

<style>
.ios-alert {
  width: 310px;
  padding: 24px 20px 18px;
  text-align: center;
  font-family: -apple-system, sans-serif;
}
.ios-alert h3 { margin: 0 0 8px; font-size: 17px; font-weight: 700; }
.ios-alert p { margin: 0 0 20px; font-size: 13.5px; line-height: 1.45; opacity: 0.82; }
.ios-alert-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ios-alert-actions button {
  border: 0; border-radius: 999px; padding: 12px; font-weight: 600; font-size: 14px; cursor: pointer;
}
.btn-muted { background: rgba(120,120,128,0.22); color: inherit; }
.btn-blue { background: #007AFF; color: #fff; }
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { GlassStage, GlassAlertSheet } from 'glasskit-liquid-glass';
import { CloudUpload } from 'lucide-react';

export function AlertDialogExample() {
  return (
    <GlassStage scene="light" tone="light" style={{ height: 360 }}>
      <GlassAlertSheet
        icon={<CloudUpload size={26} />}
        title="Publish Design Tokens?"
        description="Updates to refraction curves and corner radii will apply immediately across connected apps."
        secondaryLabel="Not Now"
        primaryLabel="Publish"
        onPrimary={() => console.log('Published!')}
      />
    </GlassStage>
  );
}`,
  },
  {
    id: 'macos-dock',
    name: 'macOS Tahoe Dock',
    category: 'Navigation',
    description:
      'Floating desktop Liquid Glass dock with full macOS Tahoe icon set, hairline utility divider, cursor-proximity magnification, and running indicators.',
    defaultBackdrop: 'alpine',
    component: DockDemo,
    htmlCss: `<div class="liquid-glass mac-dock" style="--glass-radius: 26px">
  <button class="dock-app" style="background: linear-gradient(#60a5fa, #2563eb)">F</button>
  <button class="dock-app" style="background: linear-gradient(#38bdf8, #0284c7)">S</button>
  <button class="dock-app" style="background: linear-gradient(#4ade80, #16a34a)">M</button>
  <button class="dock-app" style="background: linear-gradient(#fb7185, #e11d48)">♫</button>
  <button class="dock-app" style="background: linear-gradient(#374151, #111827)">&gt;_</button>
</div>

<style>
.mac-dock {
  display: inline-flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 14px;
}
.dock-app {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 13px;
  color: #fff;
  font: 700 18px/1 -apple-system, sans-serif;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.45);
  transition: transform 0.24s cubic-bezier(0.32, 1.4, 0.5, 1);
}
.dock-app:hover {
  transform: translateY(-10px) scale(1.32);
}
</style>`,
    react: `import 'glasskit-liquid-glass/styles.css';
import { GlassStage, GlassDock } from 'glasskit-liquid-glass';

export function MacDockExample() {
  return (
    <GlassStage backgroundImage="/your-wallpaper.jpg" style={{ height: 280 }}>
      <GlassDock
        items={[
          { id: 'finder', name: 'Finder', icon: <img src="/icons/finder.png" width={42} height={42} alt="" />, running: true },
          { id: 'safari', name: 'Safari', icon: <img src="/icons/safari.png" width={42} height={42} alt="" />, running: true },
          { id: 'music', name: 'Music', icon: <img src="/icons/music.png" width={42} height={42} alt="" /> },
        ]}
        utilityItems={[
          { id: 'trash', name: 'Trash', icon: <img src="/icons/trash.png" width={42} height={42} alt="" /> },
        ]}
      />
    </GlassStage>
  );
}`,
  },
];

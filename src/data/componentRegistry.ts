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
    react: `import { useState } from 'react';
import { Home, Compass, Radio, Library, Search } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'new', label: 'New', icon: Compass },
  { id: 'radio', label: 'Radio', icon: Radio },
  { id: 'library', label: 'Library', icon: Library },
];

export function LiquidTabBar() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <nav className="liquid-glass relative grid grid-cols-4 p-1.5 rounded-full">
        <div
          className="absolute top-1.5 left-1.5 h-[calc(100%-12px)] w-[calc(25%-3px)] rounded-full bg-white/30 shadow-inner transition-transform duration-500 ease-[cubic-bezier(0.32,1.25,0.48,1)]"
          style={{ transform: \`translateX(\${active * 100}%)\` }}
        />
        {TABS.map(({ id, label, icon: Icon }, i) => (
          <button
            key={id}
            onClick={() => setActive(i)}
            className="relative z-10 flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-white"
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <button className="liquid-glass grid h-14 w-14 place-items-center rounded-full text-white">
        <Search size={20} />
      </button>
    </div>
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
    react: `import { useState } from 'react';

export function LiquidSwitch({ label }: { label: string }) {
  const [checked, setChecked] = useState(true);
  const [pressed, setPressed] = useState(false);

  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={() => setChecked((v) => !v)}
        className={\`relative h-8 w-14 rounded-full transition-colors \${
          checked ? 'bg-[#34C759]' : 'bg-white/25'
        }\`}
      >
        <span
          className={\`absolute top-0.5 left-0.5 h-7 w-8 rounded-full transition-all duration-300 \${
            checked ? 'translate-x-5' : 'translate-x-0'
          } \${
            pressed
              ? 'scale-125 bg-white/30 backdrop-blur-sm ring-1 ring-white/80'
              : 'bg-white shadow-md'
          }\`}
        />
      </button>
    </label>
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
    react: `import { useState } from 'react';

export function LiquidSegmented({ options }: { options: string[] }) {
  const [selected, setSelected] = useState(0);

  return (
    <div
      className="liquid-glass relative grid p-1 rounded-full"
      style={{ gridTemplateColumns: \`repeat(\${options.length}, 1fr)\` }}
      role="tablist"
    >
      <div
        className="absolute top-1 left-1 h-[calc(100%-8px)] rounded-full bg-white/35 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,1.25,0.48,1)]"
        style={{
          width: \`calc(\${100 / options.length}% - 2px)\`,
          transform: \`translateX(\${selected * 100}%)\`,
        }}
      />
      {options.map((label, idx) => (
        <button
          key={label}
          role="tab"
          aria-selected={selected === idx}
          onClick={() => setSelected(idx)}
          className="relative z-10 px-4 py-2 text-xs font-semibold text-white"
        >
          {label}
        </button>
      ))}
    </div>
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
    react: `export function LiquidButton({
  children,
  prominent = false,
  onClick,
}: {
  children: React.ReactNode;
  prominent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={\`liquid-glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-transform active:scale-95 \${
        prominent ? 'bg-[#007AFF]/70' : ''
      }\`}
    >
      {children}
    </button>
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
    react: `import { useState } from 'react';
import { Sun } from 'lucide-react';

export function VerticalGlassSlider() {
  const [value, setValue] = useState(72);

  return (
    <div
      className="liquid-glass relative h-40 w-16 cursor-ns-resize overflow-hidden rounded-[26px]"
      onPointerMove={(e) => {
        if (e.buttons !== 1) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = ((rect.bottom - e.clientY) / rect.height) * 100;
        setValue(Math.max(5, Math.min(100, Math.round(pct))));
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 bg-white/90 transition-[height]"
        style={{ height: \`\${value}%\` }}
      />
      <Sun size={20} className="absolute bottom-3.5 left-1/2 -translate-x-1/2 text-neutral-800" />
    </div>
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
    react: `import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export function NowPlayingGlass() {
  const [playing, setPlaying] = useState(true);

  return (
    <div className="liquid-glass w-80 rounded-[30px] p-5 text-white">
      <div className="flex items-center gap-3.5">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-pink-500 shadow-lg" />
        <div>
          <p className="text-sm font-semibold">Midnight Refraction</p>
          <p className="text-xs text-white/70">Cupertino Ensemble</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-6">
        <button aria-label="Previous"><SkipBack size={20} fill="currentColor" /></button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/20"
        >
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        <button aria-label="Next"><SkipForward size={20} fill="currentColor" /></button>
      </div>
    </div>
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
    react: `export function LiquidContextMenu() {
  return (
    <div className="liquid-glass w-64 rounded-3xl p-2 text-sm" role="menu">
      <div className="grid grid-cols-3 gap-1 pb-1.5">
        {['Copy', 'Share', 'Star'].map((act) => (
          <button key={act} className="rounded-xl bg-white/20 py-2 text-xs font-semibold hover:bg-white/30">
            {act}
          </button>
        ))}
      </div>
      <div className="my-1 h-px bg-black/10" />
      <button role="menuitem" className="flex w-full justify-between rounded-xl px-3 py-2 hover:bg-white/25">
        <span>Rename</span>
        <kbd className="opacity-60">⌘R</kbd>
      </button>
      <button role="menuitem" className="flex w-full justify-between rounded-xl px-3 py-2 text-red-500 hover:bg-red-500/15">
        <span>Delete</span>
        <kbd className="opacity-60">⌫</kbd>
      </button>
    </div>
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
    react: `export function NotificationBanner({
  title,
  body,
  time = 'now',
}: {
  title: string;
  body: string;
  time?: string;
}) {
  return (
    <div className="liquid-glass flex max-w-sm items-center gap-3 rounded-3xl p-4 text-white">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#34C759] font-semibold">
        M
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{title}</span>
          <span className="text-xs font-normal text-white/65">{time}</span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-white/85">{body}</p>
      </div>
    </div>
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
    react: `export function LiquidAlertDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="liquid-glass w-80 rounded-[32px] p-6 text-center" role="dialog">
      <h3 className="text-base font-bold">Publish Design Tokens?</h3>
      <p className="mt-2 text-xs leading-relaxed opacity-80">
        Updates to refraction curves and corner radii will apply immediately.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button onClick={onCancel} className="rounded-full bg-black/10 py-2.5 text-sm font-semibold">
          Not Now
        </button>
        <button onClick={onConfirm} className="rounded-full bg-[#007AFF] py-2.5 text-sm font-semibold text-white">
          Publish
        </button>
      </div>
    </div>
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
    react: `import { useState } from 'react';

export function MacLiquidDock({ apps }: { apps: { id: string; label: string; color: string }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="liquid-glass inline-flex items-end gap-2.5 rounded-[26px] px-3.5 py-2.5"
      onMouseLeave={() => setHovered(null)}
    >
      {apps.map((app, i) => {
        const dist = hovered === null ? 99 : Math.abs(hovered - i);
        const scale = dist === 0 ? 1.36 : dist === 1 ? 1.16 : 1;
        return (
          <button
            key={app.id}
            onMouseEnter={() => setHovered(i)}
            style={{
              background: app.color,
              transform: \`translateY(\${(scale - 1) * -16}px) scale(\${scale})\`,
            }}
            className="h-12 w-12 rounded-xl text-white shadow-lg transition-transform duration-200"
          >
            {app.label[0]}
          </button>
        );
      })}
    </div>
  );
}`,
  },
];

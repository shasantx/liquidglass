<div align="center">

# GlassKit v2.0 — Liquid Glass UI Library

**Apple iOS 26 & macOS Tahoe optical interface components for React and the web.**  
Physical Snell refraction, 3-channel RGB chromatic dispersion, Fresnel specular rims, arbitrary custom background images, and native 60Hz–240Hz ProMotion smoothness.

[![Version](https://img.shields.io/badge/version-2.0.0-2997ff?style=flat-square)](./package.json)
[![React](https://img.shields.io/badge/React-18+-149eca?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebGL2](https://img.shields.io/badge/WebGL2-GLSL_ES_3.00-0f172a?style=flat-square)](https://registry.khronos.org/webgl/specs/latest/2.0/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

[Explore Docs (`/docs`)](./src/components/DocsSection.tsx) · [Report Bug](https://github.com/shasantx/liquidglass/issues/new?template=bug_report.md) · [Request Feature](https://github.com/shasantx/liquidglass/issues/new?template=feature_request.md)

</div>

---

## What's New in v2.0

- **Publishable React Library (`glasskit-liquid-glass`)** — Install via npm with ESM/CJS bundles, full TypeScript `.d.ts` declarations, standalone `glasskit-liquid-glass/styles.css`, and zero required icon-library dependencies.
- **10 Reusable Prop-Driven React Components** — `GlassTabBar`, `GlassSwitch`, `GlassSlider`, `GlassSegmentedControl`, `GlassButton` / `GlassButtonGroup` / `GlassIconButton`, `GlassControlCenter`, `GlassMediaPlayer`, `GlassContextMenu`, `GlassNotificationStack`, `GlassAlertSheet`, and `GlassDock`.
- **Custom Background Images in `<GlassStage>`** — Pass any `backgroundImage` URL (remote CORS image, local path, data URL, or uploaded blob URL), explicit `tone="dark" | "light"`, and standard `style` / `HTMLDivElement` props.
- **Per-Element Optical Overrides & Live 3-Tier Switching** — Override `refraction`, `blur`, `aberration`, `specular`, `bezelWidth`, and `renderMode` (`'auto' | 'webgl' | 'svg' | 'css'`) on individual `<LiquidGlass>` surfaces.
- **Upgraded Interactive Studio** — 1-click install bar, drag-and-drop custom image testing, Copy Config export, live WebGL2 / SVG DOM / CSS engine switcher, syntax-highlighted code viewer, persisted light/dark theme, and `/docs#<tab>` deep links.

---

## 3-Tier Optical Architecture

| Layer | Engine | What It Does |
| --- | --- | --- |
| **Tier 1** | **Shared WebGL2 Optical Engine** (`src/glasskit/core/webglGlassRenderer.ts`) | One shared offscreen WebGL2 context renders every stage on the page with pre-baked 2-pass separable 17-tap Gaussian frost maps, physical Snell meniscus refraction (`IOR = 1.48`), 3-channel RGB chromatic dispersion, per-element `uOptics[12]` overrides, organic `smin` droplet fusion, and **0% idle GPU**. |
| **Tier 2** | **SVG DOM Displacement** (`src/glasskit/core/liquidGlassEngine.ts`) | Automatically generates quantized 2D RG Snell displacement maps for standalone Chromium DOM surfaces via `backdrop-filter: url(#lg-svg-...)`. |
| **Tier 3** | **Pure CSS Fallback** (`src/glasskit/primitives/LiquidGlass.tsx`) | Gracefully degrades to multi-layered translucent `backdrop-filter` glass with directional Fresnel rim hairlines and pointer sheen anywhere WebGL2 is unavailable. |

---

## Quick Start

### 1. Install the Package

```bash
npm install glasskit-liquid-glass
```

Import the standalone stylesheet once at your app root and wrap surfaces in `<GlassSettingsProvider>` + `<GlassStage>`:

```tsx
import 'glasskit-liquid-glass/styles.css';
import {
  GlassSettingsProvider,
  GlassStage,
  LiquidGlass,
  GlassButton,
} from 'glasskit-liquid-glass';

export function GlassCardExample() {
  return (
    <GlassSettingsProvider>
      <GlassStage
        backgroundImage="/your-wallpaper.jpg"
        tone="dark"
        style={{ height: 420, borderRadius: 28 }}
      >
        <LiquidGlass radius={32} bezelWidth={22} refraction={1.05} variant="clear">
          <div style={{ padding: '24px 28px' }}>
            <h3>Liquid Glass Card</h3>
            <p>Real-time Snell refraction, RGB dispersion, and Fresnel specular depth.</p>
            <GlassButton variant="prominent">Get Started</GlassButton>
          </div>
        </LiquidGlass>
      </GlassStage>
    </GlassSettingsProvider>
  );
}
```

### 2. Run Locally & Build Library + Showcase

Requires **Node.js 18+**.

```bash
git clone https://github.com/shasantx/liquidglass.git
cd liquidglass
npm install

npm run dev        # Start interactive studio (Vite HMR)
npm run build      # Build showcase website -> dist/
npm run build:lib  # Build npm package (ESM + CJS + .d.ts + styles.css) -> dist-lib/
npm run build:all  # Build both library and website
```

---

## Exported Components (10 Interactive Components)

| # | Component | Category | Key Features |
| --- | --- | --- | --- |
| 1 | `<GlassTabBar />` | Navigation | Swipeable & hold-to-drag spring active lens pill + optional expandable search orb |
| 2 | `<GlassSwitch />` & `<GlassSlider />` | Controls | Droplet-expanding optical switches + magnifying drag sliders with keyboard support |
| 3 | `<GlassSegmentedControl />` | Controls | Swipeable label and icon segmented controls with velocity-stretched glass thumb |
| 4 | `<GlassButton />`, `<GlassButtonGroup />`, `<GlassIconButton />` | Controls | Clear, prominent azure, and tinted capsule buttons, grouped toolbar & circular orbs |
| 5 | `<GlassControlCenter />` | Widgets | 2×2 connectivity orb grid, vertical drag sliders & Focus mode pill |
| 6 | `<GlassMediaPlayer />` | Widgets | Interactive Now Playing card with live scrubbing, play/pause, track switching & favorites |
| 7 | `<GlassContextMenu />` | Overlays | Spring-blooming popover with quick-action tiles, keyboard shortcuts & destructive rows |
| 8 | `<GlassNotificationStack />` | Overlays | Collapsible/expandable depth-scaled notification banners with dismiss & restore |
| 9 | `<GlassAlertSheet />` | Overlays | Centered concentric-corner iOS 26 modal sheet with pill-shaped actions |
| 10 | `<GlassDock />` | Navigation | macOS Tahoe floating dock with utility divider, parabolic hover magnification & tooltips |

---

## API Reference

### `<LiquidGlass />`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `radius` | `number` | `24` | Corner radius in `px` (`999` for capsules/orbs). |
| `variant` | `'clear' \| 'tinted' \| 'dark' \| 'prominent'` | `'clear'` | Optical surface finish. |
| `refraction` | `number` | Context (`0.88`) | Per-surface Snell meniscus refraction multiplier (`0`–`1.8`). |
| `blur` | `number` | Context (`3.4`) | Per-surface interior frost depth (`0`–`6`). |
| `aberration` | `number` | Context (`0.16`) | Per-surface physical RGB chromatic dispersion (`0`–`0.45`). |
| `bezelWidth` | `number` | Context (`24`) | Convex meniscus width in `px`. |
| `specular` | `number` | Context (`0.95`) | Fresnel rim & pointer catchlight intensity multiplier. |
| `renderMode` | `'auto' \| 'webgl' \| 'svg' \| 'css'` | `'auto'` | Override rendering tier per surface. |
| `interactive` | `boolean` | `true` | Enables subtle pointer-following studio sheen on hover. |

### `<GlassStage />`

| Prop / Ref Method | Type | Description |
| --- | --- | --- |
| `scene` | `'tahoe' \| 'sunset' \| 'dark' \| 'light' \| 'prism'` | Built-in calibrated wallpaper scene (default `'tahoe'`). |
| `backgroundImage` | `string` | Any custom image URL (remote CORS image, local path, data URL, or blob URL). |
| `tone` | `'dark' \| 'light'` | Explicit optical contrast & typography tone. |
| `renderMode` | `'auto' \| 'webgl' \| 'svg' \| 'css'` | Override rendering tier for all child glass surfaces. |
| `style / className` | `HTMLDivElement` props | Standard container styling and attributes. |
| `ref.requestFrame()` | `() => void` | Triggers a single VSync-aligned WebGL2 redraw. |
| `ref.requestBurst(ms)` | `(durationMs?: number) => void` | Runs high-refresh-rate redraws during CSS transitions. |
| `ref.setDroplet(d)` | `(droplet: DropletDescriptor \| null) => void` | Controls organic `smin` liquid droplet merging. |

---

## Browser Support

| Browser | WebGL2 Optical Stage | CSS Glass Fallback | SVG DOM Refraction |
| --- | --- | --- | --- |
| **Chrome / Edge / Brave** | Full 60–240Hz | Supported | Supported |
| **Safari (macOS & iOS)** | Full ProMotion 120Hz | Supported (`-webkit-backdrop-filter`) | Auto-fallback to WebGL2 / CSS |
| **Firefox** | Full 60–240Hz | Supported | Auto-fallback to WebGL2 / CSS |

---

## License

Released under the [MIT License](./LICENSE) © 2026 [shasantx](https://github.com/shasantx).

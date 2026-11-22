<div align="center">

# GlassKit — Liquid Glass UI Library

**Apple iOS 26 & macOS Tahoe optical interface components for the web.**  
Physical Snell refraction, 3-channel RGB chromatic dispersion, Fresnel specular rims, soft-focus depth-of-field stages, and native 60Hz–240Hz ProMotion smoothness.

[![React](https://img.shields.io/badge/React-18-149eca?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![WebGL2](https://img.shields.io/badge/WebGL2-GLSL_ES_3.00-0f172a?style=flat-square)](https://registry.khronos.org/webgl/specs/latest/2.0/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

[Explore Docs (`/docs`)](./src/components/DocsSection.tsx) · [Report Bug](https://github.com/shasantx/liquidglass/issues/new?template=bug_report.md) · [Request Feature](https://github.com/shasantx/liquidglass/issues/new?template=feature_request.md)

</div>

---

## Why GlassKit?

Most CSS "glassmorphism" effects stop at `backdrop-filter: blur(...)` and a translucent box. Real Apple iOS 26 & macOS Tahoe **Liquid Glass** bends light along a curved convex meniscus, separates RGB wavelengths physically, responds to pointer angle with Schlick Fresnel grazing reflections, and pushes foreground UI off softly recessed depth-of-field backgrounds.

**GlassKit** ships a production-ready **3-tier optical rendering architecture** with zero WebGL framework overhead:

| Layer | Engine | What It Does |
| --- | --- | --- |
| **Tier 1** | **Shared WebGL2 Optical Engine** (`src/lib/webglGlassRenderer.ts`) | One shared offscreen WebGL2 context renders every stage on the page with pre-baked 2-pass separable 17-tap Gaussian frost maps, physical Snell meniscus refraction (`IOR = 1.48`), 3-channel RGB chromatic dispersion, organic `smin` droplet fusion, and **0% idle GPU**. |
| **Tier 2** | **SVG DOM Displacement** (`src/lib/liquidGlassEngine.ts`) | Generates quantized 2D RG Snell displacement maps for standalone Chromium DOM surfaces via `backdrop-filter: url(#liquid-glass-refract)`. |
| **Tier 3** | **Pure CSS Fallback** (`src/components/LiquidGlass.tsx`) | Automatically degrades to multi-layered translucent `backdrop-filter` glass with directional Fresnel rim hairlines anywhere WebGL2 is unavailable. |

---

## Key Features

- **Zero Idle GPU & Zero Context Limits** — Uses one shared offscreen WebGL2 context across the entire app, redraws strictly on demand (`requestFrame` / `requestBurst`), caches shader attribute locations & 2D blit contexts via `WeakMap`, and pauses off-screen via `IntersectionObserver`.
- **Native Refresh-Rate Smoothness (60Hz / 120Hz ProMotion / 144Hz / 240Hz)** — Timestamp-based delta-time exponential smoothing (`1 - Math.exp(-λ · dt)`) and zero-re-render GPU `translate3d` dragging keep motion identically fluid on every display.
- **Balanced Light & Dark Adaptive Optics** — Separate site shell theming (`.theme-dark` / `.theme-light`) and stage tone adaptation (`.stage-tone-dark` / `.stage-tone-light`) with highlight stabilization so white and dark typography stay crisp across Tahoe, Sunset, Midnight, Studio, and Spectrum scenes.
- **Dedicated `/docs` Page & Copy-Ready Code** — Full interactive documentation route (`/docs`) with Overview, Setup Guides, Components & API, Optical Physics, Theming & Performance, and copy-paste HTML/CSS, React, SVG, and GLSL Core Engine tabs.
- **Fully Responsive & Accessible** — Mobile-first breakpoints from `390px` phones to ultrawide displays, semantic ARIA roles (`tablist`, `switch`, `slider`, `menu`), keyboard support, and `prefers-reduced-motion` compliance.

---

## Included Component Library (10 Interactive Components)

| # | Component | Category | Interactive Capabilities |
| --- | --- | --- | --- |
| 1 | **Floating Tab Bar** | Navigation | Swipeable & hold-to-drag spring active lens pill + detached search orb that expands into a glass input |
| 2 | **Liquid Toggle & Slider** | Controls | Droplet-expanding optical switches + magnifying drag sliders with keyboard support |
| 3 | **Segmented Control** | Controls | Swipeable label and icon segmented controls with fluid velocity-stretched glass thumb |
| 4 | **Buttons & Action Capsule** | Controls | Clear, prominent azure, and tinted capsule buttons, grouped toolbar pill & circular glass orbs |
| 5 | **Control Center Modules** | Widgets | 2×2 connectivity orb grid, vertical drag brightness & volume sliders, and Focus mode pill |
| 6 | **Now Playing Glass Card** | Widgets | Interactive Apple Music card with live scrubbing, play/pause, track switching, favorites & drag-to-refract hero mode |
| 7 | **Context Menu & Popover** | Overlays | Spring-blooming Liquid Glass popover with quick-action tiles, keyboard shortcut hints & destructive styling |
| 8 | **Notification Stack** | Overlays | Collapsible/expandable depth-scaled notification banners with dismiss and restore actions |
| 9 | **Alert Dialog Sheet** | Overlays | Centered concentric-corner iOS 26 modal dialog with pill-shaped actions |
| 10 | **macOS Tahoe Dock** | Navigation | Full macOS icon lineup, hairline utility divider, translucent Downloads folder & frosted Trash, smooth parabolic hover magnification, neighbor spread & tooltips |

---

## Quick Start

### 1. Run the Interactive Studio Locally

Requires **Node.js 18+**.

```bash
# Clone the repository
git clone https://github.com/shasantx/liquidglass.git
cd liquidglass

# Install dependencies
npm install

# Start the Vite dev server (HMR)
npm run dev

# Type-check & build for production
npm run build

# Preview the production build locally
npm run preview
```

### 2. Integrate into React / Vite / Next.js

Copy these 5 files into your project (plus `public/wallpapers/`):

- `src/lib/webglGlassRenderer.ts`
- `src/lib/liquidGlassEngine.ts`
- `src/context/GlassSettingsContext.tsx`
- `src/components/GlassStage.tsx`
- `src/components/LiquidGlass.tsx`

Then wrap your surfaces in `<GlassSettingsProvider>` and `<GlassStage>`:

```tsx
import { GlassSettingsProvider } from './context/GlassSettingsContext';
import { GlassStage } from './components/GlassStage';
import { LiquidGlass } from './components/LiquidGlass';

export function GlassCardExample() {
  return (
    <GlassSettingsProvider>
      <GlassStage scene="tahoe" className="stage-tone-dark" style={{ height: 420 }}>
        <LiquidGlass radius={32} bezelWidth={22} variant="clear">
          <div style={{ padding: '24px 28px' }}>
            <h3>Liquid Glass Card</h3>
            <p>Real-time Snell refraction, RGB dispersion, and Fresnel specular depth.</p>
          </div>
        </LiquidGlass>
      </GlassStage>
    </GlassSettingsProvider>
  );
}
```

### 3. Vanilla HTML + CSS Drop-In

Copy the **Core CSS** snippet from the **Engine** tab (or `src/data/componentRegistry.ts`) and apply `.liquid-glass`:

```html
<div class="liquid-glass card" style="--glass-radius: 28px">
  <h3>Hello Liquid Glass</h3>
  <p>Works across Chrome, Safari, Edge, and Firefox.</p>
</div>
```

---

## API Reference

### `<LiquidGlass />`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `radius` | `number` | `24` | Corner radius in `px` (use `999` for full pills & circular orbs). |
| `variant` | `'clear' \| 'tinted' \| 'dark' \| 'prominent'` | `'clear'` | Glass surface finish (crystal clear, frosted tint, dark obsidian, or azure CTA). |
| `bezelWidth` | `number` | Context (`24`) | Convex meniscus refraction width in `px`. Use `12–18` for slim bars/docks and `22–28` for cards. |
| `specular` | `number` | Context (`0.95`) | Specular reflection and Fresnel rim intensity multiplier. |
| `interactive` | `boolean` | `true` | Enables subtle pointer-following studio sheen on hover. |

### `<GlassStage />`

| Prop / Imperative Handle | Type | Description |
| --- | --- | --- |
| `scene` | `'tahoe' \| 'sunset' \| 'dark' \| 'light' \| 'prism'` | Wallpaper scene baked into crisp & Gaussian-blurred textures. |
| `ref.requestFrame()` | `() => void` | Triggers a single VSync-aligned WebGL2 redraw. |
| `ref.requestBurst(ms)` | `(durationMs?: number) => void` | Runs high-refresh-rate redraws during CSS transitions (e.g., Dock hover spread). |
| `ref.setDroplet(d)` | `(droplet: DropletDescriptor \| null) => void` | Controls organic `smin` liquid droplet merging. |

### Optical Material Presets (`applyPreset`)

| Preset | Refraction | Frost | Dispersion | Specular | Ideal Use Case |
| --- | --- | --- | --- | --- | --- |
| **Clear** | `0.88` | `3.4` | `16%` | `95%` | Default iOS 26 / macOS Tahoe navbars, docks & media players |
| **Regular** | `0.65` | `5.2` | `8%` | `85%` | Text-dense notifications, context menus & alert sheets |
| **Crystal** | `1.25` | `1.2` | `18%` | `115%` | High-clarity optical lenses & interactive hero showcases |
| **Prism** | `1.15` | `2.2` | `34%` | `110%` | Vivid RGB chromatic meniscus dispersion highlights |

---

## Browser Support

| Browser | WebGL2 Optical Stage | CSS Glass Fallback | SVG DOM Refraction |
| --- | --- | --- | --- |
| **Chrome / Edge / Brave** | Full 60–240Hz | Supported | Supported |
| **Safari (macOS & iOS)** | Full ProMotion 120Hz | Supported (`-webkit-backdrop-filter`) | Auto-fallback to WebGL2 / CSS |
| **Firefox** | Full 60–240Hz | Supported | Auto-fallback to WebGL2 / CSS |

---

## Project Structure

```text
liquidglass/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── public/
│   └── wallpapers/                # Full-HD Apple-style 3D wallpapers
├── src/
│   ├── components/
│   │   ├── AppleAppIcons.tsx      # Authentic macOS Tahoe & iOS 26 SVG app icons
│   │   ├── CodeBlock.tsx          # Multi-tab copy-ready code viewer
│   │   ├── ComponentStage.tsx     # Interactive gallery card with wallpaper switcher
│   │   ├── DocsSection.tsx        # Dedicated /docs documentation page
│   │   ├── GlassStage.tsx         # WebGL2 stage context & burst render scheduler
│   │   ├── HeroWebGLStage.tsx     # Flagship draggable stage + optical inspector
│   │   ├── LiquidGlass.tsx        # Primary LiquidGlass primitive (GPU + CSS fallback)
│   │   └── ScrollReveal.tsx       # One-shot blur-focus IntersectionObserver reveal
│   ├── context/
│   │   └── GlassSettingsContext.tsx
│   ├── data/
│   │   └── componentRegistry.ts   # Component specs + HTML/CSS/React/GLSL snippets
│   ├── demos/                     # 10 interactive iOS 26 & macOS Tahoe component demos
│   ├── lib/
│   │   ├── liquidGlassEngine.ts   # Quantized SVG Snell displacement generator
│   │   └── webglGlassRenderer.ts  # Shared offscreen WebGL2 shader & Gaussian baker
│   ├── styles/
│   │   └── global.css             # Complete light/dark optical design system
│   ├── App.tsx                    # SPA routing (/ and /docs), sticky navbar & shell
│   └── main.tsx
├── vercel.json                    # SPA rewrite so /docs works on direct refresh
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

---

## Deployment

GlassKit builds to static assets (`dist/`) and includes [`vercel.json`](./vercel.json) with SPA rewrites so direct visits and refreshes on `/docs` work out of the box on Vercel, Netlify, or Cloudflare Pages.

```bash
npm run build
```

---

## Contributing

Contributions, shader refinements, new Apple iOS 26 / macOS Tahoe components, and accessibility improvements are warmly welcome! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request.

---

## License

Released under the [MIT License](./LICENSE) © 2026 [shasantx](https://github.com/shasantx).

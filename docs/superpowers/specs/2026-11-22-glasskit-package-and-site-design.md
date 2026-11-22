# GlassKit — Publishable Package & Studio Website Upgrade Design

**Date:** 2026-11-22  
**Status:** Proposed (awaiting approval)  
**Package Name:** `glasskit-liquid-glass` (React 18+ / TypeScript + standalone CSS; Vanilla Core exports included)

---

## 1. Intent & Goals

Make every Liquid Glass optical effect and interactive iOS 26 / macOS Tahoe component showcased on the GlassKit website genuinely effortless for any developer to install and use — while fixing current docs/code mismatches and upgrading the studio website into a complete interactive workbench.

### Goals
1. **Publishable npm library (Option A — dual-build in this repo):**
   - Clean `src/glasskit/` package boundary exporting the optical engine (`GlassSettingsProvider`, `useGlassSettings`, `GlassStage`, `LiquidGlass`, `sharedGlassEngine`, `generateLiquidGlassMaps`) and all **10 reusable, prop-driven UI components** with TypeScript declarations (`.d.ts`) and an isolated library stylesheet (`glasskit.css`).
   - Separate `npm run build:lib` script emitting `dist-lib/` (ESM + CJS + `.d.ts` + `styles.css`) wired into `package.json` `exports`, while `npm run build` continues building the Vercel showcase site to `dist/` untouched.
   - Showcase demos in `src/demos/` consume the library components directly so the site and package never drift apart.
2. **Custom backgrounds & true 3-tier optical rendering:**
   - Upgrade `<GlassStage>` to accept `backgroundImage?: string` (any image URL, data URL, or blob URL), `tone?: 'dark' | 'light'`, `style`, and standard HTML div props, plus graceful CSS background rendering when WebGL2 is disabled or forced to SVG/CSS mode.
   - Wire up per-element `<LiquidGlass>` overrides (`refraction`, `blur`, `aberration`, `specular`, `bezelWidth`) across both WebGL2 (`uOptics[12]` uniform) and SVG/CSS fallback modes.
   - Wire up true Tier-2 SVG DOM displacement inside `<LiquidGlass>` using `generateLiquidGlassMaps` when in SVG mode on Chromium, with automatic Tier-3 CSS fallback elsewhere.
3. **Website fixes & polish:**
   - Persist `siteTheme` in `localStorage` with `prefers-color-scheme` fallback.
   - Add full SEO / Open Graph / Twitter metadata to `index.html`, optimize `/logo.jpg` into a tiny crisp favicon/brand asset, and convert/optimize heavy wallpapers to WebP with JPG fallback if needed.
   - Add lightweight zero-dependency syntax highlighting to `CodeBlock`, sync `/docs#<tab>` URL hashes + dynamic `document.title`, and make the gallery card's quick Copy button clearly copy the active or selectable format (`Copy HTML` / `Copy React`).
   - Update `DocsSection.tsx`, `componentRegistry.ts`, and `README.md` to document real `npm install glasskit-liquid-glass` usage alongside copy-paste snippets.
4. **Hero Studio upgrades:**
   - **1-click Install bar** right in the hero (`npm install glasskit-liquid-glass` with copy button + link to `/docs`).
   - **Custom Background Upload** button & drag-and-drop image support in the hero stage so visitors can test Liquid Glass over their own photos or app screenshots.
   - **Copy Config / Props** button in the Optical Inspector exporting the exact tuned `<GlassSettingsProvider defaultSettings={{ ... }}>` snippet.
   - **Render Tier Switcher (`WebGL2` / `SVG DOM` / `CSS`)** in the hero inspector so developers can preview graceful degradation live.

### Non-Goals / Anti-Goals
- **No monorepo migration** — Vercel deployment and root Vite app stay intact.
- **No heavy external syntax highlighter or runtime dependencies** — keep the library bundle lean (only `react` / `react-dom` as peer dependencies, and `lucide-react` optional or peer for icons, with clean custom icon props on every component so users aren't locked into `lucide-react`).
- **No breaking changes to existing site aesthetics or smoothness** — preserve 0% idle GPU, ProMotion delta-time motion, light/dark optical calibration, and mobile responsiveness.

---

## 2. Approaches Considered

| Approach | Summary | Trade-offs | Decision |
| --- | --- | --- | --- |
| **Option A: Dual-build single repo** | Keep website build (`npm run build` → `dist/`) and add library build (`npm run build:lib` → `dist-lib/`) from `src/glasskit/`. | Zero Vercel config changes, single `package.json`, demos import directly from library. | **Selected** |
| **Option B: Monorepo workspaces** | Split into `packages/glasskit` + `apps/web` + `packages/cli`. | Cleaner for many packages later, but adds workspace tooling and requires changing Vercel root/build config today. | Deferred |

---

## 3. Architecture & File Layout

```text
src/
├── glasskit/                        # Publishable npm package source
│   ├── index.ts                     # Main barrel export (engine + 10 components + types)
│   ├── core/
│   │   ├── webglGlassRenderer.ts    # Shared WebGL2 engine (+ custom image URLs + uOptics[12])
│   │   ├── liquidGlassEngine.ts     # Quantized SVG Snell displacement generator
│   │   └── GlassSettingsContext.tsx # Provider (+ defaultSettings, renderMode, theme persistence)
│   ├── primitives/
│   │   ├── GlassStage.tsx           # Accepts scene | backgroundImage, tone, style, renderMode
│   │   └── LiquidGlass.tsx          # Wired per-element overrides + WebGL2 / SVG / CSS tiers
│   ├── components/                  # 10 prop-driven reusable UI components
│   │   ├── GlassTabBar.tsx          # Swipeable floating tab bar + optional expandable search
│   │   ├── GlassSwitch.tsx          # Droplet-expanding optical switch
│   │   ├── GlassSlider.tsx          # Magnifying drag horizontal slider
│   │   ├── GlassSegmentedControl.tsx# Swipeable text/icon segmented control
│   │   ├── GlassButton.tsx          # GlassButton, GlassButtonGroup, GlassIconButton
│   │   ├── GlassControlCenter.tsx   # Connectivity orb grid, vertical sliders & focus pill
│   │   ├── GlassMediaPlayer.tsx     # Prop-driven Now Playing glass card
│   │   ├── GlassContextMenu.tsx     # Trigger + spring-blooming popover menu
│   │   ├── GlassNotificationStack.tsx # Collapsible/expandable notification banner stack
│   │   ├── GlassAlertSheet.tsx      # Concentric-corner modal dialog sheet
│   │   └── GlassDock.tsx            # Parabolic magnification dock with optional utility section
│   └── styles/
│       └── glasskit.css             # Isolated component & glass surface styles (no site shell CSS)
├── components/                      # Showcase site components (Hero, ComponentStage, Docs, CodeBlock)
├── demos/                           # Thin showcase wrappers passing sample data into src/glasskit/components
├── data/componentRegistry.ts        # Updated with real npm package React snippets + HTML/CSS
└── styles/global.css                # Site shell, hero studio, bento gallery, docs layout (imports glasskit.css)
vite.lib.config.ts                   # Library build config -> dist-lib/
tsconfig.lib.json                    # Emits declaration files (.d.ts) -> dist-lib/
```

### Key Technical Details (My Calls)
- **Icons decoupling:** Library components accept `React.ReactNode` icon slots (e.g., `icon?: React.ReactNode`) with minimal inline SVG defaults for built-in UI chrome (close `×`, chevron) so `glasskit-liquid-glass` has **zero required icon library dependency** (`peerDependencies: { react, react-dom }`). Showcase demos continue using `lucide-react` and `AppleAppIcons`.
- **Per-element WebGL2 optical overrides:** Add `uniform vec4 uOptics[12]` to `GLASS_FRAG` packing `(refraction, blur, aberration, specular)` per registered rect. Unspecified props inherit `GlassSettingsContext`.
- **Custom image texture loading in `SharedWebGLGlassEngine`:** Accept arbitrary image URLs (`backgroundImage`) via a URL-keyed texture cache alongside built-in scenes, using `img.crossOrigin = 'anonymous'` for remote URLs and automatic cleanup/eviction so uploading multiple custom backgrounds never leaks GPU textures.
- **Asset optimization:** Generate compressed WebP versions of the 4 wallpapers + resized PNG/WebP icon for navbar/favicon (`logo-icon.webp` / `og-preview.jpg`), keeping total initial image transfer minimal while preserving full-HD sharpness.
- **Zero-dependency syntax highlighting:** Build a clean ~80-line tokenizer in `CodeBlock.tsx` supporting JSX/TSX, CSS, HTML, GLSL, and bash keywords/strings/comments/tags with theme-aware CSS variables.

---

## 4. Verification Plan
1. `npm run build` (TypeScript + Vite website production build) succeeds cleanly with zero errors.
2. `npm run build:lib` emits `dist-lib/index.js`, `dist-lib/index.cjs`, `dist-lib/index.d.ts`, and `dist-lib/styles.css` with valid exports.
3. Verify the running showcase app in browser / preview: hero stage (all 5 scenes + custom image upload + 3 render tiers + copy config + install bar), all 10 interactive demos powered by `src/glasskit/`, light/dark persistence, `/docs#<tab>` deep-linking, and code syntax highlighting.

# Contributing to GlassKit

Thank you for your interest in contributing to **GlassKit**! Whether you are refining the WebGL2 GLSL optical shader, adding a new iOS 26 / macOS Tahoe UI component, improving accessibility, or fixing responsive edge cases, we welcome your pull requests.

## Local Setup

```bash
git clone https://github.com/shasantx/liquidglass.git
cd liquidglass
npm install
npm run dev
```

## Guidelines

1. **Optical Authenticity**: Keep glass surfaces genuinely translucent — avoid heavy dark scrims or blown-out white washes. Test every component across both **Dark** and **Light** site themes and all 4–5 stage wallpapers (`Tahoe`, `Sunset`, `Midnight`, `Studio`, `Spectrum`).
2. **Performance & High Refresh Rates**:
   - Keep idle GPU usage at **0%** — never run an unbounded `requestAnimationFrame` loop when nothing is moving.
   - Use delta-time exponential smoothing (`1 - Math.exp(-lambda * dt)`) for any continuous animation so 60Hz, 120Hz, 144Hz, and 240Hz displays feel identical.
   - Avoid triggering React `setState` on high-frequency `pointermove` events; update GPU transforms directly via refs when possible.
3. **Accessibility**: Include proper ARIA roles (`tablist`, `switch`, `slider`, `menu`), keyboard interactions, visible focus states, and `prefers-reduced-motion` support.
4. **TypeScript & Build Check**: Ensure `npm run build` (`tsc && vite build`) passes cleanly with zero errors before opening a PR.

## Pull Request Checklist

- [ ] `npm run build` passes with zero TypeScript or Vite errors
- [ ] Tested in both **Dark** and **Light** themes
- [ ] Tested on **Desktop (`1440px`)** and **Mobile (`390px`)** viewports with zero horizontal overflow
- [ ] Zero browser console errors

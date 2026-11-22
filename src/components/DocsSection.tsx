import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Code2,
  Copy,
  Cpu,
  Layers,
  Sliders,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import {
  CORE_ENGINE_CSS,
  CORE_ENGINE_SVG_JS,
  CORE_ENGINE_WEBGL,
} from '../data/componentRegistry';
import { CodeBlock } from './CodeBlock';

type DocTabId = 'overview' | 'setup' | 'api' | 'physics' | 'theming' | 'engine';

const DOC_TABS: { id: DocTabId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'setup', label: 'Setup Guides', icon: Terminal },
  { id: 'api', label: 'Components & API', icon: Layers },
  { id: 'physics', label: 'Optical Physics', icon: Sliders },
  { id: 'theming', label: 'Theming & Perf', icon: Cpu },
  { id: 'engine', label: 'Core Engine', icon: Code2 },
];

const INSTALL_SNIPPET = `# 1. Clone the repository
git clone https://github.com/shasantx/liquidglass.git
cd liquidglass

# 2. Install dependencies
npm install

# 3. Start the interactive studio (Vite HMR)
npm run dev

# 4. Type-check & build for production
npm run build`;

const REACT_USAGE_SNIPPET = `import { GlassSettingsProvider } from './context/GlassSettingsContext';
import { GlassStage } from './components/GlassStage';
import { LiquidGlass } from './components/LiquidGlass';

export function MyGlassSurface() {
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
}`;

const HTML_USAGE_SNIPPET = `<!-- 1. Include the Liquid Glass core CSS once -->
<div class="liquid-glass my-card" style="--glass-radius: 28px">
  <h3>Hello Liquid Glass</h3>
  <p>Works in Chrome, Safari, Edge, and Firefox with graceful fallback.</p>
</div>

<style>
.my-card {
  max-width: 380px;
  padding: 24px;
  color: #ffffff;
}
</style>`;

const SETTINGS_HOOK_SNIPPET = `import { useGlassSettings } from './context/GlassSettingsContext';

export function OpticalPresetBar() {
  const { settings, updateSetting, applyPreset, resetSettings } = useGlassSettings();

  return (
    <div>
      <button onClick={() => applyPreset('clear')}>Clear</button>
      <button onClick={() => applyPreset('crystal')}>Crystal</button>
      <button onClick={() => updateSetting('siteTheme', settings.siteTheme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
      <button onClick={resetSettings}>Reset</button>
    </div>
  );
}`;

const CopyMiniBtn: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };
  return (
    <button
      type="button"
      className={`doc-copy-btn ${copied ? 'is-copied' : ''}`}
      onClick={onCopy}
      aria-label="Copy snippet"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

interface DocsSectionProps {
  onBackToShowcase?: () => void;
}

export const DocsSection: React.FC<DocsSectionProps> = ({ onBackToShowcase }) => {
  const [activeTab, setActiveTab] = useState<DocTabId>('overview');

  return (
    <section id="docs" className="docs-section docs-page blur-morph-in">
      <div className="docs-header">
        <div className="docs-header-top-row">
          {onBackToShowcase && (
            <a
              href="/"
              className="docs-back-link"
              onClick={(e) => {
                e.preventDefault();
                onBackToShowcase();
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Showcase</span>
            </a>
          )}
          <span className="docs-eyebrow">
            <Code2 size={13} /> Documentation &amp; Setup Guides
          </span>
        </div>

        <div className="docs-header-copy">
          <h1>GlassKit Documentation</h1>
          <p>
            Complete architecture overview, step-by-step React &amp; Vanilla setup guides,
            component props reference, Snell optical physics calibration, high-refresh-rate
            performance guidelines, and drop-in shader source.
          </p>
        </div>
      </div>

      <div className="docs-layout">
        {/* Sticky sidebar on desktop, horizontal pill bar on tablet/mobile */}
        <aside className="docs-sidebar" aria-label="Documentation topics">
          <div className="docs-nav-list" role="tablist">
            {DOC_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`docs-nav-btn ${activeTab === tab.id ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active documentation panel */}
        <div key={activeTab} className="docs-content blur-morph-in" role="tabpanel">
          {activeTab === 'overview' && (
            <div className="docs-stack">
              <div className="doc-block">
                <h3>3-Tier Optical Architecture</h3>
                <p>
                  GlassKit is designed so every surface renders authentic Apple iOS 26 &amp; macOS
                  Tahoe Liquid Glass across all browsers without hitting WebGL context limits or
                  draining battery when idle.
                </p>
                <div className="doc-cards-grid">
                  <div className="doc-mini-card">
                    <strong>1. Shared WebGL2 Engine</strong>
                    <p>
                      A single offscreen WebGL2 context renders all stages on the page, baking a
                      2-pass separable 17-tap Gaussian frost map per wallpaper and blitting directly
                      to each stage canvas only when geometry or hover state changes (0% idle GPU).
                    </p>
                  </div>
                  <div className="doc-mini-card">
                    <strong>2. SVG DOM Displacement</strong>
                    <p>
                      For standalone DOM surfaces in Chromium, <code>liquidGlassEngine.ts</code>{' '}
                      generates quantized 2D RG displacement maps using Snell&apos;s law along a
                      convex squircle bevel for live <code>backdrop-filter: url(...)</code> lensing.
                    </p>
                  </div>
                  <div className="doc-mini-card">
                    <strong>3. Pure CSS Fallback</strong>
                    <p>
                      When used outside a <code>&lt;GlassStage&gt;</code> or on devices without
                      WebGL2, <code>&lt;LiquidGlass&gt;</code> automatically degrades to translucent
                      multi-layered <code>backdrop-filter</code> glass with directional Fresnel rims.
                    </p>
                  </div>
                </div>
              </div>

              <div className="doc-block">
                <h3>Project Structure</h3>
                <div className="doc-table-wrap">
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Path</th>
                        <th>Responsibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>src/lib/webglGlassRenderer.ts</code></td>
                        <td>Shared offscreen WebGL2 renderer, GLSL Snell refraction shader, Gaussian frost baker, and wallpaper loader.</td>
                      </tr>
                      <tr>
                        <td><code>src/lib/liquidGlassEngine.ts</code></td>
                        <td>Quantized SVG displacement-map generator &amp; Chromium backdrop-filter feature detection.</td>
                      </tr>
                      <tr>
                        <td><code>src/components/GlassStage.tsx</code></td>
                        <td>Stage context provider that tracks child <code>LiquidGlass</code> bounding boxes and drives burst-only GPU frames.</td>
                      </tr>
                      <tr>
                        <td><code>src/components/LiquidGlass.tsx</code></td>
                        <td>Primary glass primitive supporting both GPU-accelerated stage mode and pure-CSS fallback mode.</td>
                      </tr>
                      <tr>
                        <td><code>src/context/GlassSettingsContext.tsx</code></td>
                        <td>Global optical state (refraction, frost, bezel, specular, dispersion, saturation, site theme) and material presets.</td>
                      </tr>
                      <tr>
                        <td><code>src/demos/*</code></td>
                        <td>10 production-ready interactive iOS 26 &amp; macOS Tahoe UI demos (Tab Bar, Dock, Player, Control Center, etc.).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-block">
                <h3>Browser Support</h3>
                <div className="doc-table-wrap">
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Browser</th>
                        <th>WebGL2 Stage</th>
                        <th>CSS Glass Fallback</th>
                        <th>SVG DOM Refraction</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Chrome / Edge / Brave</td>
                        <td>Full 60–240Hz</td>
                        <td>Supported</td>
                        <td>Supported</td>
                      </tr>
                      <tr>
                        <td>Safari (macOS &amp; iOS)</td>
                        <td>Full ProMotion 120Hz</td>
                        <td>Supported (<code>-webkit-backdrop-filter</code>)</td>
                        <td>Auto-fallback to CSS / WebGL2</td>
                      </tr>
                      <tr>
                        <td>Firefox</td>
                        <td>Full 60–240Hz</td>
                        <td>Supported</td>
                        <td>Auto-fallback to CSS / WebGL2</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="docs-stack">
              <div className="doc-block">
                <h3>1. Local Development &amp; Production Build</h3>
                <p>
                  Requires <strong>Node.js 18+</strong>. Runs on Vite 6 + React 18 + TypeScript 5
                  with zero external WebGL frameworks.
                </p>
                <div className="doc-code-box">
                  <div className="doc-code-bar">
                    <span>Terminal</span>
                    <CopyMiniBtn text={INSTALL_SNIPPET} />
                  </div>
                  <pre><code>{INSTALL_SNIPPET}</code></pre>
                </div>
              </div>

              <div className="doc-block">
                <h3>2. Integrate into an Existing React / Next.js / Vite App</h3>
                <p>
                  Copy five lightweight files into your project: <code>webglGlassRenderer.ts</code>,{' '}
                  <code>liquidGlassEngine.ts</code>, <code>GlassSettingsContext.tsx</code>,{' '}
                  <code>GlassStage.tsx</code>, and <code>LiquidGlass.tsx</code>, plus the wallpaper
                  assets in <code>public/wallpapers/</code>. Wrap your app in{' '}
                  <code>&lt;GlassSettingsProvider&gt;</code> and mount any number of{' '}
                  <code>&lt;LiquidGlass&gt;</code> surfaces inside a <code>&lt;GlassStage&gt;</code>.
                </p>
                <div className="doc-code-box">
                  <div className="doc-code-bar">
                    <span>React / TypeScript</span>
                    <CopyMiniBtn text={REACT_USAGE_SNIPPET} />
                  </div>
                  <pre><code>{REACT_USAGE_SNIPPET}</code></pre>
                </div>
              </div>

              <div className="doc-block">
                <h3>3. Vanilla HTML + CSS Quick Setup</h3>
                <p>
                  Don&apos;t need React? Copy the Core CSS utility from the Core Engine tab and
                  apply <code>.liquid-glass</code> to any container with <code>--glass-radius</code>.
                </p>
                <div className="doc-code-box">
                  <div className="doc-code-bar">
                    <span>HTML + CSS</span>
                    <CopyMiniBtn text={HTML_USAGE_SNIPPET} />
                  </div>
                  <pre><code>{HTML_USAGE_SNIPPET}</code></pre>
                </div>
              </div>

              <div className="doc-block">
                <h3>4. Controlling Presets &amp; Theme Programmatically</h3>
                <div className="doc-code-box">
                  <div className="doc-code-bar">
                    <span>useGlassSettings()</span>
                    <CopyMiniBtn text={SETTINGS_HOOK_SNIPPET} />
                  </div>
                  <pre><code>{SETTINGS_HOOK_SNIPPET}</code></pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="docs-stack">
              <div className="doc-block">
                <h3><code>&lt;LiquidGlass /&gt;</code> Props</h3>
                <div className="doc-table-wrap">
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Prop</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>radius</code></td>
                        <td><code>number</code></td>
                        <td><code>24</code></td>
                        <td>Corner radius in px. Use <code>999</code> for full capsules and circular orbs.</td>
                      </tr>
                      <tr>
                        <td><code>variant</code></td>
                        <td><code>&apos;clear&apos; | &apos;tinted&apos; | &apos;dark&apos; | &apos;prominent&apos;</code></td>
                        <td><code>&apos;clear&apos;</code></td>
                        <td>Optical surface material: crystal clear, softly frosted tint, dark obsidian glass, or azure prominent CTA.</td>
                      </tr>
                      <tr>
                        <td><code>bezelWidth</code></td>
                        <td><code>number</code></td>
                        <td>Context (<code>24</code>)</td>
                        <td>Convex meniscus refraction width in px. Use <code>12–18</code> for slim bars/docks and <code>22–28</code> for cards.</td>
                      </tr>
                      <tr>
                        <td><code>specular</code></td>
                        <td><code>number</code></td>
                        <td>Context (<code>0.95</code>)</td>
                        <td>Multiplier for Fresnel rim intensity and pointer-following studio catchlight.</td>
                      </tr>
                      <tr>
                        <td><code>interactive</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Enables pointer-following specular glint across the glass surface on hover.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-block">
                <h3><code>&lt;GlassStage /&gt;</code> Props &amp; Ref Handle</h3>
                <div className="doc-table-wrap">
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Prop / Method</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>scene</code></td>
                        <td><code>&apos;tahoe&apos; | &apos;sunset&apos; | &apos;dark&apos; | &apos;light&apos; | &apos;prism&apos;</code></td>
                        <td>Selects the Full-HD wallpaper scene baked into the stage&apos;s crisp and Gaussian-blurred textures.</td>
                      </tr>
                      <tr>
                        <td><code>ref.requestFrame()</code></td>
                        <td><code>() =&gt; void</code></td>
                        <td>Schedules a single VSync-aligned WebGL2 redraw (0% idle GPU afterwards).</td>
                      </tr>
                      <tr>
                        <td><code>ref.requestBurst(ms)</code></td>
                        <td><code>(durationMs?: number) =&gt; void</code></td>
                        <td>Runs native-refresh-rate redraws during CSS transitions (e.g. Dock hover spread or menu bloom).</td>
                      </tr>
                      <tr>
                        <td><code>ref.setDroplet(d)</code></td>
                        <td><code>(droplet: DropletDescriptor | null) =&gt; void</code></td>
                        <td>Positions an organic smooth-minimum (<code>smin</code>) liquid droplet that fuses into the primary glass card.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-block">
                <h3>Included Component Catalog (10 Components)</h3>
                <div className="doc-catalog-grid">
                  <div><strong>Floating Tab Bar</strong><span>Swipeable &amp; hold-to-drag spring pill + expandable search orb</span></div>
                  <div><strong>Liquid Toggle &amp; Slider</strong><span>Droplet-expanding switches + magnifying optical sliders</span></div>
                  <div><strong>Segmented Control</strong><span>Swipeable multi-segment selector with label &amp; icon variants</span></div>
                  <div><strong>Buttons &amp; Action Capsule</strong><span>Clear, prominent azure, tinted, grouped toolbar &amp; circular orbs</span></div>
                  <div><strong>Control Center Modules</strong><span>2×2 connectivity grid, vertical drag sliders &amp; Focus mode pill</span></div>
                  <div><strong>Now Playing Glass Card</strong><span>Interactive music player with scrubbing, track switching &amp; favorites</span></div>
                  <div><strong>Context Menu &amp; Popover</strong><span>Spring-blooming popover with quick actions &amp; keyboard shortcuts</span></div>
                  <div><strong>Notification Stack</strong><span>Collapsible/expandable depth-scaled banner stack with dismiss/restore</span></div>
                  <div><strong>Alert Dialog Sheet</strong><span>Centered concentric-corner iOS 26 modal sheet with action pills</span></div>
                  <div><strong>macOS Tahoe Dock</strong><span>Full icon set, utility divider, Downloads/Trash &amp; parabolic magnification</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'physics' && (
            <div className="docs-stack">
              <div className="doc-block">
                <h3>Optical Refraction &amp; Chromatic Dispersion</h3>
                <p>
                  Every glass element is evaluated as an analytic rounded-rectangle Signed Distance
                  Field (<code>sdRoundedBox</code>). Inside the outer bezel region{' '}
                  <code>t = distIn / bezel</code>, the surface follows Apple&apos;s convex squircle
                  height profile <code>h(u) = (1 - u⁴)^(1/4)</code> and deflects rays using{' '}
                  <strong>Snell&apos;s Law</strong> (<code>IOR = 1.48</code>).
                </p>
                <p>
                  RGB chromatic dispersion is computed physically by sampling the refracted
                  background at three slightly offset refractive indices (red, green, blue) rather
                  than overlaying fake rainbow gradients. Meanwhile, the surrounding wallpaper uses
                  subtle photographic depth-of-field blur (<code>uBgSoftness</code> + radial edge
                  bokeh) so foreground glass surfaces highlight and push forward naturally.
                </p>
              </div>

              <div className="doc-block">
                <h3>Calibrated Material Presets</h3>
                <div className="doc-table-wrap">
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Preset</th>
                        <th>Refraction</th>
                        <th>Frost</th>
                        <th>Dispersion</th>
                        <th>Specular</th>
                        <th>Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Clear</strong></td>
                        <td><code>0.88</code></td>
                        <td><code>3.4</code></td>
                        <td><code>16%</code></td>
                        <td><code>95%</code></td>
                        <td>Default iOS 26 / macOS Tahoe navbars, docks &amp; media cards</td>
                      </tr>
                      <tr>
                        <td><strong>Regular</strong></td>
                        <td><code>0.65</code></td>
                        <td><code>5.2</code></td>
                        <td><code>8%</code></td>
                        <td><code>85%</code></td>
                        <td>Text-heavy notifications, popovers &amp; alert sheets</td>
                      </tr>
                      <tr>
                        <td><strong>Crystal</strong></td>
                        <td><code>1.25</code></td>
                        <td><code>1.2</code></td>
                        <td><code>18%</code></td>
                        <td><code>115%</code></td>
                        <td>High-clarity optical lenses &amp; showcase widgets</td>
                      </tr>
                      <tr>
                        <td><strong>Prism</strong></td>
                        <td><code>1.15</code></td>
                        <td><code>2.2</code></td>
                        <td><code>34%</code></td>
                        <td><code>110%</code></td>
                        <td>Hero cards showcasing vivid RGB meniscus dispersion</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theming' && (
            <div className="docs-stack">
              <div className="doc-block">
                <h3>Light &amp; Dark Adaptive Architecture</h3>
                <p>
                  GlassKit separates the <strong>site shell theme</strong> (<code>.theme-dark</code>{' '}
                  and <code>.theme-light</code>) from each stage&apos;s <strong>optical tone</strong>{' '}
                  (<code>.stage-tone-dark</code> for Tahoe, Sunset, Midnight, Spectrum and{' '}
                  <code>.stage-tone-light</code> for Studio). Over bright wallpaper regions, the
                  shader gently stabilizes highlight exposure while keeping clear translucency so
                  both white and dark ink stay razor-legible.
                </p>
              </div>

              <div className="doc-block">
                <h3>High-Refresh-Rate &amp; Accessibility Engineering</h3>
                <ul className="doc-bullets">
                  <li>
                    <strong>Device Refresh-Rate Independent Motion:</strong> All continuous animations
                    (liquid droplet tracking and hero card drag) use timestamp-based exponential
                    smoothing <code>1 - Math.exp(-lambda * dt)</code> so 60Hz, 120Hz ProMotion,
                    144Hz, and 240Hz displays feel identically fluid.
                  </li>
                  <li>
                    <strong>Zero-Re-Render GPU Dragging:</strong> Dragging the hero card writes{' '}
                    <code>translate3d()</code> directly to the GPU layer inside{' '}
                    <code>requestAnimationFrame</code> without triggering React state renders.
                  </li>
                  <li>
                    <strong>0% Idle GPU &amp; Context Safety:</strong> One shared offscreen WebGL2
                    context with cached attribute locations and <code>WeakMap</code> 2D blit
                    contexts redraws strictly on demand and pauses automatically off-screen via{' '}
                    <code>IntersectionObserver</code>.
                  </li>
                  <li>
                    <strong>Accessibility:</strong> Semantic ARIA roles (<code>tablist</code>,{' '}
                    <code>switch</code>, <code>slider</code>, <code>menu</code>), keyboard support,
                    visible focus rings, and full <code>prefers-reduced-motion</code> support.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'engine' && (
            <div className="docs-stack">
              <div className="doc-block">
                <h3>Drop-in Core Engine Source</h3>
                <p>
                  Copy the CSS material for lightweight glass surfaces, the SVG displacement filter
                  for Chromium DOM lensing, or the WebGL2 GLSL shader for cross-browser physical
                  Snell refraction and chromatic dispersion.
                </p>
                <div className="setup-code-wrap">
                  <CodeBlock
                    title="Liquid Glass Core Engine"
                    tabs={[
                      { label: 'Core CSS', code: CORE_ENGINE_CSS },
                      { label: 'SVG DOM Refraction', code: CORE_ENGINE_SVG_JS },
                      { label: 'WebGL2 GLSL Shader', code: CORE_ENGINE_WEBGL },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

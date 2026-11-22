import React, { useEffect, useState } from 'react';
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

const VALID_TAB_IDS = new Set<DocTabId>(DOC_TABS.map((t) => t.id));

function readTabFromHash(): DocTabId {
  if (typeof window === 'undefined') return 'overview';
  const raw = window.location.hash.replace(/^#/, '') as DocTabId;
  return VALID_TAB_IDS.has(raw) ? raw : 'overview';
}

const NPM_INSTALL_SNIPPET = `# Install the GlassKit React + WebGL2 package (v2.0)
npm install glasskit-liquid-glass

# Or develop the showcase & library locally
git clone https://github.com/shasantx/liquidglass.git
cd liquidglass
npm install
npm run dev       # Start interactive studio
npm run build:lib # Build publishable package -> dist-lib/`;

const REACT_USAGE_SNIPPET = `import 'glasskit-liquid-glass/styles.css';
import {
  GlassSettingsProvider,
  GlassStage,
  LiquidGlass,
  GlassButton,
} from 'glasskit-liquid-glass';

export function MyGlassSurface() {
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

const SETTINGS_HOOK_SNIPPET = `import { useGlassSettings } from 'glasskit-liquid-glass';

export function OpticalPresetBar() {
  const { settings, updateSetting, applyPreset, resetSettings } = useGlassSettings();

  return (
    <div>
      <button onClick={() => applyPreset('clear')}>Clear</button>
      <button onClick={() => applyPreset('crystal')}>Crystal</button>
      <button onClick={() => updateSetting('renderMode', 'svg')}>Preview SVG Mode</button>
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
  const [activeTab, setActiveTab] = useState<DocTabId>(readTabFromHash);

  useEffect(() => {
    const onHashChange = () => setActiveTab(readTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const label = DOC_TABS.find((t) => t.id === activeTab)?.label ?? 'Documentation';
    document.title = `${label} — GlassKit v2.0 Docs`;
  }, [activeTab]);

  const selectTab = (tabId: DocTabId) => {
    setActiveTab(tabId);
    const nextUrl = `/docs#${tabId}`;
    if (window.location.pathname + window.location.hash !== nextUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  };

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
            <Code2 size={13} /> GlassKit v2.0 Documentation &amp; API
          </span>
        </div>

        <div className="docs-header-copy">
          <h1>GlassKit Documentation</h1>
          <p>
            Installable React package guides, custom background stage setup, all 10 reusable
            component APIs, Snell optical physics calibration, and drop-in shader source.
          </p>
        </div>
      </div>

      <div className="docs-layout">
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
                  onClick={() => selectTab(tab.id)}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div key={activeTab} className="docs-content blur-morph-in" role="tabpanel">
          {activeTab === 'overview' && (
            <div className="docs-stack">
              <div className="doc-block">
                <h3>3-Tier Optical Architecture</h3>
                <p>
                  GlassKit v2.0 ships as a publishable React library with zero required icon or
                  WebGL framework dependencies. Every surface renders authentic Apple iOS 26 &amp;
                  macOS Tahoe Liquid Glass without hitting WebGL context limits or draining idle GPU.
                </p>
                <div className="doc-cards-grid">
                  <div className="doc-mini-card">
                    <strong>1. Shared WebGL2 Engine</strong>
                    <p>
                      A single offscreen WebGL2 context renders all stages on the page with custom
                      background images or calibrated scenes, 2-pass separable 17-tap Gaussian frost
                      baking, per-element optical overrides, and 0% idle GPU.
                    </p>
                  </div>
                  <div className="doc-mini-card">
                    <strong>2. SVG DOM Displacement</strong>
                    <p>
                      For standalone DOM surfaces in Chromium, <code>&lt;LiquidGlass /&gt;</code>{' '}
                      automatically generates quantized 2D RG Snell displacement maps for live{' '}
                      <code>backdrop-filter: url(#...)</code> edge refraction.
                    </p>
                  </div>
                  <div className="doc-mini-card">
                    <strong>3. Pure CSS Fallback</strong>
                    <p>
                      When used in <code>renderMode=&quot;css&quot;</code> or on devices without
                      WebGL2, <code>&lt;LiquidGlass /&gt;</code> degrades to multi-layered
                      translucent <code>backdrop-filter</code> glass with Fresnel rim hairlines.
                    </p>
                  </div>
                </div>
              </div>

              <div className="doc-block">
                <h3>Package &amp; Workspace Structure</h3>
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
                        <td><code>src/glasskit/index.ts</code></td>
                        <td>Main npm entry point exporting primitives, optical engines, and all 10 UI components.</td>
                      </tr>
                      <tr>
                        <td><code>src/glasskit/core/*</code></td>
                        <td>Shared WebGL2 renderer (custom image URLs + <code>uOptics[12]</code>), SVG Snell map generator, and persistent settings provider.</td>
                      </tr>
                      <tr>
                        <td><code>src/glasskit/primitives/*</code></td>
                        <td><code>&lt;GlassStage /&gt;</code> and <code>&lt;LiquidGlass /&gt;</code> supporting WebGL2, SVG DOM, and pure CSS tiers.</td>
                      </tr>
                      <tr>
                        <td><code>src/glasskit/components/*</code></td>
                        <td>10 prop-driven reusable React components with zero forced icon dependencies.</td>
                      </tr>
                      <tr>
                        <td><code>src/glasskit/styles/glasskit.css</code></td>
                        <td>Standalone library CSS emitted as <code>glasskit-liquid-glass/styles.css</code>.</td>
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
                <h3>1. Install the Package</h3>
                <p>
                  Requires <strong>React 18+</strong> and <strong>Node.js 18+</strong>. Zero external
                  WebGL or icon library dependencies required.
                </p>
                <div className="doc-code-box">
                  <div className="doc-code-bar">
                    <span>Terminal</span>
                    <CopyMiniBtn text={NPM_INSTALL_SNIPPET} />
                  </div>
                  <pre><code>{NPM_INSTALL_SNIPPET}</code></pre>
                </div>
              </div>

              <div className="doc-block">
                <h3>2. Use in React / Next.js / Vite</h3>
                <p>
                  Import <code>glasskit-liquid-glass/styles.css</code> once at your app root, wrap
                  your app in <code>&lt;GlassSettingsProvider&gt;</code>, and pass any custom{' '}
                  <code>backgroundImage</code> URL (or built-in <code>scene</code>) to{' '}
                  <code>&lt;GlassStage&gt;</code>.
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
                <h3>4. Controlling Presets, Engine Tier &amp; Theme</h3>
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
                        <td>Optical surface material: crystal clear, softly frosted tint, dark obsidian glass, or azure CTA.</td>
                      </tr>
                      <tr>
                        <td><code>refraction</code></td>
                        <td><code>number</code></td>
                        <td>Context (<code>0.88</code>)</td>
                        <td>Per-surface Snell meniscus refraction multiplier (<code>0</code> to <code>1.8</code>).</td>
                      </tr>
                      <tr>
                        <td><code>blur</code></td>
                        <td><code>number</code></td>
                        <td>Context (<code>3.4</code>)</td>
                        <td>Per-surface interior optical frost depth (<code>0</code> to <code>6</code>).</td>
                      </tr>
                      <tr>
                        <td><code>aberration</code></td>
                        <td><code>number</code></td>
                        <td>Context (<code>0.16</code>)</td>
                        <td>Per-surface physical 3-channel RGB chromatic dispersion (<code>0</code> to <code>0.45</code>).</td>
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
                        <td><code>renderMode</code></td>
                        <td><code>&apos;auto&apos; | &apos;webgl&apos; | &apos;svg&apos; | &apos;css&apos;</code></td>
                        <td><code>&apos;auto&apos;</code></td>
                        <td>Explicitly select WebGL2 stage, SVG DOM displacement, or pure CSS fallback per surface.</td>
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
                        <td>Built-in wallpaper scene baked into crisp &amp; Gaussian-blurred textures (default <code>&apos;tahoe&apos;</code>).</td>
                      </tr>
                      <tr>
                        <td><code>backgroundImage</code></td>
                        <td><code>string</code></td>
                        <td>Any custom image URL (remote CORS image, local path, data URL, or uploaded blob URL).</td>
                      </tr>
                      <tr>
                        <td><code>tone</code></td>
                        <td><code>&apos;dark&apos; | &apos;light&apos;</code></td>
                        <td>Controls optical contrast and typography color for dark or bright wallpapers.</td>
                      </tr>
                      <tr>
                        <td><code>renderMode</code></td>
                        <td><code>&apos;auto&apos; | &apos;webgl&apos; | &apos;svg&apos; | &apos;css&apos;</code></td>
                        <td>Overrides rendering tier for all surfaces inside this stage.</td>
                      </tr>
                      <tr>
                        <td><code>style / className</code></td>
                        <td><code>HTMLDivElement</code> props</td>
                        <td>All standard container props including <code>style</code>, <code>id</code>, and ARIA attributes.</td>
                      </tr>
                      <tr>
                        <td><code>ref.requestFrame()</code></td>
                        <td><code>() =&gt; void</code></td>
                        <td>Schedules a single VSync-aligned WebGL2 redraw (0% idle GPU afterwards).</td>
                      </tr>
                      <tr>
                        <td><code>ref.requestBurst(ms)</code></td>
                        <td><code>(durationMs?: number) =&gt; void</code></td>
                        <td>Runs native-refresh-rate redraws during CSS transitions (e.g. Dock hover spread).</td>
                      </tr>
                      <tr>
                        <td><code>ref.setDroplet(d)</code></td>
                        <td><code>(droplet: DropletDescriptor | null) =&gt; void</code></td>
                        <td>Positions an organic smooth-minimum (<code>smin</code>) liquid droplet that fuses into the primary card.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-block">
                <h3>Exported React Components (10 Components)</h3>
                <div className="doc-catalog-grid">
                  <div><strong><code>&lt;GlassTabBar /&gt;</code></strong><span>Swipeable floating tab bar + optional expandable search orb</span></div>
                  <div><strong><code>&lt;GlassSwitch /&gt;</code> &amp; <code>&lt;GlassSlider /&gt;</code></strong><span>Droplet-expanding switches + magnifying optical sliders</span></div>
                  <div><strong><code>&lt;GlassSegmentedControl /&gt;</code></strong><span>Swipeable multi-segment selector with label &amp; icon variants</span></div>
                  <div><strong><code>&lt;GlassButton /&gt;</code> / <code>Group</code> / <code>Icon</code></strong><span>Clear, prominent azure, tinted, grouped toolbar &amp; circular orbs</span></div>
                  <div><strong><code>&lt;GlassControlCenter /&gt;</code></strong><span>2×2 connectivity grid, vertical drag sliders &amp; Focus mode pill</span></div>
                  <div><strong><code>&lt;GlassMediaPlayer /&gt;</code></strong><span>Interactive Now Playing card with scrubbing, track switching &amp; favorites</span></div>
                  <div><strong><code>&lt;GlassContextMenu /&gt;</code></strong><span>Spring-blooming popover with quick actions &amp; keyboard shortcuts</span></div>
                  <div><strong><code>&lt;GlassNotificationStack /&gt;</code></strong><span>Collapsible/expandable depth-scaled banner stack with dismiss/restore</span></div>
                  <div><strong><code>&lt;GlassAlertSheet /&gt;</code></strong><span>Centered concentric-corner iOS 26 modal sheet with action pills</span></div>
                  <div><strong><code>&lt;GlassDock /&gt;</code></strong><span>Parabolic hover magnification dock with optional utility divider</span></div>
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
                  and <code>.theme-light</code>, persisted automatically in <code>localStorage</code>)
                  from each stage&apos;s <strong>optical tone</strong> (<code>tone=&quot;dark&quot;</code>{' '}
                  and <code>tone=&quot;light&quot;</code>). Over bright wallpaper regions, the shader
                  stabilizes highlight exposure while keeping clear translucency so white and dark
                  ink stay razor-legible.
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

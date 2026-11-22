import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Github,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { GlassSettingsProvider, useGlassSettings } from './context/GlassSettingsContext';
import { HeroWebGLStage } from './components/HeroWebGLStage';
import { ComponentStage } from './components/ComponentStage';
import { CodeBlock } from './components/CodeBlock';
import { DocsSection } from './components/DocsSection';
import { ScrollReveal } from './components/ScrollReveal';
import {
  LIBRARY_COMPONENTS,
  CORE_ENGINE_CSS,
  CORE_ENGINE_SVG_JS,
  CORE_ENGINE_WEBGL,
} from './data/componentRegistry';

const CATEGORIES = ['All', 'Navigation', 'Controls', 'Widgets', 'Overlays'] as const;

const WIDE_COMPONENT_IDS = new Set([
  'floating-tab-bar',
  'liquid-toggle-slider',
  'media-player',
  'macos-dock',
]);

type NavSectionId = 'showcase' | 'components' | 'docs' | 'engine';
type AppRoute = 'home' | 'docs';

function resolveRoute(pathname: string): AppRoute {
  return pathname === '/docs' || pathname.startsWith('/docs/') ? 'docs' : 'home';
}

/** Custom animated optical prism lens icon for Showcase */
const ShowcaseNavIcon: React.FC = () => (
  <svg
    className="nav-anim-icon nav-icon-showcase"
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.45" strokeOpacity="0.45" />
    <path
      className="nav-orbit-facet"
      d="M8 2.4L11.8 8L8 13.6L4.2 8L8 2.4Z"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinejoin="round"
    />
    <circle className="nav-orbit-core" cx="8" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

/** Custom animated 2x2 bento modules icon for Components */
const ComponentsNavIcon: React.FC = () => (
  <svg
    className="nav-anim-icon nav-icon-components"
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect className="bento-tile tile-1" x="2" y="2" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.45" />
    <rect className="bento-tile tile-2" x="9" y="2" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.45" />
    <rect className="bento-tile tile-3" x="2" y="9" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.45" />
    <rect className="bento-tile tile-4" x="9" y="9" width="5" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.45" />
  </svg>
);

/** Custom animated document lines icon for Docs */
const DocsNavIcon: React.FC = () => (
  <svg
    className="nav-anim-icon nav-icon-docs"
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect x="2.5" y="1.8" width="11" height="12.4" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
    <line className="doc-line doc-line-1" x1="5.2" y1="5.6" x2="10.8" y2="5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line className="doc-line doc-line-2" x1="5.2" y1="8.4" x2="10.8" y2="8.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line className="doc-line doc-line-3" x1="5.2" y1="11.2" x2="8.6" y2="11.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** Custom animated shader/terminal pulse icon for Engine */
const EngineNavIcon: React.FC = () => (
  <svg
    className="nav-anim-icon nav-icon-engine"
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      className="engine-chevron"
      d="M2.5 5L6 8L2.5 11"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      className="engine-cursor"
      x1="8"
      y1="11"
      x2="13.5"
      y2="11"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
    />
    <circle className="engine-spark" cx="12" cy="5.5" r="1.35" fill="currentColor" />
  </svg>
);

const GlassKitShell: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(() => resolveRoute(window.location.pathname));
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [navCopied, setNavCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState<NavSectionId>(() =>
    resolveRoute(window.location.pathname) === 'docs' ? 'docs' : 'showcase'
  );
  const progressRef = useRef<HTMLDivElement>(null);
  const { settings, updateSetting } = useGlassSettings();

  useEffect(() => {
    const bg = settings.siteTheme === 'dark' ? '#05060a' : '#f4f5f8';
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', bg);
    }
  }, [settings.siteTheme]);

  // Sync browser Back / Forward navigation between "/" and "/docs"
  useEffect(() => {
    const onPopState = () => {
      const next = resolveRoute(window.location.pathname);
      setRoute(next);
      setActiveNav(next === 'docs' ? 'docs' : 'showcase');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (targetRoute: AppRoute, sectionId?: string, navId?: NavSectionId) => {
    const nextUrl =
      targetRoute === 'docs' ? '/docs' : sectionId ? `/#${sectionId}` : '/';

    if (window.location.pathname + window.location.hash !== nextUrl) {
      window.history.pushState({}, '', nextUrl);
    }

    const switchingPage = route !== targetRoute;
    setRoute(targetRoute);
    setActiveNav(navId ?? (targetRoute === 'docs' ? 'docs' : 'showcase'));

    if (targetRoute === 'docs') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const scrollTarget = () => {
      if (!sectionId || sectionId === 'optical-lab') {
        window.scrollTo({ top: 0, behavior: switchingPage ? 'instant' : 'smooth' });
      } else {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: switchingPage ? 'instant' : 'smooth', block: 'start' });
      }
    };

    if (switchingPage) {
      requestAnimationFrame(() => requestAnimationFrame(scrollTarget));
    } else {
      scrollTarget();
    }
  };

  // Passive compositor-only scroll listener for sticky center navbar + progress hairline + active section
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const threshold = window.innerWidth <= 820 ? 58 : 42;
        setScrolled(y > threshold);
        if (progressRef.current) {
          const docH = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docH > 0 ? Math.max(0, Math.min(1, y / docH)) : 0;
          progressRef.current.style.transform = `scaleX(${pct.toFixed(4)})`;
        }
        if (route === 'docs') {
          setActiveNav('docs');
          return;
        }
        const engineEl = document.getElementById('quick-setup');
        const compEl = document.getElementById('components');
        if (y < 120) {
          setActiveNav('showcase');
        } else if (engineEl && engineEl.getBoundingClientRect().top <= 300) {
          setActiveNav('engine');
        } else if (compEl && compEl.getBoundingClientRect().top <= 300) {
          setActiveNav('components');
        } else {
          setActiveNav('showcase');
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [route]);

  const filteredComponents = useMemo(() => {
    return LIBRARY_COMPONENTS.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const copyQuickCss = async () => {
    try {
      await navigator.clipboard.writeText(CORE_ENGINE_CSS);
      setNavCopied(true);
      setTimeout(() => setNavCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`page-shell theme-${settings.siteTheme}`}>
      {/* Subtle static ambient studio aura behind hero (0% GPU animation cost) */}
      <div className="studio-ambient-glow" aria-hidden="true" />

      {/* Scroll-reactive optical progress hairline */}
      <div className="scroll-progress-track" aria-hidden="true">
        <div ref={progressRef} className="scroll-progress-bar" />
      </div>

      {/* Sticky Top Header — sits cleanly above Hero on load; center matte pill stays visible on scroll */}
      <header className={`studio-navbar-wrap ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="studio-navbar">
          <a
            href="/"
            className="navbar-brand"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home', 'optical-lab', 'showcase');
            }}
          >
            <img src="/logo.jpg" alt="" className="brand-logo-mark" width={30} height={30} />
            <span className="brand-word">GlassKit</span>
          </a>

          <div className="navbar-center-slot">
            <nav className="navbar-center-nav" aria-label="Primary navigation">
              <a
                href="/#optical-lab"
                className={`nav-pill-link ${activeNav === 'showcase' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('home', 'optical-lab', 'showcase');
                }}
              >
                <ShowcaseNavIcon />
                <span>Showcase</span>
              </a>
              <a
                href="/#components"
                className={`nav-pill-link ${activeNav === 'components' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('home', 'components', 'components');
                }}
              >
                <ComponentsNavIcon />
                <span>Components</span>
              </a>
              <a
                href="/docs"
                className={`nav-pill-link ${activeNav === 'docs' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('docs', undefined, 'docs');
                }}
              >
                <DocsNavIcon />
                <span>Docs</span>
              </a>
              <a
                href="/#quick-setup"
                className={`nav-pill-link ${activeNav === 'engine' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('home', 'quick-setup', 'engine');
                }}
              >
                <EngineNavIcon />
                <span>Engine</span>
              </a>
            </nav>
          </div>

          <div className="navbar-actions">
            <a
              href="https://github.com/shasantx/liquidglass"
              target="_blank"
              rel="noreferrer"
              className="navbar-icon-btn"
              aria-label="View on GitHub"
              title="GitHub Repository"
            >
              <Github size={15} />
            </a>

            <button
              type="button"
              className="navbar-icon-btn"
              onClick={() =>
                updateSetting('siteTheme', settings.siteTheme === 'dark' ? 'light' : 'dark')
              }
              aria-label={`Switch to ${settings.siteTheme === 'dark' ? 'light' : 'dark'} appearance`}
              title="Toggle appearance"
            >
              {settings.siteTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button type="button" className="nav-cta-pill" onClick={copyQuickCss}>
              {navCopied ? <Check size={13} /> : <Copy size={13} />}
              <span>{navCopied ? 'Copied' : 'Copy CSS'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-container">
        {route === 'docs' ? (
          <DocsSection
            onBackToShowcase={() => navigateTo('home', 'optical-lab', 'showcase')}
          />
        ) : (
          <>
            {/* Flagship Full-HD Interactive Liquid Glass Showcase */}
            <HeroWebGLStage />

            {/* Curated Component Library */}
            <section id="components" className="library-section">
              <ScrollReveal>
                <div className="library-head-bar">
                  <div className="library-title-wrap">
                    <h2>Components</h2>
                    <span className="library-count">{filteredComponents.length}</span>
                  </div>

                  <div className="library-filter-controls">
                    <div className="lib-search-box">
                      <Search size={14} />
                      <input
                        type="search"
                        placeholder="Filter components"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Filter components"
                      />
                    </div>

                    <div className="lib-category-tabs" role="tablist" aria-label="Component categories">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          role="tab"
                          aria-selected={selectedCategory === cat}
                          className={selectedCategory === cat ? 'is-active' : ''}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {filteredComponents.length === 0 ? (
                <div className="empty-filter-state blur-morph-in">
                  <p>No components match &ldquo;{searchQuery}&rdquo;.</p>
                  <button
                    type="button"
                    className="inspector-reset"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Reset filter
                  </button>
                </div>
              ) : (
                <div key={selectedCategory} className="bento-component-grid blur-morph-in">
                  {filteredComponents.map((spec, idx) => {
                    const DemoComponent = spec.component;
                    const isWide =
                      WIDE_COMPONENT_IDS.has(spec.id) || filteredComponents.length === 1;
                    return (
                      <ScrollReveal
                        key={spec.id}
                        delayMs={(idx % 2) * 70}
                        className={isWide ? 'bento-span-full' : 'bento-span-half'}
                      >
                        <ComponentStage
                          id={spec.id}
                          name={spec.name}
                          category={spec.category}
                          description={spec.description}
                          defaultBackdrop={spec.defaultBackdrop}
                          htmlCss={spec.htmlCss}
                          react={spec.react}
                        >
                          <DemoComponent />
                        </ComponentStage>
                      </ScrollReveal>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Drop-in Engine Snippets */}
            <ScrollReveal>
              <section id="quick-setup" className="setup-section setup-section-home">
                <div className="setup-header">
                  <div>
                    <h3>Drop-in Engine</h3>
                    <p>
                      Copy the CSS material for lightweight glass surfaces, the SVG displacement
                      filter for Chromium DOM lensing, or the WebGL2 GLSL shader for cross-browser
                      physical Snell refraction and chromatic dispersion.
                    </p>
                  </div>
                </div>

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
              </section>
            </ScrollReveal>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand-wrap">
              <img src="/logo.jpg" alt="" className="footer-logo-mark" width={22} height={22} />
              <span className="footer-brand">GlassKit</span>
            </span>
            <span>Apple iOS 26 &amp; macOS Tahoe optical interface components.</span>
          </div>
          <a
            href="https://github.com/shasantx/liquidglass"
            target="_blank"
            rel="noreferrer"
            className="footer-gh-link"
          >
            <Github size={14} />
            <span>shasantx/liquidglass</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GlassSettingsProvider>
      <GlassKitShell />
    </GlassSettingsProvider>
  );
}

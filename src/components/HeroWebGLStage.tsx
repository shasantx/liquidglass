import React, { useEffect, useRef, useState } from 'react';
import {
  Aperture,
  ArrowRight,
  Blend,
  Check,
  Contrast,
  Copy,
  Cpu,
  Droplets,
  ImagePlus,
  Layers,
  Move,
  Music2,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  Terminal,
  X,
} from 'lucide-react';
import {
  GlassPreset,
  GlassRenderMode,
  useGlassSettings,
} from '../context/GlassSettingsContext';
import { sharedGlassEngine, WallpaperScene } from '../lib/webglGlassRenderer';
import { GlassStage, GlassStageHandle } from './GlassStage';
import { LiquidGlass } from './LiquidGlass';
import { MediaPlayerDemo } from '../demos/MediaPlayerDemo';

type HeroMode = 'player' | 'lens';

const HERO_WALLPAPERS: { id: WallpaperScene; label: string }[] = [
  { id: 'tahoe', label: 'Tahoe' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'dark', label: 'Midnight' },
  { id: 'light', label: 'Studio' },
  { id: 'prism', label: 'Spectrum' },
];

const HERO_PRESETS: { id: GlassPreset; label: string }[] = [
  { id: 'clear', label: 'Clear' },
  { id: 'regular', label: 'Regular' },
  { id: 'crystal', label: 'Crystal' },
  { id: 'prism', label: 'Prism' },
];

const RENDER_TIERS: { id: GlassRenderMode; label: string }[] = [
  { id: 'webgl', label: 'WebGL2' },
  { id: 'svg', label: 'SVG DOM' },
  { id: 'css', label: 'CSS' },
];

const INSTALL_CMD = 'npm install glasskit-liquid-glass';

interface HeroWebGLStageProps {
  onOpenDocs?: () => void;
}

export const HeroWebGLStage: React.FC<HeroWebGLStageProps> = ({ onOpenDocs }) => {
  const { settings, updateSetting, applyPreset, resetSettings } = useGlassSettings();
  const stageHandleRef = useRef<GlassStageHandle>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const dragElRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scene, setScene] = useState<WallpaperScene>('tahoe');
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [customTone, setCustomTone] = useState<'dark' | 'light'>('dark');
  const [dragOverFile, setDragOverFile] = useState(false);

  const [heroMode, setHeroMode] = useState<HeroMode>('player');
  const [activePreset, setActivePreset] = useState<GlassPreset | null>('clear');
  const [installCopied, setInstallCopied] = useState(false);
  const [configCopied, setConfigCopied] = useState(false);

  const [draggingCard, setDraggingCard] = useState(false);
  const draggingCardRef = useRef(false);
  const cardTargetRef = useRef({ x: 0, y: 0 });
  const cardCurrRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 });

  const dropTargetRef = useRef({ x: 0.16, y: 0.5, active: false });
  const dropCurrRef = useRef({ x: 0.16, y: 0.5, alpha: 0 });
  const morphRef = useRef(settings.morphStrength);
  morphRef.current = settings.morphStrength;

  const animRafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Clean up object URLs on replace/unmount
  useEffect(() => {
    return () => {
      if (customBgUrl) {
        sharedGlassEngine.evictImage(customBgUrl);
        URL.revokeObjectURL(customBgUrl);
      }
    };
  }, [customBgUrl]);

  const applyCustomImageFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const nextUrl = URL.createObjectURL(file);
    setCustomBgUrl((prev) => {
      if (prev) {
        sharedGlassEngine.evictImage(prev);
        URL.revokeObjectURL(prev);
      }
      return nextUrl;
    });
  };

  const clearCustomBg = () => {
    setCustomBgUrl((prev) => {
      if (prev) {
        sharedGlassEngine.evictImage(prev);
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  };

  // Device refresh-rate independent (60Hz / 120Hz / 144Hz / 240Hz) exponential smoothing loop
  const runMotionLoop = (now: number) => {
    animRafRef.current = 0;
    const prev = lastFrameTimeRef.current || now - 16.667;
    lastFrameTimeRef.current = now;
    const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));

    const dropPosEase = 1 - Math.exp(-15 * dt);
    const dropFadeEase = 1 - Math.exp(-13 * dt);
    const cardEase = 1 - Math.exp(-(draggingCardRef.current ? 28 : 16) * dt);

    const dTarget = dropTargetRef.current;
    const dCurr = dropCurrRef.current;
    const targetAlpha = dTarget.active ? 1 : 0;
    dCurr.x += (dTarget.x - dCurr.x) * dropPosEase;
    dCurr.y += (dTarget.y - dCurr.y) * dropPosEase;
    dCurr.alpha += (targetAlpha - dCurr.alpha) * dropFadeEase;

    const cTarget = cardTargetRef.current;
    const cCurr = cardCurrRef.current;
    cCurr.x += (cTarget.x - cCurr.x) * cardEase;
    cCurr.y += (cTarget.y - cCurr.y) * cardEase;
    if (dragElRef.current) {
      dragElRef.current.style.transform = `translate3d(${cCurr.x.toFixed(2)}px, ${cCurr.y.toFixed(2)}px, 0)`;
    }

    const handle = stageHandleRef.current;
    if (handle) {
      if (dCurr.alpha > 0.006) {
        handle.setDroplet({
          x: dCurr.x,
          y: dCurr.y,
          radius: 0.068,
          morph: morphRef.current,
          opacity: dCurr.alpha,
        });
      } else {
        handle.setDroplet(null);
      }
      handle.requestFrame();
    }

    const dropDelta =
      Math.abs(dTarget.x - dCurr.x) +
      Math.abs(dTarget.y - dCurr.y) +
      Math.abs(targetAlpha - dCurr.alpha);
    const cardDelta = Math.abs(cTarget.x - cCurr.x) + Math.abs(cTarget.y - cCurr.y);

    if (dropDelta > 0.0015 || cardDelta > 0.15) {
      animRafRef.current = requestAnimationFrame(runMotionLoop);
    } else {
      dCurr.x = dTarget.x;
      dCurr.y = dTarget.y;
      dCurr.alpha = targetAlpha;
      cCurr.x = cTarget.x;
      cCurr.y = cTarget.y;
      if (dragElRef.current) {
        dragElRef.current.style.transform = `translate3d(${cCurr.x.toFixed(2)}px, ${cCurr.y.toFixed(2)}px, 0)`;
      }
      if (dCurr.alpha <= 0.006) {
        stageHandleRef.current?.setDroplet(null);
      }
      stageHandleRef.current?.requestFrame();
      lastFrameTimeRef.current = 0;
    }
  };

  const wakeMotion = () => {
    if (!animRafRef.current) {
      lastFrameTimeRef.current = 0;
      animRafRef.current = requestAnimationFrame(runMotionLoop);
    }
  };

  useEffect(() => {
    const onViewportResize = () => {
      if (cardTargetRef.current.x !== 0 || cardTargetRef.current.y !== 0) {
        cardTargetRef.current = { x: 0, y: 0 };
        wakeMotion();
      }
      stageHandleRef.current?.requestBurst(240);
    };
    window.addEventListener('resize', onViewportResize, { passive: true });
    window.addEventListener('orientationchange', onViewportResize);
    return () => {
      window.removeEventListener('resize', onViewportResize);
      window.removeEventListener('orientationchange', onViewportResize);
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (dragElRef.current) {
      dragElRef.current.style.transform = `translate3d(${cardCurrRef.current.x.toFixed(2)}px, ${cardCurrRef.current.y.toFixed(2)}px, 0)`;
    }
    stageHandleRef.current?.requestFrame();
  }, [heroMode]);

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingCardRef.current || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / Math.max(1, rect.width)));
    const ny = Math.max(0.08, Math.min(0.92, 1 - (e.clientY - rect.top) / Math.max(1, rect.height)));
    dropTargetRef.current = { x: nx, y: ny, active: true };
    wakeMotion();
  };

  const handleStagePointerLeave = () => {
    dropTargetRef.current = { ...dropTargetRef.current, active: false };
    wakeMotion();
  };

  const onCardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, a')) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    draggingCardRef.current = true;
    setDraggingCard(true);
    dropTargetRef.current = { ...dropTargetRef.current, active: false };
    dragStartRef.current = {
      px: e.clientX,
      py: e.clientY,
      ox: cardTargetRef.current.x,
      oy: cardTargetRef.current.y,
    };
    wakeMotion();
  };

  const onCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingCardRef.current) return;
    const wrap = heroWrapRef.current;
    const card = dragElRef.current;
    const stageW = wrap ? wrap.clientWidth : 800;
    const stageH = wrap ? Math.min(wrap.clientHeight, 620) : 480;
    const cardW = card ? card.offsetWidth : 340;
    const cardH = card ? card.offsetHeight : 220;
    const maxX = Math.max(14, Math.min(stageW * 0.28, (stageW - cardW) * 0.5 - 8));
    const maxY = Math.max(18, Math.min(stageH * 0.22, (stageH - cardH) * 0.32));
    const nx = Math.max(-maxX, Math.min(maxX, dragStartRef.current.ox + (e.clientX - dragStartRef.current.px)));
    const ny = Math.max(-maxY, Math.min(maxY, dragStartRef.current.oy + (e.clientY - dragStartRef.current.py)));
    cardTargetRef.current = { x: nx, y: ny };
    wakeMotion();
  };

  const onCardPointerUp = () => {
    draggingCardRef.current = false;
    setDraggingCard(false);
    wakeMotion();
  };

  const choosePreset = (p: GlassPreset) => {
    setActivePreset(p);
    applyPreset(p);
  };

  const handleSlider = <K extends keyof typeof settings>(
    key: K,
    val: (typeof settings)[K]
  ) => {
    setActivePreset(null);
    updateSetting(key, val);
  };

  const copyInstallCmd = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setInstallCopied(true);
      setTimeout(() => setInstallCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const copyOpticalConfig = async () => {
    const snippet = `<GlassSettingsProvider
  defaultSettings={{
    refraction: ${Number(settings.refraction.toFixed(2))},
    blur: ${Number(settings.blur.toFixed(1))},
    aberration: ${Number(settings.aberration.toFixed(2))},
    specular: ${Number(settings.specular.toFixed(2))},
    bezelWidth: ${settings.bezelWidth},
    renderMode: '${settings.renderMode === 'auto' ? 'webgl' : settings.renderMode}',
  }}
>
  <GlassStage scene="${scene}"${customBgUrl ? ' backgroundImage="/your-wallpaper.jpg"' : ''} style={{ height: 420 }}>
    <LiquidGlass radius={32} variant="clear">
      {/* Your UI */}
    </LiquidGlass>
  </GlassStage>
</GlassSettingsProvider>`;

    try {
      await navigator.clipboard.writeText(snippet);
      setConfigCopied(true);
      setTimeout(() => setConfigCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const activeTier: GlassRenderMode =
    settings.renderMode === 'auto' ? 'webgl' : settings.renderMode;
  const resolvedTone: 'dark' | 'light' = customBgUrl
    ? customTone
    : scene === 'light'
    ? 'light'
    : 'dark';

  return (
    <section id="optical-lab" className="hero-section">
      <div className="hero-header">
        <div className="hero-version-pill hero-bloom-1">
          <span className="hero-version-dot" />
          <span>GlassKit v2.0 · Publishable React Package &amp; WebGL2 Engine</span>
        </div>

        <h1 className="hero-bloom-1">Liquid Glass</h1>
        <p className="hero-lead hero-bloom-2">
          Physical Snell refraction, chromatic dispersion, and specular depth — calibrated to
          iOS 26 and macOS Tahoe across 10 drop-in React components.
        </p>

        {/* 1-click npm install command bar + Docs CTA */}
        <div className="hero-install-row hero-bloom-2">
          <div className="hero-install-pill">
            <Terminal size={14} className="hero-install-icon" aria-hidden="true" />
            <code>{INSTALL_CMD}</code>
            <button
              type="button"
              className={`hero-install-copy ${installCopied ? 'is-copied' : ''}`}
              onClick={copyInstallCmd}
              aria-label="Copy install command"
            >
              {installCopied ? <Check size={13} /> : <Copy size={13} />}
              <span>{installCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {onOpenDocs && (
            <button type="button" className="hero-docs-cta" onClick={onOpenDocs}>
              <span>Get Started</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Flagship Full-HD Interactive Stage */}
      <div
        className={`hero-studio-frame hero-bloom-3 ${dragOverFile ? 'is-file-dragover' : ''}`}
        ref={heroWrapRef}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            setDragOverFile(true);
          }
        }}
        onDragLeave={() => setDragOverFile(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverFile(false);
          applyCustomImageFile(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            applyCustomImageFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <div className="hero-toolbar">
          <div className="toolbar-cluster">
            <span className="toolbar-icon-label" aria-hidden="true">
              <Palette size={13} />
            </span>
            <div className="toolbar-group" role="group" aria-label="Wallpaper scene">
              {HERO_WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={!customBgUrl && scene === w.id ? 'is-active' : ''}
                  onClick={() => {
                    clearCustomBg();
                    setScene(w.id);
                  }}
                >
                  {w.label}
                </button>
              ))}
              <button
                type="button"
                className={customBgUrl ? 'is-active' : ''}
                onClick={() => fileInputRef.current?.click()}
                title="Upload your own background image or drop it onto the stage"
              >
                <ImagePlus size={12} />
                <span>{customBgUrl ? 'Custom' : 'Upload'}</span>
              </button>
              {customBgUrl && (
                <button
                  type="button"
                  onClick={() => setCustomTone((t) => (t === 'dark' ? 'light' : 'dark'))}
                  title="Switch text contrast for your custom background"
                >
                  {customTone === 'dark' ? 'Light Ink' : 'Dark Ink'}
                </button>
              )}
              {customBgUrl && (
                <button
                  type="button"
                  onClick={clearCustomBg}
                  aria-label="Remove custom background"
                  title="Remove custom image"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="toolbar-right">
            <div className="toolbar-cluster">
              <span className="toolbar-icon-label" aria-hidden="true">
                <Blend size={13} />
              </span>
              <div className="toolbar-group" role="group" aria-label="Material preset">
                {HERO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={activePreset === p.id ? 'is-active' : ''}
                    onClick={() => choosePreset(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-group" role="group" aria-label="Subject">
              <button
                type="button"
                className={heroMode === 'player' ? 'is-active' : ''}
                onClick={() => setHeroMode('player')}
              >
                <Music2 size={12} />
                <span>Player</span>
              </button>
              <button
                type="button"
                className={heroMode === 'lens' ? 'is-active' : ''}
                onClick={() => setHeroMode('lens')}
              >
                <Aperture size={12} />
                <span>Lens</span>
              </button>
            </div>
          </div>
        </div>

        <GlassStage
          ref={stageHandleRef}
          scene={scene}
          backgroundImage={customBgUrl ?? undefined}
          tone={resolvedTone}
          className="hero-stage-viewport"
          onStagePointerMove={handleStagePointerMove}
          onStagePointerLeave={handleStagePointerLeave}
        >
          <div
            ref={dragElRef}
            className={`hero-draggable-wrap ${draggingCard ? 'is-dragging' : ''}`}
            onPointerDown={onCardPointerDown}
            onPointerMove={onCardPointerMove}
            onPointerUp={onCardPointerUp}
            onPointerCancel={onCardPointerUp}
          >
            <div key={heroMode} className="blur-morph-in">
              {heroMode === 'player' ? (
                <MediaPlayerDemo />
              ) : (
                <LiquidGlass radius={44} bezelWidth={settings.bezelWidth} className="hero-pure-lens">
                  <div className="hero-pure-lens-inner">
                    <span className="hero-lens-label">
                      <Move size={15} />
                      <span>Drag lens to refract</span>
                    </span>
                  </div>
                </LiquidGlass>
              )}
            </div>
          </div>

          <div className="hero-stage-hint" aria-hidden="true">
            <Move size={13} />
            <span>
              {dragOverFile
                ? 'Drop image to test Liquid Glass on your photo'
                : 'Drag card to refract'}
              {!dragOverFile && (
                <span className="hero-hint-desktop">
                  {' '}
                  · Hover to fuse droplet · Drop any image
                </span>
              )}
            </span>
          </div>
        </GlassStage>

        {/* Precision Optical Inspector + Render Tier Switcher + Export Config */}
        <div className="optical-inspector">
          <div className="inspector-sliders">
            <label className="inspector-control">
              <span>
                <em className="inspector-label">
                  <Aperture size={12} /> Refraction
                </em>
                <strong>{settings.refraction.toFixed(2)}</strong>
              </span>
              <input
                type="range"
                min={0}
                max={1.8}
                step={0.04}
                value={settings.refraction}
                onChange={(e) => handleSlider('refraction', parseFloat(e.target.value))}
              />
            </label>

            <label className="inspector-control">
              <span>
                <em className="inspector-label">
                  <Droplets size={12} /> Frost
                </em>
                <strong>{settings.blur.toFixed(1)}</strong>
              </span>
              <input
                type="range"
                min={0}
                max={6}
                step={0.2}
                value={settings.blur}
                onChange={(e) => handleSlider('blur', parseFloat(e.target.value))}
              />
            </label>

            <label className="inspector-control">
              <span>
                <em className="inspector-label">
                  <Contrast size={12} /> Dispersion
                </em>
                <strong>{Math.round(settings.aberration * 100)}%</strong>
              </span>
              <input
                type="range"
                min={0}
                max={0.45}
                step={0.01}
                value={settings.aberration}
                onChange={(e) => handleSlider('aberration', parseFloat(e.target.value))}
              />
            </label>

            <label className="inspector-control">
              <span>
                <em className="inspector-label">
                  <Sun size={12} /> Specular
                </em>
                <strong>{Math.round(settings.specular * 100)}%</strong>
              </span>
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.05}
                value={settings.specular}
                onChange={(e) => handleSlider('specular', parseFloat(e.target.value))}
              />
            </label>

            <label className="inspector-control">
              <span>
                <em className="inspector-label">
                  <SlidersHorizontal size={12} /> Bezel
                </em>
                <strong>{settings.bezelWidth}px</strong>
              </span>
              <input
                type="range"
                min={12}
                max={42}
                step={1}
                value={settings.bezelWidth}
                onChange={(e) => handleSlider('bezelWidth', parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div className="inspector-actions-row">
            <div className="inspector-tier-wrap">
              <span className="inspector-tier-label">
                <Cpu size={12} /> Engine
              </span>
              <div className="toolbar-group" role="group" aria-label="Optical rendering engine tier">
                {RENDER_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    className={activeTier === tier.id ? 'is-active' : ''}
                    onClick={() => updateSetting('renderMode', tier.id)}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="inspector-btn-group">
              <button
                type="button"
                className={`inspector-reset inspector-export-btn ${configCopied ? 'is-copied' : ''}`}
                onClick={copyOpticalConfig}
                title="Copy current optical settings as React JSX"
              >
                {configCopied ? <Check size={13} /> : <Copy size={13} />}
                <span>{configCopied ? 'Copied Config' : 'Copy Config'}</span>
              </button>

              <button
                type="button"
                className="inspector-reset"
                onClick={() => {
                  setActivePreset('clear');
                  cardTargetRef.current = { x: 0, y: 0 };
                  wakeMotion();
                  resetSettings();
                }}
                title="Reset to iOS 26 defaults"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiet Architecture Strip */}
      <div className="hero-pillars hero-bloom-4">
        <div className="pillar-item">
          <Aperture size={15} />
          <span>32-bit Snell meniscus &amp; RGB dispersion</span>
        </div>
        <div className="pillar-item">
          <Droplets size={15} />
          <span>Shared WebGL2 optical pipeline · 0% idle GPU</span>
        </div>
        <div className="pillar-item">
          <Layers size={15} />
          <span>10 installable React &amp; CSS Liquid Glass components</span>
        </div>
      </div>
    </section>
  );
};

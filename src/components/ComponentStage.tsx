import React, { useState } from 'react';
import { Code2, Eye, Copy, Check } from 'lucide-react';
import { BackdropTheme } from '../context/GlassSettingsContext';
import { WallpaperScene } from '../lib/webglGlassRenderer';
import { GlassStage } from './GlassStage';
import { CodeBlock } from './CodeBlock';

interface ComponentStageProps {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultBackdrop?: BackdropTheme;
  htmlCss: string;
  react: string;
  children: React.ReactNode;
}

const BACKDROPS: { id: BackdropTheme; label: string; swatch: string }[] = [
  { id: 'alpine', label: 'Tahoe', swatch: 'linear-gradient(135deg, #4f8de8, #1242c4, #061c6e)' },
  { id: 'sunset', label: 'Sunset', swatch: 'linear-gradient(135deg, #f59e0b, #e11d48, #4c1d95)' },
  { id: 'dark', label: 'Midnight', swatch: 'linear-gradient(135deg, #38bdf8, #1e1b4b, #050710)' },
  { id: 'light', label: 'Studio', swatch: 'linear-gradient(135deg, #ffffff, #bfdbfe, #60a5fa)' },
];

function mapBackdropToScene(theme: BackdropTheme): WallpaperScene {
  return theme === 'alpine' ? 'tahoe' : theme;
}

const ComponentStageInner: React.FC<ComponentStageProps> = ({
  id,
  name,
  category,
  description,
  defaultBackdrop = 'alpine',
  htmlCss,
  react,
  children,
}) => {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [codeTabIdx, setCodeTabIdx] = useState(0); // 0 = React / TSX, 1 = HTML + CSS
  const [backdrop, setBackdrop] = useState<BackdropTheme>(defaultBackdrop);
  const [quickCopied, setQuickCopied] = useState(false);

  const copyingReact = codeTabIdx === 0;

  const quickCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyingReact ? react : htmlCss);
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const isLightBackdrop = backdrop === 'light';

  return (
    <article id={id} className="stage-card">
      <div key={view} className="stage-body blur-morph-in">
        {view === 'preview' ? (
          <GlassStage
            scene={mapBackdropToScene(backdrop)}
            tone={isLightBackdrop ? 'light' : 'dark'}
            className="stage-viewport"
          >
            <div className="stage-foreground">{children}</div>
          </GlassStage>
        ) : (
          <CodeBlock
            htmlCss={htmlCss}
            react={react}
            title={name}
            activeTabIndex={codeTabIdx}
            onTabChange={(idx) => setCodeTabIdx(idx)}
          />
        )}
      </div>

      <div className="stage-footer">
        <div className="stage-title-group">
          <div className="stage-title-row">
            <h3>{name}</h3>
            <span className="stage-category-tag">{category}</span>
          </div>
          <p className="stage-description">{description}</p>
        </div>

        <div className="stage-controls">
          {view === 'preview' && (
            <div className="backdrop-picker" role="group" aria-label="Stage wallpaper">
              {BACKDROPS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  title={`${b.label} wallpaper`}
                  aria-label={`${b.label} wallpaper`}
                  aria-pressed={backdrop === b.id}
                  className={`backdrop-dot ${backdrop === b.id ? 'is-active' : ''}`}
                  onClick={() => setBackdrop(b.id)}
                >
                  <span style={{ background: b.swatch }} />
                </button>
              ))}
            </div>
          )}

          <div className="view-toggle" role="tablist" aria-label={`${name} view mode`}>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'preview'}
              className={view === 'preview' ? 'is-active' : ''}
              onClick={() => setView('preview')}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'code'}
              className={view === 'code' ? 'is-active' : ''}
              onClick={() => setView('code')}
            >
              <Code2 size={13} />
              <span>Code</span>
            </button>
          </div>

          <button
            type="button"
            className={`quick-copy-pill ${quickCopied ? 'is-copied' : ''}`}
            onClick={quickCopy}
            title={copyingReact ? 'Copy React / TSX snippet' : 'Copy HTML + CSS snippet'}
          >
            {quickCopied ? <Check size={13} /> : <Copy size={13} />}
            <span>{quickCopied ? 'Copied' : copyingReact ? 'Copy TSX' : 'Copy CSS'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export const ComponentStage = React.memo(ComponentStageInner);

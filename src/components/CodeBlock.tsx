import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CodeTab {
  label: string;
  code: string;
}

interface CodeBlockProps {
  htmlCss?: string;
  react?: string;
  tabs?: CodeTab[];
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  htmlCss = '',
  react = '',
  tabs,
  title,
}) => {
  const resolvedTabs: CodeTab[] = tabs ?? [
    { label: 'HTML + CSS', code: htmlCss },
    { label: 'React / TSX', code: react },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeCode = resolvedTabs[activeIdx]?.code ?? '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = activeCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <div
          className="code-tabs"
          role="tablist"
          aria-label={title ? `${title} code format` : 'Code format'}
        >
          {resolvedTabs.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={activeIdx === idx}
              className={activeIdx === idx ? 'is-active' : ''}
              onClick={() => setActiveIdx(idx)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`code-copy-btn ${copied ? 'is-copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <pre className="code-pre">
        <code>{activeCode}</code>
      </pre>
    </div>
  );
};

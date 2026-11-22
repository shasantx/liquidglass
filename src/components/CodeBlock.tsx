import React, { useMemo, useState } from 'react';
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
  activeTabIndex?: number;
  onTabChange?: (index: number, label: string) => void;
}

const TOKEN_REGEX =
  /(\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|<\/?[A-Za-z][A-Za-z0-9.-]*|\b(?:import|export|from|const|let|var|return|function|default|type|interface|extends|if|else|for|new|true|false|null|undefined|async|await|uniform|in|out|void|float|vec2|vec3|vec4|int|sampler2D|precision|highp|npm|install|npx|git|cd)\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|ms|s|deg)?\b)/g;

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'const',
  'let',
  'var',
  'return',
  'function',
  'default',
  'type',
  'interface',
  'extends',
  'if',
  'else',
  'for',
  'new',
  'true',
  'false',
  'null',
  'undefined',
  'async',
  'await',
  'uniform',
  'in',
  'out',
  'void',
  'float',
  'vec2',
  'vec3',
  'vec4',
  'int',
  'sampler2D',
  'precision',
  'highp',
  'npm',
  'install',
  'npx',
  'git',
  'cd',
]);

function highlightCode(source: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(source)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(source.slice(lastIndex, match.index));
    }

    const token = match[0];
    let cls = '';
    if (
      token.startsWith('/*') ||
      token.startsWith('//') ||
      token.startsWith('<!--') ||
      (token.startsWith('#') && !/^#[0-9a-fA-F]{3,8}\b/.test(token))
    ) {
      cls = 'tok-comment';
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
      cls = 'tok-string';
    } else if (token.startsWith('<')) {
      cls = 'tok-tag';
    } else if (KEYWORDS.has(token)) {
      cls = 'tok-keyword';
    } else if (/^\d/.test(token)) {
      cls = 'tok-number';
    }

    if (cls) {
      nodes.push(
        <span key={key++} className={cls}>
          {token}
        </span>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < source.length) {
    nodes.push(source.slice(lastIndex));
  }
  return nodes;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  htmlCss = '',
  react = '',
  tabs,
  title,
  activeTabIndex,
  onTabChange,
}) => {
  const resolvedTabs: CodeTab[] = tabs ?? [
    { label: 'React / TSX', code: react },
    { label: 'HTML + CSS', code: htmlCss },
  ];

  const [uncontrolledIdx, setUncontrolledIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeIdx = activeTabIndex !== undefined ? activeTabIndex : uncontrolledIdx;
  const safeIdx = Math.max(0, Math.min(resolvedTabs.length - 1, activeIdx));
  const activeCode = resolvedTabs[safeIdx]?.code ?? '';

  const highlighted = useMemo(() => highlightCode(activeCode), [activeCode]);

  const selectTab = (idx: number) => {
    if (activeTabIndex === undefined) setUncontrolledIdx(idx);
    onTabChange?.(idx, resolvedTabs[idx]?.label ?? '');
  };

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
              aria-selected={safeIdx === idx}
              className={safeIdx === idx ? 'is-active' : ''}
              onClick={() => selectTab(idx)}
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
        <code>{highlighted}</code>
      </pre>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Copy,
  Share,
  Edit3,
  FolderInput,
  Star,
  Trash2,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';

export const ContextMenuDemo: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const runAction = (name: string) => {
    setLastAction(name);
    setTimeout(() => setLastAction(null), 1800);
  };

  return (
    <div className="ctx-demo-wrap">
      <div className="ctx-trigger-row">
        <LiquidGlass radius={999} bezelWidth={16} className="ios-glass-btn-wrap">
          <button
            type="button"
            className="ios-glass-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <MoreHorizontal size={18} />
            <span>{open ? 'Hide Menu' : 'Open Context Menu'}</span>
          </button>
        </LiquidGlass>

        {lastAction && (
          <span className="ctx-feedback-pill">
            <Check size={13} /> {lastAction}
          </span>
        )}
      </div>

      <div className={`ctx-popover-slot ${open ? 'is-open' : ''}`}>
        <LiquidGlass radius={24} bezelWidth={22} className="ctx-menu-card">
          {/* Quick action bar */}
          <div className="ctx-quick-row">
            <button type="button" onClick={() => runAction('Copied')}>
              <Copy size={16} />
              <span>Copy</span>
            </button>
            <button type="button" onClick={() => runAction('Shared')}>
              <Share size={16} />
              <span>Share</span>
            </button>
            <button type="button" onClick={() => runAction('Starred')}>
              <Star size={16} />
              <span>Star</span>
            </button>
          </div>

          <div className="ios-hairline" />

          {/* Standard menu rows */}
          <div className="ctx-list" role="menu">
            <button
              type="button"
              role="menuitem"
              className="ctx-item"
              onClick={() => runAction('Renamed item')}
            >
              <span className="ctx-item-left">
                <Edit3 size={15} />
                <span>Rename</span>
              </span>
              <kbd>⌘R</kbd>
            </button>

            <button
              type="button"
              role="menuitem"
              className="ctx-item"
              onClick={() => runAction('Moved to folder')}
            >
              <span className="ctx-item-left">
                <FolderInput size={15} />
                <span>Move to Folder</span>
              </span>
              <kbd>⇧⌘M</kbd>
            </button>

            <div className="ios-hairline" />

            <button
              type="button"
              role="menuitem"
              className="ctx-item is-destructive"
              onClick={() => runAction('Moved to Trash')}
            >
              <span className="ctx-item-left">
                <Trash2 size={15} />
                <span>Delete</span>
              </span>
              <kbd>⌫</kbd>
            </button>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
};

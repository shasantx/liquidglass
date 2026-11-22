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
import { GlassContextMenu } from '../glasskit';

export const ContextMenuDemo: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const runAction = (name: string) => {
    setLastAction(name);
    window.setTimeout(() => setLastAction(null), 1800);
  };

  return (
    <GlassContextMenu
      open={open}
      onOpenChange={setOpen}
      triggerIcon={<MoreHorizontal size={18} />}
      feedback={
        lastAction ? (
          <>
            <Check size={13} /> {lastAction}
          </>
        ) : undefined
      }
      quickActions={[
        { id: 'copy', label: 'Copy', icon: <Copy size={16} />, onSelect: () => runAction('Copied') },
        { id: 'share', label: 'Share', icon: <Share size={16} />, onSelect: () => runAction('Shared') },
        { id: 'star', label: 'Star', icon: <Star size={16} />, onSelect: () => runAction('Starred') },
      ]}
      items={[
        {
          id: 'rename',
          label: 'Rename',
          icon: <Edit3 size={15} />,
          shortcut: '⌘R',
          onSelect: () => runAction('Renamed item'),
        },
        {
          id: 'move',
          label: 'Move to Folder',
          icon: <FolderInput size={15} />,
          shortcut: '⇧⌘M',
          onSelect: () => runAction('Moved to folder'),
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 size={15} />,
          shortcut: '⌫',
          destructive: true,
          dividerBefore: true,
          onSelect: () => runAction('Moved to Trash'),
        },
      ]}
    />
  );
};

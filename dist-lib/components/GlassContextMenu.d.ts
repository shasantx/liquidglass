import React from 'react';
import { GlassVariantId } from '../core/webglGlassRenderer';
export interface GlassContextQuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    onSelect?: () => void;
}
export interface GlassContextMenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    destructive?: boolean;
    dividerBefore?: boolean;
    onSelect?: () => void;
}
export interface GlassContextMenuProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerLabel?: string;
    closeLabel?: string;
    triggerIcon?: React.ReactNode;
    quickActions?: GlassContextQuickAction[];
    items: GlassContextMenuItem[];
    feedback?: React.ReactNode;
    variant?: GlassVariantId;
    className?: string;
}
export declare const GlassContextMenu: React.FC<GlassContextMenuProps>;

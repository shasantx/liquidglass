import React from 'react';
import { GlassVariantId } from '../core/webglGlassRenderer';
export interface GlassDockItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    running?: boolean;
    hideOnCompact?: boolean;
    hideOnMobile?: boolean;
    onClick?: () => void;
}
export interface GlassDockProps {
    items: GlassDockItem[];
    utilityItems?: GlassDockItem[];
    activeId?: string;
    defaultActiveId?: string;
    onSelect?: (id: string, item: GlassDockItem) => void;
    magnification?: number;
    variant?: GlassVariantId;
    className?: string;
}
export declare const GlassDock: React.FC<GlassDockProps>;

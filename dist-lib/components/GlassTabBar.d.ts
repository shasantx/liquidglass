import React from 'react';
import { GlassVariantId } from '../core/webglGlassRenderer';
export interface GlassTabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}
export interface GlassTabBarProps {
    items: GlassTabItem[];
    /** Controlled active tab index */
    activeIndex?: number;
    /** Initial active tab index when uncontrolled */
    defaultActiveIndex?: number;
    onChange?: (index: number, item: GlassTabItem) => void;
    /** Show detached liquid search orb that expands into an inline glass input */
    searchable?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (query: string) => void;
    searchIcon?: React.ReactNode;
    closeIcon?: React.ReactNode;
    variant?: GlassVariantId;
    ariaLabel?: string;
    className?: string;
}
export declare const GlassTabBar: React.FC<GlassTabBarProps>;

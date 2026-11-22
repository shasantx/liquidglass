import React from 'react';
import { GlassVariantId } from '../core/webglGlassRenderer';
export interface GlassNotificationItem {
    id: string;
    title: string;
    body: string;
    time: string;
    icon?: React.ReactNode;
}
export interface GlassNotificationStackProps {
    items: GlassNotificationItem[];
    onDismiss?: (id: string) => void;
    onRestore?: () => void;
    canRestore?: boolean;
    defaultExpanded?: boolean;
    emptyLabel?: string;
    variant?: GlassVariantId;
    className?: string;
}
export declare const GlassNotificationStack: React.FC<GlassNotificationStackProps>;

import React from 'react';
import { GlassVariantId } from '../core/webglGlassRenderer';
export interface GlassAlertSheetProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    primaryLabel: string;
    onPrimary?: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
    variant?: GlassVariantId;
    className?: string;
}
export declare const GlassAlertSheet: React.FC<GlassAlertSheetProps>;

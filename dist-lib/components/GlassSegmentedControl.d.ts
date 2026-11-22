import React from 'react';
import { GlassVariantId } from '../core/webglGlassRenderer';
export interface GlassSegmentOption {
    id: string;
    label: string;
    icon?: React.ReactNode;
}
export interface GlassSegmentedControlProps {
    options: GlassSegmentOption[];
    value?: number;
    defaultValue?: number;
    onChange?: (index: number, option: GlassSegmentOption) => void;
    compact?: boolean;
    iconOnly?: boolean;
    variant?: GlassVariantId;
    ariaLabel?: string;
    className?: string;
}
export declare const GlassSegmentedControl: React.FC<GlassSegmentedControlProps>;

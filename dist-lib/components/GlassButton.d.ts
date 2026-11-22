import React from 'react';
import { GlassVariantId } from '../core/webglGlassRenderer';
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: GlassVariantId;
    bezelWidth?: number;
    radius?: number;
    icon?: React.ReactNode;
}
export declare const GlassButton: React.FC<GlassButtonProps>;
export interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: GlassVariantId;
    bezelWidth?: number;
}
export declare const GlassIconButton: React.FC<GlassIconButtonProps>;
export interface GlassButtonGroupAction {
    id: string;
    icon: React.ReactNode;
    ariaLabel: string;
    active?: boolean;
    activeTone?: 'rose' | 'amber' | 'default';
    onClick?: () => void;
}
export interface GlassButtonGroupProps {
    actions: GlassButtonGroupAction[];
    variant?: GlassVariantId;
    bezelWidth?: number;
    className?: string;
}
export declare const GlassButtonGroup: React.FC<GlassButtonGroupProps>;

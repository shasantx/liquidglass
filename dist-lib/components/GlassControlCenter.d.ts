import React from 'react';
export interface GlassConnectivityOrb {
    id: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    tone?: 'blue' | 'green' | 'orange';
    onToggle: () => void;
}
export interface GlassVerticalSliderProps {
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
    icon?: React.ReactNode;
    ariaLabel: string;
    min?: number;
    max?: number;
}
export declare const GlassVerticalSlider: React.FC<GlassVerticalSliderProps>;
export interface GlassControlCenterProps {
    orbs: GlassConnectivityOrb[];
    sliders: GlassVerticalSliderProps[];
    focus?: {
        title: string;
        subtitle: string;
        icon: React.ReactNode;
        active: boolean;
        onToggle: () => void;
    };
    className?: string;
}
export declare const GlassControlCenter: React.FC<GlassControlCenterProps>;

import React from 'react';
export interface GlassSliderProps {
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: number) => void;
    label?: React.ReactNode;
    showValue?: boolean;
    formatValue?: (value: number) => string;
    accent?: 'blue' | 'amber';
    ariaLabel?: string;
    className?: string;
}
export declare const GlassSlider: React.FC<GlassSliderProps>;

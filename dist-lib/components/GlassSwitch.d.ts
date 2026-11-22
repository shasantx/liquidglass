import React from 'react';
export interface GlassSwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
    ariaLabel?: string;
    className?: string;
}
export declare const GlassSwitch: React.FC<GlassSwitchProps>;

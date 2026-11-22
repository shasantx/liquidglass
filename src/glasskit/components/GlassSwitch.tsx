import React, { useState } from 'react';

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

export const GlassSwitch: React.FC<GlassSwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  description,
  ariaLabel,
  className = '',
}) => {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const [pressed, setPressed] = useState(false);

  const isOn = controlledChecked !== undefined ? controlledChecked : uncontrolled;

  const toggle = () => {
    if (disabled) return;
    const next = !isOn;
    if (controlledChecked === undefined) setUncontrolled(next);
    onChange?.(next);
  };

  const switchEl = (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel ?? label ?? 'Toggle'}
      disabled={disabled}
      className={`ios-liquid-switch ${isOn ? 'is-on' : ''} ${pressed ? 'is-pressed' : ''} ${
        label ? '' : className
      }`.trim()}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onClick={toggle}
    >
      <span className="ios-liquid-thumb" />
    </button>
  );

  if (!label && !description) return switchEl;

  return (
    <div className={`ios-toggle-row ${className}`.trim()}>
      <div className="ios-toggle-meta">
        {label && <span className="ios-toggle-title">{label}</span>}
        {description && <span className="ios-toggle-sub">{description}</span>}
      </div>
      {switchEl}
    </div>
  );
};

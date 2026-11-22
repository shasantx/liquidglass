import React, { useState } from 'react';
import { Wifi, Bluetooth, Radio, Plane, Sun, Volume2, Moon } from 'lucide-react';
import { GlassControlCenter } from '../glasskit';

export const ControlCenterDemo: React.FC = () => {
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(true);
  const [focusOn, setFocusOn] = useState(false);
  const [brightness, setBrightness] = useState(74);
  const [volume, setVolume] = useState(56);

  return (
    <GlassControlCenter
      orbs={[
        {
          id: 'airplane',
          label: 'Airplane Mode',
          icon: <Plane size={20} />,
          active: airplane,
          tone: 'orange',
          onToggle: () => setAirplane((v) => !v),
        },
        {
          id: 'wifi',
          label: 'Wi-Fi',
          icon: <Wifi size={20} />,
          active: wifi,
          tone: 'blue',
          onToggle: () => setWifi((v) => !v),
        },
        {
          id: 'bluetooth',
          label: 'Bluetooth',
          icon: <Bluetooth size={20} />,
          active: bluetooth,
          tone: 'blue',
          onToggle: () => setBluetooth((v) => !v),
        },
        {
          id: 'airdrop',
          label: 'AirDrop',
          icon: <Radio size={20} />,
          active: airdrop,
          tone: 'green',
          onToggle: () => setAirdrop((v) => !v),
        },
      ]}
      sliders={[
        {
          ariaLabel: 'Screen Brightness',
          value: brightness,
          onChange: setBrightness,
          icon: <Sun size={20} />,
        },
        {
          ariaLabel: 'System Volume',
          value: volume,
          onChange: setVolume,
          icon: <Volume2 size={20} />,
        },
      ]}
      focus={{
        title: 'Do Not Disturb',
        subtitle: focusOn ? 'On until 7:00 PM' : 'Off',
        icon: <Moon size={16} fill={focusOn ? 'currentColor' : 'none'} />,
        active: focusOn,
        onToggle: () => setFocusOn((v) => !v),
      }}
    />
  );
};

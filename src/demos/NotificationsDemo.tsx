import React, { useState } from 'react';
import { GlassNotificationStack, GlassNotificationItem } from '../glasskit';
import {
  MessagesAppIcon,
  CalendarAppIcon,
  MailAppIcon,
} from '../components/AppleAppIcons';

const INITIAL_NOTIFS: GlassNotificationItem[] = [
  {
    id: '1',
    title: 'Maya Lin',
    body: 'The new optical glass prototype feels unreal on the studio display.',
    time: 'now',
    icon: <MessagesAppIcon size={40} />,
  },
  {
    id: '2',
    title: 'Design System Critique',
    body: 'Starting in 10 minutes in Studio B — Motion & Materials',
    time: '4m ago',
    icon: <CalendarAppIcon size={40} />,
  },
  {
    id: '3',
    title: 'TestFlight Build 26.4',
    body: 'Liquid Glass shader pipeline is ready for external review.',
    time: '18m ago',
    icon: <MailAppIcon size={40} />,
  },
];

export const NotificationsDemo: React.FC = () => {
  const [items, setItems] = useState<GlassNotificationItem[]>(INITIAL_NOTIFS);

  return (
    <GlassNotificationStack
      items={items}
      onDismiss={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
      canRestore={items.length < INITIAL_NOTIFS.length}
      onRestore={() => setItems(INITIAL_NOTIFS)}
    />
  );
};

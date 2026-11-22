import React, { useState } from 'react';
import { CloudUpload, CheckCircle2 } from 'lucide-react';
import { GlassAlertSheet } from '../glasskit';

export const AlertSheetDemo: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'synced' | 'cancelled'>('idle');

  return (
    <GlassAlertSheet
      icon={
        status === 'synced' ? (
          <CheckCircle2 size={26} color="#34C759" />
        ) : (
          <CloudUpload size={26} />
        )
      }
      title={status === 'synced' ? 'Published to iCloud' : 'Publish Design Tokens?'}
      description={
        status === 'synced'
          ? 'All 14 Liquid Glass surfaces are synced across your team workspaces.'
          : 'Updates to refraction curves and corner radii will apply immediately across connected apps.'
      }
      secondaryLabel="Not Now"
      onSecondary={() => setStatus('cancelled')}
      primaryLabel={status === 'synced' ? 'Reset Preview' : 'Publish'}
      onPrimary={() => setStatus(status === 'synced' ? 'idle' : 'synced')}
    />
  );
};

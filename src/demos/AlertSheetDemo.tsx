import React, { useState } from 'react';
import { CloudUpload, CheckCircle2 } from 'lucide-react';
import { LiquidGlass } from '../components/LiquidGlass';

export const AlertSheetDemo: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'synced' | 'cancelled'>('idle');

  return (
    <div className="alert-demo-wrap">
      <LiquidGlass radius={32} bezelWidth={24} className="ios-alert-card">
        <div className="ios-alert-body">
          <div className="ios-alert-icon">
            {status === 'synced' ? (
              <CheckCircle2 size={26} color="#34C759" />
            ) : (
              <CloudUpload size={26} />
            )}
          </div>
          <h4>
            {status === 'synced'
              ? 'Published to iCloud'
              : 'Publish Design Tokens?'}
          </h4>
          <p>
            {status === 'synced'
              ? 'All 14 Liquid Glass surfaces are synced across your team workspaces.'
              : 'Updates to refraction curves and corner radii will apply immediately across connected apps.'}
          </p>
        </div>

        <div className="ios-alert-actions">
          <button
            type="button"
            className="ios-alert-btn ios-alert-btn-secondary"
            onClick={() => setStatus('cancelled')}
          >
            Not Now
          </button>
          <button
            type="button"
            className="ios-alert-btn ios-alert-btn-primary"
            onClick={() => setStatus(status === 'synced' ? 'idle' : 'synced')}
          >
            {status === 'synced' ? 'Reset Preview' : 'Publish'}
          </button>
        </div>
      </LiquidGlass>
    </div>
  );
};

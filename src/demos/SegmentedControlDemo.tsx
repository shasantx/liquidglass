import React, { useState } from 'react';
import { Grid, List, Columns, Sparkles } from 'lucide-react';
import { GlassSegmentedControl } from '../glasskit';

const TIME_OPTIONS = [
  { id: 'years', label: 'Years' },
  { id: 'months', label: 'Months' },
  { id: 'days', label: 'Days' },
  { id: 'all', label: 'All Photos' },
];

export const SegmentedControlDemo: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState(1);
  const [selectedLayout, setSelectedLayout] = useState(0);

  return (
    <div className="demo-segmented-stack">
      <GlassSegmentedControl
        value={selectedTime}
        onChange={(idx) => setSelectedTime(idx)}
        ariaLabel="Photo timeline scale (drag or tap)"
        options={TIME_OPTIONS}
      />

      <GlassSegmentedControl
        value={selectedLayout}
        onChange={(idx) => setSelectedLayout(idx)}
        ariaLabel="View layout (drag or tap)"
        compact
        iconOnly
        options={[
          { id: 'grid', label: 'Grid', icon: <Grid size={17} strokeWidth={selectedLayout === 0 ? 2.2 : 1.85} /> },
          { id: 'columns', label: 'Columns', icon: <Columns size={17} strokeWidth={selectedLayout === 1 ? 2.2 : 1.85} /> },
          { id: 'list', label: 'List', icon: <List size={17} strokeWidth={selectedLayout === 2 ? 2.2 : 1.85} /> },
          { id: 'smart', label: 'Curated', icon: <Sparkles size={17} strokeWidth={selectedLayout === 3 ? 2.2 : 1.85} /> },
        ]}
      />
    </div>
  );
};

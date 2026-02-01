import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useEffect } from 'react';
import { TraceListPanel } from './TraceListPanel';
import { TraceDetailsPanel } from './TraceDetailsPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { AnimatedResizableLayout } from '@principal-ade/panels';
import { MockPanelProvider } from '../mocks/panelContext';
import type { TraceInfo } from '../types/otel';
import type { PanelEvent } from '@principal-ade/panel-framework-core';

const meta = {
  title: 'Panels/TraceViewerIntegration',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Integration story showing TraceListPanel and TraceDetailsPanel working together. Click a trace in the list to see its details on the right. Uses prop-controlled pattern for details panel.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Integration wrapper that manages trace selection state
 */
const TraceViewerWrapper: React.FC<{ direction: 'horizontal' | 'vertical' }> = ({ direction }) => {
  const [selectedTrace, setSelectedTrace] = useState<TraceInfo | null>(null);

  return (
    <MockPanelProvider>
      {(props) => {
        // Listen for trace selection events from TraceListPanel
        useEffect(() => {
          if (!props.events) return;

          const unsubscribe = props.events.on('custom', (event: PanelEvent) => {
            const { action, trace } = event.payload;
            if (action === 'selectTrace' && trace) {
              setSelectedTrace(trace);
            }
          });

          return unsubscribe;
        }, [props.events]);

        return (
          <AnimatedResizableLayout
            direction={direction}
            defaultRatio={direction === 'horizontal' ? 0.4 : 0.5}
            minRatio={direction === 'horizontal' ? 0.2 : 0.3}
            maxRatio={direction === 'horizontal' ? 0.8 : 0.7}
          >
            <TraceListPanel {...props} />
            <TraceDetailsPanel {...props} selectedTrace={selectedTrace} />
          </AnimatedResizableLayout>
        );
      }}
    </MockPanelProvider>
  );
};

/**
 * Side-by-side layout showing trace list and trace details
 * Click a trace in the list to see its details
 */
export const SideBySide: Story = {
  render: () => <TraceViewerWrapper direction="horizontal" />,
};

/**
 * Vertical stack layout
 */
export const Stacked: Story = {
  render: () => <TraceViewerWrapper direction="vertical" />,
};

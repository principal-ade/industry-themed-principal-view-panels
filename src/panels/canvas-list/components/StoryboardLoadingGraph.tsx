import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';

interface Node {
  id: string;
  x: number;
  y: number;
  delay: number;
}

interface Edge {
  from: Node;
  to: Node;
  delay: number;
}

export const StoryboardLoadingGraph: React.FC = () => {
  const { theme } = useTheme();

  // Animation timing: each step is 0.5s (0.4s appear + 0.1s gap)
  const stepDuration = 0.5;
  const animationDuration = stepDuration * 12; // 6s to complete
  const pauseDuration = 2; // 2s pause
  const fadeDuration = 0.5; // 0.5s fade
  const totalCycleDuration = animationDuration + pauseDuration + fadeDuration; // 8.5s total

  // Define nodes that appear sequentially, always connected to visible nodes
  const nodes: Node[] = [
    { id: 'workflow-1', x: 20, y: 30, delay: 0 },                      // Step 0: Start
    { id: 'storyboard-1', x: 40, y: 50, delay: stepDuration * 2 },     // Step 2: After edge-0
    { id: 'canvas-1', x: 60, y: 30, delay: stepDuration * 4 },         // Step 4: After edge-1
    { id: 'workflow-2', x: 80, y: 50, delay: stepDuration * 6 },       // Step 6: After edge-2
    { id: 'storyboard-2', x: 60, y: 70, delay: stepDuration * 8 },     // Step 8: After edge-3
    { id: 'workflow-3', x: 40, y: 70, delay: stepDuration * 10 },      // Step 10: After edge-4
  ];

  // Define edges that draw between visible nodes
  const edges: Edge[] = [
    { from: nodes[0], to: nodes[1], delay: stepDuration * 1 },   // Step 1: workflow-1 → storyboard-1
    { from: nodes[1], to: nodes[2], delay: stepDuration * 3 },   // Step 3: storyboard-1 → canvas-1
    { from: nodes[2], to: nodes[3], delay: stepDuration * 5 },   // Step 5: canvas-1 → workflow-2
    { from: nodes[3], to: nodes[4], delay: stepDuration * 7 },   // Step 7: workflow-2 → storyboard-2
    { from: nodes[4], to: nodes[5], delay: stepDuration * 9 },   // Step 9: storyboard-2 → workflow-3
    { from: nodes[5], to: nodes[1], delay: stepDuration * 11 },  // Step 11: workflow-3 → storyboard-1 (completes cycle)
  ];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.textSecondary,
        padding: '32px',
      }}
    >
      <style>
        {`
          ${nodes.map((node, index) => {
            const appearStart = (node.delay / totalCycleDuration) * 100;
            const appearEnd = ((node.delay + 0.4) / totalCycleDuration) * 100;
            const fadeStart = ((animationDuration + pauseDuration) / totalCycleDuration) * 100;

            return `
              @keyframes nodeAppear-${index} {
                0% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.3);
                }
                ${appearStart}% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.3);
                }
                ${appearEnd}% {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
                }
                ${fadeStart}% {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
                }
                100% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.3);
                }
              }
            `;
          }).join('')}

          ${edges.map((edge, index) => {
            const drawStart = (edge.delay / totalCycleDuration) * 100;
            const drawEnd = ((edge.delay + 0.5) / totalCycleDuration) * 100;
            const fadeStart = ((animationDuration + pauseDuration) / totalCycleDuration) * 100;

            return `
              @keyframes edgeDraw-${index} {
                0% {
                  stroke-dashoffset: 200;
                  opacity: 0;
                }
                ${drawStart}% {
                  stroke-dashoffset: 200;
                  opacity: 0;
                }
                ${drawEnd}% {
                  stroke-dashoffset: 0;
                  opacity: 1;
                }
                ${fadeStart}% {
                  stroke-dashoffset: 0;
                  opacity: 1;
                }
                100% {
                  stroke-dashoffset: 200;
                  opacity: 0;
                }
              }
            `;
          }).join('')}
        `}
      </style>

      {/* Graph Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          height: '300px',
          marginBottom: '24px',
        }}
      >
        {/* SVG for edges */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          {edges.map((edge, index) => {
            const x1 = `${edge.from.x}%`;
            const y1 = `${edge.from.y}%`;
            const x2 = `${edge.to.x}%`;
            const y2 = `${edge.to.y}%`;

            return (
              <line
                key={`edge-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={theme.colors.primary}
                strokeWidth="2"
                strokeDasharray="200"
                strokeDashoffset="200"
                opacity="0"
                style={{
                  animation: `edgeDraw-${index} ${totalCycleDuration}s ease-out infinite`,
                }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: theme.colors.backgroundSecondary,
              border: `2px solid ${theme.colors.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              animation: `nodeAppear-${index} ${totalCycleDuration}s ease-out infinite`,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: theme.colors.primary,
              }}
            />
          </div>
        ))}
      </div>

      {/* Loading Text */}
      <div
        style={{
          fontSize: theme.fontSizes[2],
          fontWeight: 500,
          color: theme.colors.text,
          marginBottom: '8px',
        }}
      >
        Loading storyboards...
      </div>

      <div
        style={{
          fontSize: theme.fontSizes[1],
          color: theme.colors.textSecondary,
        }}
      >
        Discovering workflows and canvases
      </div>
    </div>
  );
};

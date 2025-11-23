import React from 'react';
import { FileText, ExternalLink, BookOpen } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';

interface EmptyStateContentProps {
  theme: Theme;
}

/**
 * Empty state component for Visual Validation Graph Panel
 * Displays when no vvf.config.yaml file is found in the project
 */
export const EmptyStateContent: React.FC<EmptyStateContentProps> = ({ theme }) => {

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      overflowY: 'auto',
      padding: theme.space[4],
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      textAlign: 'center',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        paddingTop: theme.space[4],
        paddingBottom: theme.space[4],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <FileText size={48} color={theme.colors.primary} style={{ marginBottom: theme.space[3] }} />

        <h2 style={{
          margin: 0,
          marginBottom: theme.space[3],
          fontSize: theme.fontSizes[4],
          fontWeight: theme.fontWeights.bold,
          color: theme.colors.text
        }}>
          Visual Validation Graph Panel
        </h2>

        <p style={{
          margin: 0,
          marginBottom: theme.space[2],
          fontSize: theme.fontSizes[2],
          color: theme.colors.textSecondary,
          lineHeight: 1.6
        }}>
          This panel visualizes your project's component architecture and validation flows
          using a declarative YAML configuration file.
        </p>

        <div style={{
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radii[2],
          padding: theme.space[3],
          marginTop: theme.space[4],
          marginBottom: theme.space[3],
          width: '100%',
          maxWidth: '600px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{
            margin: 0,
            marginBottom: theme.space[2],
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
            textAlign: 'left'
          }}>
            What you'll see:
          </h3>

          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            textAlign: 'left',
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes[1]
          }}>
            <li style={{ marginBottom: theme.space[1], display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: theme.colors.success, marginRight: theme.space[2], flexShrink: 0 }}>✓</span>
              <span>Interactive graph of your components and their relationships</span>
            </li>
            <li style={{ marginBottom: theme.space[1], display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: theme.colors.success, marginRight: theme.space[2], flexShrink: 0 }}>✓</span>
              <span>Path-based validation rules and dependencies</span>
            </li>
            <li style={{ marginBottom: theme.space[1], display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: theme.colors.success, marginRight: theme.space[2], flexShrink: 0 }}>✓</span>
              <span>Visual feedback on component structure and integration points</span>
            </li>
            <li style={{ marginBottom: theme.space[1], display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: theme.colors.success, marginRight: theme.space[2], flexShrink: 0 }}>✓</span>
              <span>Customizable layouts and themes</span>
            </li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.space[3],
          marginTop: theme.space[4]
        }}>
          <h3 style={{
            margin: 0,
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text
          }}>
            Get Started
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.space[2]
          }}>
            <a
              href="https://github.com/principal-ai/visual-validation-core-library/blob/main/docs/CONFIGURATION_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[2],
                padding: theme.space[3],
                backgroundColor: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[2],
                textDecoration: 'none',
                color: theme.colors.text,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary;
                e.currentTarget.style.backgroundColor = theme.colors.background;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
                e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary;
              }}
            >
              <BookOpen size={20} color={theme.colors.primary} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: theme.fontSizes[2],
                  fontWeight: theme.fontWeights.medium,
                  marginBottom: theme.space[1]
                }}>
                  Configuration Reference
                </div>
                <div style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.textSecondary
                }}>
                  Learn how to create vvf.config.yaml with path-based validation
                </div>
              </div>
              <ExternalLink size={16} color={theme.colors.textMuted} style={{ flexShrink: 0 }} />
            </a>

            <a
              href="https://www.npmjs.com/package/@principal-ai/visual-validation-core"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[2],
                padding: theme.space[3],
                backgroundColor: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[2],
                textDecoration: 'none',
                color: theme.colors.text,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary;
                e.currentTarget.style.backgroundColor = theme.colors.background;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
                e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary;
              }}
            >
              <FileText size={20} color={theme.colors.primary} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: theme.fontSizes[2],
                  fontWeight: theme.fontWeights.medium,
                  marginBottom: theme.space[1]
                }}>
                  NPM Package Documentation
                </div>
                <div style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.textSecondary
                }}>
                  View @principal-ai/visual-validation-core on npm
                </div>
              </div>
              <ExternalLink size={16} color={theme.colors.textMuted} style={{ flexShrink: 0 }} />
            </a>
          </div>

          <p style={{
            margin: 0,
            fontSize: theme.fontSizes[1],
            color: theme.colors.textMuted,
            lineHeight: 1.5,
            textAlign: 'center'
          }}>
            Once you add a <code style={{
              backgroundColor: theme.colors.backgroundSecondary,
              padding: `2px ${theme.space[1]}`,
              borderRadius: theme.radii[0],
              fontFamily: theme.fonts.monospace,
              fontSize: theme.fontSizes[0]
            }}>vvf.config.yaml</code> file to your project root,
            the panel will automatically visualize your configuration.
          </p>
        </div>
      </div>
    </div>
  );
};

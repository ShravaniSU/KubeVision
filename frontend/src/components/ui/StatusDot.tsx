import React from 'react';

interface StatusDotProps {
  status: 'healthy' | 'warning' | 'offline' | 'running' | 'pending' | 'failed' | 'testing';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const statusMap = {
  healthy: { color: '#10b981', label: 'Healthy', pulse: true },
  running: { color: '#10b981', label: 'Running', pulse: true },
  warning: { color: '#f59e0b', label: 'Warning', pulse: false },
  pending: { color: '#f59e0b', label: 'Pending', pulse: false },
  offline: { color: '#ef4444', label: 'Offline', pulse: false },
  failed: { color: '#ef4444', label: 'Failed', pulse: false },
  testing: { color: '#06b6d4', label: 'Testing', pulse: true },
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  showLabel = false,
  size = 'md',
}) => {
  const config = statusMap[status] || { color: '#64748b', label: 'Unknown', pulse: false };
  const dotSize = size === 'sm' ? '8px' : '10px';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: config.color,
          color: config.color,
          display: 'inline-block',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {config.pulse && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              animation: 'pulse-ring 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
            }}
          />
        )}
      </span>
      {showLabel && (
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {config.label}
        </span>
      )}
    </div>
  );
};

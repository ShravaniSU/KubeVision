import React from 'react';
import { motion } from 'framer-motion';

interface MetricBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  height?: number; // px, default 8
  animated?: boolean;
}

export const MetricBar: React.FC<MetricBarProps> = ({
  value,
  label,
  showValue = false,
  height = 8,
  animated = true,
}) => {
  // Cap value between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // Determine color threshold
  let fillColor = '#10b981'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.2)';
  if (normalizedValue >= 60 && normalizedValue <= 80) {
    fillColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.2)';
  } else if (normalizedValue > 80) {
    fillColor = '#ef4444'; // red
    glowColor = 'rgba(239, 68, 68, 0.2)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label && <span>{label}</span>}
          {showValue && <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{Math.round(value)}%</span>}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: '#f1f5f9',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${normalizedValue}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            style={{
              height: '100%',
              backgroundColor: fillColor,
              borderRadius: '9999px',
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        ) : (
          <div
            style={{
              width: `${normalizedValue}%`,
              height: '100%',
              backgroundColor: fillColor,
              borderRadius: '9999px',
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        )}
      </div>
    </div>
  );
};

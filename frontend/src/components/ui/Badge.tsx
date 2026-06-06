import React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'blue' | 'violet';
  children: React.ReactNode;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles = {
  success: {
    color: '#059669',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
  },
  warning: {
    color: '#d97706',
    background: '#fffbeb',
    border: '1px solid #fde68a',
  },
  danger: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
  },
  info: {
    color: '#0284c7',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
  },
  blue: {
    color: '#2563eb',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
  },
  violet: {
    color: '#7c3aed',
    background: '#f5f3ff',
    border: '1px solid #ddd6fe',
  },
  muted: {
    color: '#64748b',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  pulse = false,
  size = 'md',
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        borderRadius: '9999px',
        fontSize: size === 'sm' ? '11px' : '13px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        color: styles.color,
        backgroundColor: styles.background,
        border: styles.border,
        whiteSpace: 'nowrap',
      }}
    >
      {pulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: styles.color,
            animation: 'pulse-ring 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
          }}
        />
      )}
      {children}
    </span>
  );
};

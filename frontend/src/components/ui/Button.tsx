import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}) => {
  const getStyles = () => {
    let baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontWeight: 600,
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all var(--transition-fast)',
      border: 'none',
      outline: 'none',
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
    };

    // Padding/Sizes
    if (size === 'sm') {
      baseStyles.padding = '6px 14px';
      baseStyles.fontSize = '13px';
    } else if (size === 'lg') {
      baseStyles.padding = '12px 24px';
      baseStyles.fontSize = '16px';
    } else {
      baseStyles.padding = '8px 18px';
      baseStyles.fontSize = '14px';
    }

    // Variants
    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: 'var(--gradient-primary)',
          color: 'var(--text-on-accent)',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
        };
      case 'secondary':
        return {
          ...baseStyles,
          background: 'var(--accent-blue-light)',
          color: 'var(--accent-blue)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
        };
      case 'danger':
        return {
          ...baseStyles,
          background: 'var(--gradient-danger)',
          color: 'var(--text-on-accent)',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
        };
      case 'ghost':
        return {
          ...baseStyles,
          background: 'transparent',
          color: 'var(--text-secondary)',
        };
      case 'outline':
        return {
          ...baseStyles,
          background: '#ffffff',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
        };
    }
  };

  return (
    <button
      type={type}
      style={getStyles()}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" color="currentColor" />
      ) : (
        icon && <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
      {children}
    </button>
  );
};

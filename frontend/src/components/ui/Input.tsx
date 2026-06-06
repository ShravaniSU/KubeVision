import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, style, ...rest }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            {label}
          </label>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            style={{
              width: '100%',
              padding: '10px 14px',
              paddingLeft: icon ? '38px' : '14px',
              backgroundColor: '#ffffff',
              border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              ...style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-blue)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-blue-glow)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--accent-red)' : 'var(--border-strong)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            {...rest}
          />
        </div>

        {error && (
          <span style={{ fontSize: '12px', color: 'var(--accent-red)', fontWeight: 500 }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

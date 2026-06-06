import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, children, style, ...rest }, ref) => {

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
          <select
            ref={ref}
            style={{
              width: '100%',
              padding: '10px 14px',
              paddingRight: '36px',
              backgroundColor: '#ffffff',
              border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              appearance: 'none',
              cursor: 'pointer',
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
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Custom Chevron Indicator */}
          <div
            style={{
              position: 'absolute',
              right: '14px',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
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

Select.displayName = 'Select';

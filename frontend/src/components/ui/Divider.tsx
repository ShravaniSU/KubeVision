import React from 'react';

interface DividerProps {
  className?: string;
  margin?: string;
}

export const Divider: React.FC<DividerProps> = ({ className, margin = '16px 0' }) => {
  return (
    <div
      className={className}
      style={{
        height: '1px',
        background: 'linear-gradient(to right, rgba(0,0,0,0.01), var(--border-default), rgba(0,0,0,0.01))',
        margin,
        width: '100%',
      }}
    />
  );
};

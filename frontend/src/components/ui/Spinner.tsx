import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'var(--accent-blue)',
}) => {
  const pixelSize = size === 'sm' ? 16 : size === 'lg' ? 36 : 24;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          animation: 'spin-anim 0.8s linear infinite',
        }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(0, 0, 0, 0.06)"
          strokeWidth="3"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4522"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <style>{`
        @keyframes spin-anim {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
};

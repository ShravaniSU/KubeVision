import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  label?: string;
  showValue?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  label,
  showValue = true,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
          {showValue && (
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--accent-blue)',
                backgroundColor: 'var(--accent-blue-light)',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              {value}
            </span>
          )}
        </div>
      )}

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '9999px',
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
          background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${percentage}%, #cbd5e1 ${percentage}%, #cbd5e1 100%)`,
        }}
        className="custom-range-slider"
      />

      <style>{`
        .custom-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid var(--accent-blue);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .custom-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
        .custom-range-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid var(--accent-blue);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
          transition: transform 0.1s ease;
        }
        .custom-range-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
};

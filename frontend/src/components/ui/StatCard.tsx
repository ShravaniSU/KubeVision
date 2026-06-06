import React, { useEffect, useState } from 'react';
import { Card } from './Card';

interface StatCardProps {
  label?: string;
  title?: string;
  value: number | string;
  icon: any; // Accept component or ReactNode
  iconGradient?: string;
  gradient?: string;
  iconGlow?: string;
  glow?: string;
  trend?: { value: number | string; label?: string; isPositive?: boolean };
  trendUp?: boolean;
  subtitle?: string;
  accentColor?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  title,
  value,
  icon,
  iconGradient,
  gradient,
  iconGlow,
  glow,
  trend,
  trendUp,
  subtitle,
  accentColor,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === 'number' ? 0 : value
  );

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 800; // ms
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.round(easeProgress * value);

      if (frame >= totalFrames) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(currentVal);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [value]);

  const displayLabel = title || label || '';
  const finalGradient = gradient || iconGradient || 'var(--icon-bg-blue)';
  const finalGlow = glow || iconGlow || 'var(--accent-blue-glow)';
  const isTrendPositive = trendUp ?? trend?.isPositive ?? true;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const Icon = icon as any;
    return <Icon size={20} />;
  };

  return (
    <Card accentColor={accentColor} hover>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div
          className="icon-circle"
          style={{
            background: finalGradient,
            boxShadow: `0 0 16px ${finalGlow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            color: '#ffffff',
          }}
        >
          {renderIcon()}
        </div>
        <div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {displayLabel}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          {displayValue}
        </span>

        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '4px' }}>
            <span
              style={{
                fontWeight: 600,
                color: isTrendPositive ? 'var(--accent-green)' : 'var(--accent-red)',
              }}
            >
              {isTrendPositive ? '↑' : '↓'} {typeof trend.value === 'number' ? `${trend.value}%` : trend.value}
            </span>
            {trend.label && <span style={{ color: 'var(--text-muted)' }}>{trend.label}</span>}
          </div>
        )}

        {subtitle && !trend && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</span>
        )}
      </div>
    </Card>
  );
};

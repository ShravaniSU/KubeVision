import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accentColor?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  accentColor,
  onClick,
  padding = 'md',
  style,
  onMouseEnter,
  onMouseLeave,
}) => {
  const paddingClasses = {
    sm: 'p-3', // 12px
    md: 'p-5', // 20px
    lg: 'p-7', // 28px
  };

  const accentStyle: React.CSSProperties = accentColor
    ? { borderLeft: `3px solid ${accentColor}` }
    : {};

  const baseClassName = clsx(
    'card',
    paddingClasses[padding === 'none' ? 'sm' : padding],
    {
      'card-hover cursor-pointer': hover || !!onClick,
    },
    className
  );

  // We map tailwind-like padding classes to basic style rules just in case utility classes are purely CSS based,
  // but we can also use styled styles for strict correctness in vanilla CSS.
  // Let's implement them directly as styles/variables if needed, or rely on normal inline styling to be extremely safe:
  const paddingValue = padding === 'none' ? '0px' : padding === 'sm' ? '12px' : padding === 'md' ? '20px' : '28px';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2 } : undefined}
      style={{
        padding: paddingValue,
        ...accentStyle,
        ...style,
      }}
      className={baseClassName}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
};

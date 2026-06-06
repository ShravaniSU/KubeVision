import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 4, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 4, x: '-50%', scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              marginBottom: '6px',
              padding: '6px 10px',
              backgroundColor: 'var(--text-primary)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
              zIndex: 50,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              pointerEvents: 'none',
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeWidths = {
    sm: '400px',
    md: '600px',
    lg: '800px',
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', duration: 0.3 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: sizeWidths[size],
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--card-shadow-hover)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '4px', minWidth: 'auto' }}>
              <X size={18} />
            </Button>
          </div>

          {/* Content */}
          <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(80vh - 120px)' }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              style={{
                padding: '12px 20px',
                backgroundColor: 'var(--bg-elevated)',
                borderTop: '1px solid var(--border-default)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    modalRoot
  );
};

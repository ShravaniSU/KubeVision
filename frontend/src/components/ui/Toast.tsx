import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, ToastMessage } from '../../store/toastStore';

const toastConfig = {
  success: {
    icon: <CheckCircle2 size={18} color="#059669" />,
    backgroundColor: '#ecfdf5',
    borderLeftColor: '#10b981',
  },
  error: {
    icon: <AlertCircle size={18} color="#dc2626" />,
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  warning: {
    icon: <AlertTriangle size={18} color="#d97706" />,
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
  },
  info: {
    icon: <Info size={18} color="#0284c7" />,
    backgroundColor: '#eff6ff',
    borderLeftColor: '#3b82f6',
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '320px',
        maxWidth: 'calc(100vw - 48px)',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--card-shadow-hover)',
                border: '1px solid var(--border-default)',
                borderLeft: `4px solid ${config.borderLeftColor}`,
              }}
            >
              <div style={{ marginTop: '2px', display: 'flex', flexShrink: 0 }}>
                {config.icon}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {toast.title && (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {toast.title}
                  </span>
                )}
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 0,
                  marginTop: '2px',
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
export default PageTransition;

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

/**
 * PageTransition — wraps every route with a custom entrance animation.
 * Each "app" (route) has its own identity animation so it feels like a
 * native app opening rather than a plain page swap.
 */
export default function PageTransition({ children }: Props) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{
          opacity: 0,
          y: 24,
          scale: 0.98,
          filter: 'blur(12px)',
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
        }}
        exit={{
          opacity: 0,
          y: -16,
          scale: 0.98,
          filter: 'blur(8px)',
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ height: '100%', width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

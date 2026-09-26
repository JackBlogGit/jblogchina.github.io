import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * AnimateIn — reusable entrance animator.
 * Plays when element scrolls into view.
 */
export default function AnimateIn({
  children,
  delay = 0,
  y = 30,
  x = 0,
  scale = 1,
  duration = 0.6,
  once = true,
  className,
  style,
}: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-60px' });

  const variants: Variants = {
    hidden: { opacity: 0, y, x, scale },
    visible: { opacity: 1, y: 0, x: 0, scale: 1 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

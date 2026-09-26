import { motion } from 'framer-motion';
import { Hand } from 'lucide-react';
import { useHiEffect } from '../hooks/useHiEffect';
import { useApp } from '../context/AppContext';

export default function HiButton() {
  const { t } = useApp();
  const { active, trigger, stop } = useHiEffect();

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      onClick={active ? stop : trigger}
      className="glass"
      style={{
        width: '100%',
        padding: '12px 18px',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 14,
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <motion.span
        animate={active ? { rotate: [0, 20, -20, 0] } : { rotate: 0 }}
        transition={{ duration: 0.4, repeat: active ? Infinity : 0 }}
      >
        <Hand size={16} />
      </motion.span>
      {active ? t('停止嗨~', 'Stop Hi~') : t('嗨一下~', 'Say Hi~')}
    </motion.button>
  );
}

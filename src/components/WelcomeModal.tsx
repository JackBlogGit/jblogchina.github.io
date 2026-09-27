import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDevice } from '../hooks/useDevice';

const SEEN_KEY = 'welcome-modal-seen';

export default function WelcomeModal() {
  const { t } = useApp();
  const { isMobile } = useDevice();
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(SEEN_KEY) == null;
    } catch {
      return true;
    }
  });

  const close = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? 16 : 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="glass glass-strong"
            style={{
              width: 'min(420px, 100%)',
              borderRadius: 24,
              padding: isMobile ? '34px 20px 26px' : '36px 32px 30px',
              textAlign: 'center',
              pointerEvents: 'auto',
              /* 横屏手机上弹窗必须能自己滚，否则按钮被裁掉 */
              maxHeight: isMobile ? 'calc(100% - 8px)' : undefined,
              overflowY: isMobile ? 'auto' : undefined,
              overflowX: isMobile ? 'hidden' : undefined,
            }}
          >
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={close}
              aria-label={t('关闭', 'Close')}
              style={{
                position: 'absolute',
                top: isMobile ? 8 : 14,
                right: isMobile ? 8 : 14,
                width: isMobile ? 44 : 32,
                height: isMobile ? 44 : 32,
                borderRadius: '50%',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <X size={isMobile ? 18 : 16} />
            </motion.button>

            <motion.div
              animate={{ rotate: [0, 14, -10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle at 30% 30%, var(--accent-soft), transparent 70%), var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--accent)',
              }}
            >
              <Sparkles size={28} />
            </motion.div>

            <h2
              style={{
                fontSize: isMobile ? 21 : 24,
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 10,
              }}
            >
              {t('欢迎访问 Jblog', 'Welcome to Jblog')}
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: 'var(--text-secondary)',
                marginBottom: isMobile ? 22 : 26,
              }}
            >
              {t(
                '很高兴在这里见到你。愿这里的文字与代码，能带给你一点启发与好心情。',
                'Glad to see you here. May the words and code bring you a little inspiration and joy.'
              )}
            </p>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={close}
              style={{
                padding: '12px 36px',
                minHeight: isMobile ? 44 : undefined,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                color: '#fff',
                background:
                  'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              }}
            >
              {t('开始探索', 'Start Exploring')}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

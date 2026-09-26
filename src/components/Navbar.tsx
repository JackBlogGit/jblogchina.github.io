import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Globe, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { asset } from '../utils/asset';

const NAV = [
  { to: '/', zh: '首页', en: 'Home' },
  { to: '/journal', zh: '作者志', en: 'Journal' },
  { to: '/tech', zh: '技栈', en: 'Stack' },
  { to: '/exhibition', zh: '图展', en: 'Gallery' },
  { to: '/resources', zh: '资源', en: 'Resources' },
  { to: '/message', zh: '留言', en: 'Messages' },
];

export default function Navbar() {
  const { theme, toggleTheme, lang, toggleLang, t } = useApp();
  const location = useLocation();

  const now = new Date();
  const timeStr = now.toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-strong"
      style={{
        position: 'relative',
        zIndex: 20,
        margin: '16px 20px 0',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 60,
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '0.05em',
          padding: '6px 14px',
          borderRadius: 12,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          flexShrink: 0,
          userSelect: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <motion.span
          style={{ display: 'block' }}
          animate={{ y: [0, -2.5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.img
            src={asset('/logo.png')}
            alt="Jack logo"
            whileHover={{ rotate: 360, scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 90, damping: 15 }}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              objectFit: 'cover',
              background: '#fff',
              display: 'block',
            }}
          />
        </motion.span>
        Jblog
      </Link>

      {/* Nav items */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginLeft: 8,
          flex: 1,
        }}
      >
        {NAV.map((item, idx) => {
          const active = location.pathname === item.to;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05, duration: 0.4 }}
            >
              <Link
                to={item.to}
                style={{
                  position: 'relative',
                  padding: '8px 16px',
                  borderRadius: 10,
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                  transition: 'color 0.25s',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--accent)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active
                    ? 'var(--accent)'
                    : 'var(--text-secondary)')
                }
              >
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 10,
                      background: 'var(--accent-soft)',
                      zIndex: -1,
                    }}
                  />
                )}
                {t(item.zh, item.en)}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Clock */}
        <div
          className="glass"
          style={{
            padding: '6px 12px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--text-secondary)',
            minWidth: 80,
            justifyContent: 'center',
          }}
        >
          <Clock size={14} />
          <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {timeStr}
          </span>
        </div>

        {/* Language toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLang}
          className="glass"
          style={{
            padding: '6px 12px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <Globe size={14} />
          {lang === 'zh' ? '中' : 'EN'}
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: theme === 'dark' ? 20 : -20 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="glass"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
          aria-label="toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>
      </div>
    </motion.header>
  );
}

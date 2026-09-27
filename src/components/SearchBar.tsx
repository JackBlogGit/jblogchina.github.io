import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDevice } from '../hooks/useDevice';

interface Props {
  onSearch?: (q: string) => void;
  onChange?: (q: string) => void;
  initialValue?: string;
  placeholder?: string;
}

export default function SearchBar({ onSearch, onChange, initialValue = '', placeholder }: Props) {
  const { t } = useApp();
  const { isMobile, isTablet } = useDevice();
  const [q, setQ] = useState(initialValue);
  const [focused, setFocused] = useState(false);

  const ph = placeholder ?? t('搜索内容、标签、作者...', 'Search content, tags, author...');

  /* 固定 px 宽在手机上会冲出容器（聚焦 520px > 390px 屏宽），改为流式宽度 */
  const barWidth = isMobile ? '100%' : isTablet && focused ? '100%' : focused ? 520 : 280;

  const update = (val: string) => {
    setQ(val);
    onChange?.(val);
  };

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="glass glass-strong"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: isMobile ? '8px 8px 8px 14px' : focused ? '12px 18px' : '10px 16px',
        borderRadius: 18,
        width: barWidth,
        maxWidth: isMobile ? undefined : 520,
        margin: '10px auto',
        transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <input
        value={q}
        placeholder={ph}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) onSearch(q);
        }}
        style={{
          flex: 1,
          background: 'transparent',
          color: 'var(--text-primary)',
          /* 手机上内联 14px 会盖掉 index.css 的 16px 防缩放规则，iOS 聚焦即放大页面 */
          fontSize: isMobile ? 16 : 14,
          minWidth: 0,
        }}
      />
      {q && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => update('')}
          style={{
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? 44 : undefined,
            height: isMobile ? 44 : undefined,
            marginRight: isMobile ? -8 : undefined,
          }}
          aria-label="clear"
        >
          <X size={16} />
        </motion.button>
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSearch?.(q)}
        style={{
          padding: isMobile ? '12px 16px' : '6px 14px',
          minHeight: isMobile ? 44 : undefined,
          borderRadius: 10,
          background: 'var(--accent)',
          color: '#fff',
          fontWeight: 600,
          fontSize: isMobile ? 14 : 13,
          flexShrink: 0,
        }}
      >
        {t('搜索', 'Search')}
      </motion.button>
    </motion.div>
  );
}

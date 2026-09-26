import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface Props {
  onSearch?: (q: string) => void;
  onChange?: (q: string) => void;
  initialValue?: string;
  placeholder?: string;
}

export default function SearchBar({ onSearch, onChange, initialValue = '', placeholder }: Props) {
  const { t } = useApp();
  const [q, setQ] = useState(initialValue);
  const [focused, setFocused] = useState(false);

  const ph = placeholder ?? t('搜索内容、标签、作者...', 'Search content, tags, author...');

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
        padding: focused ? '12px 18px' : '10px 16px',
        borderRadius: 18,
        width: focused ? 520 : 280,
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
          fontSize: 14,
          minWidth: 0,
        }}
      />
      {q && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => update('')}
          style={{ color: 'var(--text-muted)', display: 'flex' }}
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
          padding: '6px 14px',
          borderRadius: 10,
          background: 'var(--accent)',
          color: '#fff',
          fontWeight: 600,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {t('搜索', 'Search')}
      </motion.button>
    </motion.div>
  );
}

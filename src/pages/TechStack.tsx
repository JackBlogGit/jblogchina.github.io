import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Search, ArrowRight, Star, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { useTechGroups } from '../data/techStack';

interface TechCard {
  name: string;
  slug: string;
  level: number;
  year: string;
  catZh: string;
  catEn: string;
  catKey: string;
}

export default function TechStack() {
  const { t, lang } = useApp();
  const groups = useTechGroups();
  const [activeCat, setActiveCat] = useState('all');
  const [query, setQuery] = useState('');

  const ALL_ITEMS: TechCard[] = useMemo(
    () =>
      groups.flatMap((g) =>
        g.items.map((item) => ({
          ...item,
          catZh: g.zh,
          catEn: g.en,
          catKey: g.en.toLowerCase(),
        }))
      ),
    [groups]
  );

  const filtered = useMemo(() => {
    let items = activeCat === 'all' ? ALL_ITEMS : ALL_ITEMS.filter((i) => i.catKey === activeCat);
    if (query.trim()) {
      items = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));
    }
    return items;
  }, [activeCat, query, ALL_ITEMS]);

  const categories = [
    { key: 'all', zh: '全部', en: 'All', icon: Star },
    ...groups.map((g) => ({
      key: g.en.toLowerCase(),
      zh: g.zh,
      en: g.en,
      icon: g.icon,
    })),
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        padding: '12px 24px 40px 80px',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* ===== Left Sidebar: Categories (pinned at 25% from top) ===== */}
      <aside
        style={{
          width: 180,
          flexShrink: 0,
          position: 'sticky',
          top: '25%',
          alignSelf: 'flex-start',
        }}
      >
        <AnimateIn x={-20} duration={0.6}>
          <div className="glass" style={{ borderRadius: 16, padding: '14px 10px' }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, padding: '0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('分类', 'Categories')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {categories.map((cat) => {
                const isActive = activeCat === cat.key;
                const count = cat.key === 'all' ? ALL_ITEMS.length : ALL_ITEMS.filter((i) => i.catKey === cat.key).length;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCat(cat.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 10px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                      transition: 'background 0.2s, color 0.2s',
                      position: 'relative',
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="tech-cat-indicator"
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 3,
                          height: 16,
                          borderRadius: 2,
                          background: 'var(--accent)',
                        }}
                      />
                    )}
                    <Icon size={15} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{t(cat.zh, cat.en)}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </AnimateIn>
      </aside>

      {/* ===== Main Content: Search + Cards ===== */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <AnimateIn>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={26} style={{ color: 'var(--accent)' }} />
            {t('技栈', 'Tech Stack')}
          </h1>
        </AnimateIn>
        <AnimateIn delay={0.08}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
            {t('我每天都在用的语言、框架与工具。', 'Languages, frameworks and tools I use every day.')}
          </p>
        </AnimateIn>

        {/* Search bar */}
        <AnimateIn delay={0.12} y={12}>
          <div
            className="glass glass-strong"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 14,
              marginBottom: 20,
            }}
          >
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('搜索技术...', 'Search tech...')}
              style={{
                flex: 1,
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: 14,
                minWidth: 0,
              }}
            />
            {query && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setQuery('')}
                style={{ color: 'var(--text-muted)', display: 'flex' }}
                aria-label="clear"
              >
                <X size={16} />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {}}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {t('搜索', 'Search')}
            </motion.button>
          </div>
        </AnimateIn>

        {/* Tech cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((item, i) => (
            <AnimateIn key={item.name} delay={0.04 * i} y={14}>
              <Link to={`/tech/${item.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="glass"
                  style={{
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                  }}
                >
                {/* Left: name + level bar */}
                <div style={{ flex: '1 1 50%', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </h3>
                    {item.level >= 85 && (
                      <Star size={12} style={{ color: '#fbbf24' }} fill="#fbbf24" />
                    )}
                  </div>
                  {/* content preview */}
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(lang === 'zh' ? item.contentZh : item.contentEn)?.slice(0, 20) ?? ''}
                  </p>
                </div>

                {/* Middle: category + tags */}
                <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        fontWeight: 700,
                      }}
                    >
                      {t('类别', 'Cat')}: {t(item.catZh, item.catEn)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '1px 7px',
                        borderRadius: 5,
                        background: 'var(--border-subtle)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {t('始于', 'since')} {item.year}
                    </span>
                  </div>
                </div>

                {/* Right: date + arrow */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {t('日期', 'Date')}: {item.year}
                  </span>
                  <motion.div
                    whileHover={{ x: 3 }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowRight size={16} />
                  </motion.div>
                </div>
              </motion.div>
              </Link>
            </AnimateIn>
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            {t('未找到匹配的技术', 'No matching tech found')}
          </div>
        )}
      </div>
    </div>
  );
}

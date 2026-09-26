import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Search, X } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import ArticleCard from '../components/ArticleCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES, useArticles } from '../data/articles';
import { searchArticles } from '../utils/search';

const TOPIC_CATS = CATEGORIES.filter((c) => c.key !== 'home' && c.key !== 'gallery' && c.key !== 'resources');

export default function Topics() {
  const { t } = useApp();
  const articles = useArticles();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQ = searchParams.get('q') ?? '';

  const [active, setActive] = useState(TOPIC_CATS[0]?.key ?? '');
  const [query, setQuery] = useState(urlQ);

  // 同步 URL 中的查询词（例如从首页搜索跳转过来）
  useEffect(() => {
    setQuery(urlQ);
  }, [urlQ]);

  const byCategory = articles.filter((a) => a.catKey === active);
  const filtered = searchArticles(byCategory, query);

  const updateQuery = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div style={{ padding: '12px 24px 40px 80px', height: '100%', overflowY: 'auto' }}>
      <AnimateIn>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <LayoutGrid size={26} style={{ color: 'var(--accent)' }} />
          {t('分类', 'Categories')}
        </h1>
      </AnimateIn>

      {/* search bar */}
      <AnimateIn delay={0.05} y={12}>
        <div
          className="glass glass-strong"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 14,
            marginBottom: 20,
            maxWidth: 520,
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={t('搜索标题、标签、作者、正文…', 'Search title, tags, author, content…')}
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
              onClick={() => updateQuery('')}
              style={{ color: 'var(--text-muted)', display: 'flex' }}
              aria-label="clear"
            >
              <X size={16} />
            </motion.button>
          )}
        </div>
      </AnimateIn>

      {/* category filter chips */}
      <AnimateIn delay={0.1} y={20} style={{ position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {TOPIC_CATS.map((c) => {
            const isActive = active === c.key;
            const count = articles.filter((a) => a.catKey === c.key).length;
            return (
              <motion.button
                key={c.key}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActive(c.key)}
                className="glass"
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 13,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent)' : undefined,
                  border: isActive ? '1px solid var(--accent)' : undefined,
                }}
              >
                {t(c.zh, c.en)}
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{count}</span>
              </motion.button>
            );
          })}
        </div>
      </AnimateIn>

      {/* result count */}
      {query.trim() && (
        <AnimateIn>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {t('关于 “', 'About “')}
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{query}</span>
            {t('” 找到 ', '” found ')}
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{filtered.length}</span>
            {t(' 篇文章', ' articles')}
          </p>
        </AnimateIn>
      )}

      {/* articles grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {filtered.map((a, i) => (
            <ArticleCard key={a.id} article={a} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          {t('没有找到匹配的文章', 'No matching articles found')}
        </div>
      )}
    </div>
  );
}

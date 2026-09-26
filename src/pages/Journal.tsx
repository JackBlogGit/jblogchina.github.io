import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Search, ArrowUp } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useArticles } from '../data/articles';
import { useApp } from '../context/AppContext';
import { useHiEffect } from '../hooks/useHiEffect';

export default function Journal() {
  const { t, lang } = useApp();
  const allArticles = useArticles();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');

  const journalArticles = allArticles.filter((a) => a.catKey === 'journal');

  const filtered = journalArticles.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const title = (lang === 'zh' ? a.titleZh : a.titleEn).toLowerCase();
    const excerpt = (lang === 'zh' ? a.excerptZh : a.excerptEn).toLowerCase();
    return title.includes(q) || excerpt.includes(q) || a.tags.some((tag) => tag.toLowerCase().includes(q));
  });

  const tocEntries = filtered.map((a) => ({
    id: `article-${a.id}`,
    text: lang === 'zh' ? a.titleZh : a.titleEn,
  }));

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    const container = scrollRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const top = container.scrollTop + (elRect.top - containerRect.top) - 20;
    container.scrollTo({ top, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { active: hiActive, toggle: toggleHi } = useHiEffect();

  return (
    <>
      {/* ===== Fixed Right Panel: Hi + TOC + Scroll Up (pinned at 30% from top) ===== */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          right: 16,
          top: '30%',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: 150,
        }}
      >
        {/* Hi shake button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ x: -3, scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleHi}
          className="glass"
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            color: hiActive ? 'var(--accent)' : 'var(--text-secondary)',
            width: '100%',
            transition: 'color 0.25s',
          }}
        >
          {t('嗨一下~', 'Hi shake~')}
        </motion.button>

        {/* TOC Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="glass"
          style={{ borderRadius: 14, padding: '10px 8px', maxHeight: 220, overflowY: 'auto' }}
        >
          <h4 style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textAlign: 'center',
          }}>
            {t('目录', 'Contents')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tocEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => scrollToId(entry.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '5px 6px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  transition: 'all 0.2s',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-soft)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {entry.text}
              </button>
            ))}
            {tocEntries.length === 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
                {t('无文章', 'No articles')}
              </p>
            )}
          </div>
        </motion.div>

        {/* Scroll to top */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="glass"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            alignSelf: 'center',
          }}
        >
          <ArrowUp size={16} />
        </motion.button>
      </motion.div>

      <div
        ref={scrollRef}
        style={{
          padding: '20px 200px 40px 60px',
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
      {/* ===== Title ===== */}
        <AnimateIn>
          <h1 style={{ fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={24} style={{ color: 'var(--accent)' }} />
            {t('作者志', 'Journal')}
          </h1>
        </AnimateIn>

        {/* ===== Search Bar ===== */}
        <AnimateIn delay={0.1}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: 14, gap: 8 }}>
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('搜索文章标题、摘要、标签…', 'Search titles, excerpts, tags…')}
              style={{
                flex: 1,
                background: 'transparent',
                fontSize: 14,
                color: 'var(--text-primary)',
                padding: '6px 4px',
              }}
            />
            <button
              style={{
                padding: '6px 20px',
                borderRadius: 10,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: 13,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent-soft)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
            >
              {t('搜索', 'Search')}
            </button>
          </div>
        </AnimateIn>

        {/* ===== Article Cards ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((article, i) => (
            <AnimateIn key={article.id} delay={0.05 * i} y={12}>
              <Link to={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div
                  id={`article-${article.id}`}
                  className="glass"
                  style={{
                    padding: '24px 28px',
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    minHeight: 200,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--glass-shadow-strong)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                  }}
                >
                  {/* Title */}
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: 12,
                    }}
                  >
                    {t(article.titleZh, article.titleEn)}
                  </h2>

                  {/* Source + Date Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {t('来源：', 'Source: ')}
                      </span>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {t(article.catZh, article.catEn)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {t('日期：', 'Date: ')}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {article.date}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div style={{ flex: 1, padding: '12px 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {t(article.excerptZh, article.excerptEn)}
                  </div>
                </div>
              </Link>
            </AnimateIn>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
              {t('没有找到匹配的文章', 'No matching articles found')}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

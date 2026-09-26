import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Tag, Calendar, X, Type, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useCallback } from 'react';
import AnimateIn from '../components/AnimateIn';
import { TECH_GROUPS } from '../data/techStack';
import { useApp } from '../context/AppContext';
import { useHiEffect } from '../hooks/useHiEffect';

const FONT_SIZES = [13, 15, 17, 19, 21];

export default function TechArticleDetail() {
  const { slug } = useParams();
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [navOpen, setNavOpen] = useState(false);

  let techItem = null;
  let groupNameZh = '';
  let groupNameEn = '';
  let flatIndex = -1;
  const allItems: { item: (typeof TECH_GROUPS)[0]['items'][0]; groupZh: string; groupEn: string }[] = [];

  TECH_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      allItems.push({ item, groupZh: group.zh, groupEn: group.en });
      if (item.slug === slug) {
        techItem = item;
        groupNameZh = group.zh;
        groupNameEn = group.en;
        flatIndex = allItems.length - 1;
      }
    });
  });

  const prevItem = flatIndex > 0 ? allItems[flatIndex - 1] : null;
  const nextItem = flatIndex < allItems.length - 1 ? allItems[flatIndex + 1] : null;

  const { active: hiActive, toggle: toggleHi } = useHiEffect();

  const fontSize = FONT_SIZES[fontSizeIdx];

  const handleClose = useCallback(() => {
    navigate('/tech');
  }, [navigate]);

  if (!techItem) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('技术文章不存在', 'Tech article not found')}</p>
        <button onClick={() => navigate('/tech')} style={{ marginTop: 12, color: 'var(--accent)' }}>
          {t('返回技栈', 'Back to Tech Stack')}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Floating Hi Button with animated text */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 25,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleHi}
          className="glass"
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            color: hiActive ? 'var(--accent)' : 'var(--text-secondary)',
            transition: 'color 0.25s',
            overflow: 'hidden',
          }}
        >
          {hiActive ? (
            <motion.span
              animate={{
                scale: [1, 1.3, 0.8, 1.15, 0.9, 1.2, 1],
                rotate: [0, 5, -3, 4, -2, 3, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              style={{ display: 'inline-block' }}
            >
              {t('嗨一下~', 'Hi shake~')}
            </motion.span>
          ) : (
            t('嗨一下~', 'Hi shake~')
          )}
        </motion.button>
      </motion.div>

      {/* Close Button - Top Right */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClose}
        className="glass"
        style={{
          position: 'fixed',
          right: 16,
          top: 16,
          zIndex: 25,
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}
      >
        <X size={16} />
      </motion.button>

      {/* Text Size Control - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 25,
        }}
      >
        <div className="glass" style={{ borderRadius: 12, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Type size={14} style={{ color: 'var(--text-muted)' }} />
          {FONT_SIZES.map((size, i) => (
            <motion.button
              key={size}
              whileTap={{ scale: 0.85 }}
              onClick={() => setFontSizeIdx(i)}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                color: fontSizeIdx === i ? '#fff' : 'var(--text-muted)',
                background: fontSizeIdx === i ? 'var(--accent)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {size}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Prev/Next Nav Toggle - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          zIndex: 25,
        }}
      >
        <div className="glass" style={{ borderRadius: 12, padding: '6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNavOpen((v) => !v)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            {navOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </motion.button>
          <AnimatePresence>
            {navOpen && (
              <>
                {prevItem && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Link to={`/tech/${prevItem.item.slug}`}>
                      <div
                        className="glass"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          marginBottom: 4,
                          maxWidth: 140,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                          {t('上一篇', 'Prev')}
                        </div>
                        {prevItem.item.name}
                      </div>
                    </Link>
                  </motion.div>
                )}
                {nextItem && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Link to={`/tech/${nextItem.item.slug}`}>
                      <div
                        className="glass"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          maxWidth: 140,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                          {t('下一篇', 'Next')}
                        </div>
                        {nextItem.item.name}
                      </div>
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content with 20% blur glass surroundings */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(200, 205, 215, 0.20)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '20px 40px 40px 140px',
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Back button */}
        <AnimateIn y={-10}>
          <button
            onClick={() => navigate('/tech')}
            className="glass"
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-secondary)',
              alignSelf: 'flex-start',
            }}
          >
            <ArrowLeft size={14} />
            {t('返回技栈', 'Back to Tech Stack')}
          </button>
        </AnimateIn>

        {/* Article Card - 25% transparent blur glass */}
        <AnimateIn y={20} duration={0.7}>
          <div
            style={{
              borderRadius: 20,
              padding: '32px 36px',
              minHeight: 480,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(25px) saturate(180%)',
              WebkitBackdropFilter: 'blur(25px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Title + Tags Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                  flex: 1,
                }}
              >
                {techItem.name}
              </h1>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0, maxWidth: 200 }}>
                {techItem.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 8,
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Tag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

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
                    background: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {techItem.source}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {t(groupNameZh, groupNameEn)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('日期：', 'Date: ')}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} />
                  {techItem.year}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

            {/* Content */}
            <div style={{ flex: 1, fontSize, color: 'var(--text-secondary)', lineHeight: 1.8, transition: 'font-size 0.3s' }}>
              {lang === 'zh' ? techItem.contentZh : techItem.contentEn}
            </div>
          </div>
        </AnimateIn>
      </div>
    </>
  );
}

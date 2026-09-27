import { motion } from 'framer-motion';
import { Clock, Tag, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Article } from '../data/articles';
import { useApp } from '../context/AppContext';
import { useDevice } from '../hooks/useDevice';

interface Props {
  article: Article;
  variant?: 'card' | 'row';
  index?: number;
}

export default function ArticleCard({ article, variant = 'card', index = 0 }: Props) {
  const { t } = useApp();
  const { isMobile } = useDevice();

  if (variant === 'row') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: 0.04 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to={`/article/${article.slug}`} style={{ display: 'block' }}>
          <motion.div
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.99, x: 0 }}
            className="glass"
            style={{
              padding: 14,
              borderRadius: 16,
              display: 'flex',
              gap: isMobile ? 10 : 14,
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            {/* cover */}
            <div
              style={{
                width: isMobile ? 64 : 72,
                height: isMobile ? 48 : 54,
                borderRadius: 10,
                flexShrink: 0,
                overflow: 'hidden',
                background: `url(${article.cover}) center/cover`,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 11, color: 'var(--text-muted)', flexWrap: isMobile ? 'wrap' : 'nowrap', minWidth: 0 }}>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{t(article.catZh, article.catEn)}</span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} />
                  {article.readMin} {t('分钟', 'min')}
                </span>
                <span>·</span>
                <span>{article.date}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t(article.titleZh, article.titleEn)}
              </div>
            </div>
            <ArrowUpRight size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: 0.05 * index, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/article/${article.slug}`} style={{ display: 'block' }}>
        <motion.article
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.99 }}
          className="glass"
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* cover */}
          <div
            style={{
              height: isMobile ? 148 : 180,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `url(${article.cover}) center/cover`,
                transition: 'transform 0.5s ease',
              }}
              className="card-cover"
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.35))',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {t(article.catZh, article.catEn)}
            </div>
          </div>

          {/* body */}
          <div style={{ padding: isMobile ? '14px 14px 12px' : '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Clock size={11} />
                {article.readMin} {t('分钟阅读', 'min read')}
              </span>
              <span>·</span>
              <span>{article.date}</span>
            </div>

            <h3 style={{ fontSize: isMobile ? 16 : 17, fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)' }}>
              {t(article.titleZh, article.titleEn)}
            </h3>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
              {t(article.excerptZh, article.excerptEn)}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: 'var(--border-subtle)',
                      color: 'var(--text-muted)',
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
              <ArrowUpRight size={16} style={{ color: 'var(--accent)' }} />
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

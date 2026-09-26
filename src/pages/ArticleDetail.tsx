import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Share2,
  Heart,
  Bookmark,
} from 'lucide-react';
import { useState } from 'react';
import AnimateIn from '../components/AnimateIn';
import { useArticles } from '../data/articles';
import type { Block } from '../data/articles';
import { useApp } from '../context/AppContext';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { t } = useApp();
  const navigate = useNavigate();
  const articles = useArticles();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('文章不存在', 'Article not found')}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 12, color: 'var(--accent)' }}>
          {t('回到首页', 'Back home')}
        </button>
      </div>
    );
  }

  const related = articles.filter(
    (a) => a.id !== article.id && a.catKey === article.catKey
  ).slice(0, 2);
  const fallback = articles.filter((a) => a.id !== article.id).slice(0, 2);
  const recs = related.length > 0 ? related : fallback;

  return (
    <div style={{ padding: '12px 24px 40px 80px', height: '100%', overflowY: 'auto' }}>
      {/* back */}
      <AnimateIn y={-10}>
        <button
          onClick={() => navigate(-1)}
          className="glass"
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={14} />
          {t('返回', 'Back')}
        </button>
      </AnimateIn>

      {/* header */}
      <AnimateIn y={20} duration={0.7}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span
              style={{
                padding: '3px 12px',
                borderRadius: 999,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {t(article.catZh, article.catEn)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} />
              {article.date}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              {article.readMin} {t('分钟', 'min')}
            </span>
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: 16,
              color: 'var(--text-primary)',
            }}
          >
            {t(article.titleZh, article.titleEn)}
          </h1>

          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
            {t(article.excerptZh, article.excerptEn)}
          </p>

          {/* author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <img
              src={article.authorAvatar}
              alt={article.author}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{article.author}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('作者', 'Author')}</div>
            </div>
          </div>
        </div>
      </AnimateIn>

      {/* cover */}
      <AnimateIn y={30} delay={0.1} duration={0.7}>
        <div
          className="glass"
          style={{
            maxWidth: 720,
            margin: '0 auto 32px',
            borderRadius: 20,
            overflow: 'hidden',
            padding: 0,
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 8',
              background: `url(${article.cover}) center/cover`,
            }}
          />
        </div>
      </AnimateIn>

      {/* body */}
      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        {article.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} index={i} />
        ))}
      </article>

      {/* footer actions */}
      <AnimateIn delay={0.1}>
        <div
          className="glass"
          style={{
            maxWidth: 720,
            margin: '32px auto 0',
            padding: '16px 20px',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 8,
                  background: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked((v) => !v)}
              className="glass"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: liked ? '#f472b6' : 'var(--text-muted)',
              }}
            >
              <Heart size={16} fill={liked ? '#f472b6' : 'none'} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSaved((v) => !v)}
              className="glass"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: saved ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Bookmark size={16} fill={saved ? 'var(--accent)' : 'none'} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="glass"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Share2 size={16} />
            </motion.button>
          </div>
        </div>
      </AnimateIn>

      {/* related */}
      {recs.length > 0 && (
        <div style={{ maxWidth: 720, margin: '40px auto 0' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            {t('继续阅读', 'Keep reading')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {recs.map((r, i) => (
              <AnimateIn key={r.id} delay={0.08 * i} y={16}>
                <Link to={`/article/${r.slug}`}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="glass"
                    style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        height: 100,
                        background: `url(${r.cover}) center/cover`,
                      }}
                    />
                    <div style={{ padding: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                        {t(r.catZh, r.catEn)} · {r.readMin} {t('分钟', 'min')}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t(r.titleZh, r.titleEn)}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockRenderer({ block, index }: { block: Block; index: number }) {
  const { t } = useApp();

  if (block.type === 'p') {
    return (
      <AnimateIn key={index} delay={0.05 * index} y={12}>
        <p style={{ fontSize: 16, lineHeight: 1.85, color: 'var(--text-secondary)', marginBottom: 20 }}>
          {t(block.textZh!, block.textEn!)}
        </p>
      </AnimateIn>
    );
  }

  if (block.type === 'h2') {
    return (
      <AnimateIn key={index} delay={0.05 * index} y={12}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 14, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {t(block.textZh!, block.textEn!)}
        </h2>
      </AnimateIn>
    );
  }

  if (block.type === 'h3') {
    return (
      <AnimateIn key={index} delay={0.05 * index} y={12}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 6, marginBottom: 12, color: 'var(--text-primary)' }}>
          {t(block.textZh!, block.textEn!)}
        </h3>
      </AnimateIn>
    );
  }

  if (block.type === 'img') {
    return (
      <AnimateIn key={index} delay={0.05 * index} y={20} duration={0.7}>
        <figure style={{ margin: '0 0 24px' }}>
          <div
            className="glass"
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              padding: 0,
            }}
          >
            <img
              src={block.img}
              alt={t(block.captionZh!, block.captionEn!)}
              style={{ width: '100%', display: 'block' }}
              loading="lazy"
            />
          </div>
          {block.captionZh && (
            <figcaption style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              {t(block.captionZh, block.captionEn!)}
            </figcaption>
          )}
        </figure>
      </AnimateIn>
    );
  }

  if (block.type === 'quote') {
    return (
      <AnimateIn key={index} delay={0.05 * index} y={12}>
        <blockquote
          className="glass"
          style={{
            margin: '0 0 24px',
            padding: '18px 24px',
            borderRadius: 14,
            borderLeft: '3px solid var(--accent)',
            fontSize: 16,
            fontStyle: 'italic',
            color: 'var(--text-primary)',
            lineHeight: 1.7,
          }}
        >
          {t(block.textZh!, block.textEn!)}
        </blockquote>
      </AnimateIn>
    );
  }

  if (block.type === 'code') {
    return (
      <AnimateIn key={index} delay={0.05 * index} y={12}>
        <div
          className="glass"
          style={{
            margin: '0 0 24px',
            borderRadius: 14,
            overflow: 'hidden',
            padding: 0,
          }}
        >
          {block.lang && (
            <div
              style={{
                padding: '8px 16px',
                fontSize: 11,
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {block.lang}
            </div>
          )}
          <pre
            style={{
              margin: 0,
              padding: '16px 18px',
              overflowX: 'auto',
              fontSize: 13,
              lineHeight: 1.6,
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
              color: 'var(--text-primary)',
            }}
          >
            <code>{t(block.textZh!, block.textEn!)}</code>
          </pre>
        </div>
      </AnimateIn>
    );
  }

  if (block.type === 'list') {
    const items = t(
      block.itemsZh!.join('\u0001'),
      block.itemsEn!.join('\u0001')
    ).split('\u0001');
    return (
      <AnimateIn key={index} delay={0.05 * index} y={12}>
        <ul style={{ margin: '0 0 24px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', position: 'relative', paddingLeft: 6 }}>
              <span style={{ position: 'absolute', left: -14, color: 'var(--accent)' }}>•</span>
              {item}
            </li>
          ))}
        </ul>
      </AnimateIn>
    );
  }

  return null;
}

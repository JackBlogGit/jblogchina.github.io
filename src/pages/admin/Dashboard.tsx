import { motion } from 'framer-motion';
import { FileText, Clock, TrendingUp, CheckCircle, FileX, Image as ImageIcon, Tag, Zap, MessageSquare, Megaphone, Frame, Package } from 'lucide-react';
import { useArticles } from '../../data/articles';
import { useMessages } from '../../data/messages';
import { useAnnouncements } from '../../data/announcements';
import { useGalleryArts } from '../../data/gallery';
import { useResources } from '../../data/resources';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export default function Dashboard() {
  const { t } = useApp();
  const articles = useArticles();
  const messages = useMessages();
  const announcements = useAnnouncements();
  const galleryArts = useGalleryArts();
  const resources = useResources();
  const [mediaCount, setMediaCount] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const readMedia = () => {
      try {
        setMediaCount(JSON.parse(localStorage.getItem('blog-media-library') || '[]').length);
      } catch {
        setMediaCount(0);
      }
    };
    readMedia();
    const timer = setInterval(readMedia, 3000);
    window.addEventListener('storage', readMedia);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', readMedia);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalArticles = articles.length;
  const publishedArticles = articles.filter((a) => a.date).length;
  const draftArticles = totalArticles - publishedArticles;

  const totalWords = articles.reduce((sum, a) => {
    const text = a.blocks
      .filter((b) => b.type === 'p' || b.type === 'h2' || b.type === 'h3')
      .reduce((s, b) => s + (b.textZh?.length ?? 0), 0);
    return sum + text;
  }, 0);

  const catStats: Record<string, { count: number; zh: string }> = {};
  articles.forEach((a) => {
    if (!catStats[a.catKey]) {
      catStats[a.catKey] = { count: 0, zh: a.catZh };
    }
    catStats[a.catKey].count++;
  });

  const tagStats: Record<string, number> = {};
  articles.forEach((a) => {
    a.tags.forEach((tag) => {
      tagStats[tag] = (tagStats[tag] ?? 0) + 1;
    });
  });
  const topTags = Object.entries(tagStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const recentArticles = [...articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const stats = [
    { label: t('文章总数', 'Total Articles'), value: totalArticles, suffix: '', icon: FileText, color: '#6366f1' },
    { label: t('已发布', 'Published'), value: publishedArticles, suffix: '', icon: CheckCircle, color: '#10b981' },
    { label: t('草稿', 'Drafts'), value: draftArticles, suffix: '', icon: FileX, color: '#f59e0b' },
    { label: t('总字数', 'Total Words'), value: totalWords, suffix: '', icon: TrendingUp, color: '#8b5cf6' },
    { label: t('媒体文件', 'Media Files'), value: mediaCount, suffix: '', icon: ImageIcon, color: '#ec4899' },
    { label: t('留言', 'Messages'), value: messages.length, suffix: '', icon: MessageSquare, color: '#14b8a6' },
    { label: t('公告/须知', 'Announcements'), value: announcements.length, suffix: '', icon: Megaphone, color: '#f97316' },
    { label: t('图展作品', 'Gallery Arts'), value: galleryArts.length, suffix: '', icon: Frame, color: '#0ea5e9' },
    { label: t('资源', 'Resources'), value: resources.length, suffix: '', icon: Package, color: '#84cc16' },
    { label: t('平均阅读', 'Avg Read Time'), value: Math.round(articles.reduce((s, a) => s + a.readMin, 0) / (articles.length || 1)), suffix: ' min', icon: Clock, color: '#06b6d4' },
  ];

  const maxCatCount = Math.max(...Object.values(catStats).map((c) => c.count), 1);

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t('仪表盘', 'Dashboard')}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}
            />
            {t('实时数据', 'Live')} · {now.toLocaleString('zh-CN', { hour12: false })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link
            to="/admin/articles/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <Zap size={16} />
            {t('写文章', 'Write')}
          </Link>
          <Link
            to="/admin/media"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: 'var(--card-bg, #fff)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <ImageIcon size={16} />
            {t('媒体库', 'Media')}
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'var(--card-bg, #fff)',
              borderRadius: 12,
              padding: 20,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: stat.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                }}
              >
                <stat.icon size={20} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
              <CountUp value={stat.value} />
              {stat.suffix}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Category breakdown and Tags */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ background: 'var(--card-bg, #fff)', borderRadius: 12, padding: 20, border: '1px solid var(--border-subtle)' }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{t('分类统计', 'Categories')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(catStats).map(([key, data]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>{data.zh}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{data.count}</span>
                </div>
                <div style={{ height: 8, background: 'var(--hover-bg, #f3f4f6)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.count / maxCatCount) * 100}%` }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    style={{ height: '100%', background: 'var(--accent)', borderRadius: 4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tag cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'var(--card-bg, #fff)', borderRadius: 12, padding: 20, border: '1px solid var(--border-subtle)' }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={20} />
            {t('热门标签', 'Popular Tags')}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topTags.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('暂无标签', 'No tags yet')}</div>
            ) : (
              topTags.map(([tag, count]) => (
                <div
                  key={tag}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--hover-bg, #f3f4f6)',
                    borderRadius: 16,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>#{tag}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{count}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent articles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ background: 'var(--card-bg, #fff)', borderRadius: 12, padding: 20, border: '1px solid var(--border-subtle)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{t('最近文章', 'Recent Articles')}</h2>
          <Link to="/admin/articles" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>
            {t('查看全部', 'View all')} →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recentArticles.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              {t('暂无文章', 'No articles yet')}
            </div>
          ) : (
            recentArticles.map((article) => (
              <div
                key={article.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: 'var(--hover-bg, #f9fafb)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: `url(${article.cover}) center/cover`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t(article.titleZh, article.titleEn)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                    <span>{article.date || t('草稿', 'Draft')}</span>
                    <span>{article.catZh}</span>
                    <span>{article.readMin} {t('分钟', 'min')}</span>
                  </div>
                </div>
                <Link to={`/admin/articles/edit/${article.id}`} style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>
                  {t('编辑', 'Edit')}
                </Link>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

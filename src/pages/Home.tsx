import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Feather,
  Sparkles,
  User,
  Megaphone,
  Lightbulb,
  Layers,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import AnimateIn from '../components/AnimateIn';
import HiButton from '../components/HiButton';
import SearchBar from '../components/SearchBar';
import { useApp } from '../context/AppContext';
import { useDevice } from '../hooks/useDevice';
import { useArticles } from '../data/articles';
import { asset } from '../utils/asset';
import { useAnnouncements } from '../data/announcements';
import { useFeaturedId } from '../data/featured';

const LATEST_MUSING = {
  textZh: '模糊让玻璃透明，边框让玻璃有形。写代码也一样——抽象让逻辑透明，类型让逻辑有形。',
  textEn: 'Blur makes glass transparent; the border gives it form. Code is the same — abstraction makes logic transparent, types give it form.',
  time: '2026-09-10 14:22',
  tag: '设计',
};

const AUTHOR_AVATAR = asset('/images/avatar.png');

export default function Home() {
  const { t } = useApp();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();
  const articles = useArticles();
  const featuredId = useFeaturedId();
  const announcements = useAnnouncements();
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const featured = articles.find((a) => a.id === featuredId) ?? articles[0];
  const techArticle = articles.find((a) => a.catKey === 'stack') ?? articles[1];

  // Build date archive from articles
  const archive: Record<string, { ym: string; year: string; month: string; items: typeof articles }> = {};
  articles.forEach((a) => {
    const [y, m] = a.date.split('-');
    const ym = `${y}-${m}`;
    if (!archive[ym]) archive[ym] = { ym, year: y, month: m, items: [] };
    archive[ym].items.push(a);
  });
  const archiveList = Object.values(archive).sort((a, b) => b.ym.localeCompare(a.ym));

  const toggleMonth = (ym: string) =>
    setExpandedMonths((p) => ({ ...p, [ym]: !p[ym] }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 16 : 20,
        padding: isMobile ? '12px 14px 40px' : '12px 24px 40px 80px',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* ===== Main Content ===== */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Search bar */}
        <AnimateIn y={-10} duration={0.5}>
          <SearchBar onSearch={(q) => navigate(`/topics?q=${encodeURIComponent(q)}`)} />
        </AnimateIn>

        {/* Three Cards Row: Author + Website Info + Announcements */}
        <AnimateIn y={24} delay={0.05} duration={0.6}>
          <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', gap: 16, marginBottom: 20 }}>
            {/* Card 1: Author Introduction */}
            <Link to="/about" style={{ flex: isMobile ? '1 1 100%' : isTablet ? '1 1 calc(50% - 8px)' : '1 1 0%', minWidth: 0, textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -3 }}
                className="glass glass-strong"
                style={{
                  borderRadius: 18,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(120deg, rgba(99,102,241,0.15), rgba(168,85,247,0.12), rgba(14,165,233,0.15))',
                    filter: 'blur(30px)',
                    zIndex: 0,
                  }}
                  animate={{ x: [0, 20, -15, 0], y: [0, -10, 15, 0] }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                />
                <img
                  src={AUTHOR_AVATAR}
                  alt="author"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--glass-border)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <User size={11} />
                    {t('作者介绍', 'About')}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Jack</div>
                </div>
              </motion.div>
            </Link>

            {/* Card 2: Website Info */}
            <Link to="/site-info" style={{ flex: isMobile ? '1 1 100%' : isTablet ? '1 1 calc(50% - 8px)' : '1 1 0%', minWidth: 0, textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -3 }}
                className="glass"
                style={{
                  borderRadius: 18,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(14, 165, 233, 0.18)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lightbulb size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Sparkles size={11} />
                    {t('网站需知', 'Site Info')}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {t('需知', 'Guide')}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {t('博客功能与使用指南', 'Blog features & usage guide')}
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Card 3: Announcements */}
            <Link to="/announcements" style={{ flex: isMobile ? '1 1 100%' : isTablet ? '1 1 calc(50% - 8px)' : '1 1 0%', minWidth: 0, textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -3 }}
                className="glass"
                style={{
                  borderRadius: 18,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Megaphone size={11} />
                  {t('公告栏', 'Announcements')}
                </div>
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 9,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'var(--border-subtle)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {t(a.tag, a.tagEn ?? a.tag)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, flex: 1 }}>
                      {t(a.textZh, a.textEn)}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>
                  {t('查看全部', 'View all')} <ArrowUpRight size={11} />
                </div>
              </motion.div>
            </Link>
          </div>
        </AnimateIn>

        {/* Box 2: Latest Journal Entry (作者志) */}
        <AnimateIn y={20} delay={0.12} duration={0.6}>
          <Link to="/journal" style={{ display: 'block' }}>
            <motion.div
              whileHover={{ y: -3 }}
              className="glass"
              style={{
                borderRadius: 18,
                padding: '18px 22px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.18)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Lightbulb size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
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
                    {t('作者志', 'Journal')}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {LATEST_MUSING.time}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {t(LATEST_MUSING.textZh, LATEST_MUSING.textEn)}
                </p>
              </div>
              <ArrowUpRight size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            </motion.div>
          </Link>
        </AnimateIn>

        {/* Box 3: Latest Tech Stack (技栈) */}
        <AnimateIn y={20} delay={0.18} duration={0.6}>
          <Link to="/tech" style={{ display: 'block' }}>
            <motion.div
              whileHover={{ y: -3 }}
              className="glass"
              style={{
                borderRadius: 18,
                padding: '18px 22px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(14, 165, 233, 0.18)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Layers size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
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
                    {t('技栈', 'Tech Stack')}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {techArticle.date} · {techArticle.readMin} {t('分钟', 'min')}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {t(techArticle.titleZh, techArticle.titleEn)}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t(techArticle.excerptZh, techArticle.excerptEn)}
                </p>
              </div>
              <ArrowUpRight size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            </motion.div>
          </Link>
        </AnimateIn>

        {/* Featured article hero */}
        <AnimateIn y={24} delay={0.3} duration={0.7}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              {t('精选文章', 'Featured')}
            </h2>
            <Link to="/topics">
              <motion.span
                whileHover={{ x: 2 }}
                style={{ fontSize: 13, color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                {t('全部', 'All')} <ArrowUpRight size={14} />
              </motion.span>
            </Link>
          </div>
          <Link to={`/article/${featured.slug}`} style={{ display: 'block' }}>
            <motion.div
              whileHover={{ y: -4 }}
              className="glass"
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                display: 'flex',
                minHeight: 160,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  flex: '0 0 240px',
                  background: `url(${featured.cover}) center/cover`,
                }}
              />
              <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700 }}>
                    {t(featured.catZh, featured.catEn)}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {featured.date} · {featured.readMin} {t('分钟', 'min')}
                  </span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 }}>
                  {t(featured.titleZh, featured.titleEn)}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {t(featured.excerptZh, featured.excerptEn)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                  <Feather size={14} />
                  {t('阅读全文', 'Read full article')}
                </div>
              </div>
            </motion.div>
          </Link>
        </AnimateIn>
      </div>

      {/* ===== Right Sidebar ===== */}
      <aside
        style={{
          width: isMobile ? '100%' : 220,
          flexShrink: 0,
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? 12 : 16,
        }}
      >
        {/* Hi Button */}
        <AnimateIn x={20} delay={0.2} duration={0.6}>
          <HiButton />
        </AnimateIn>

        {/* Date Archive */}
        <AnimateIn x={20} delay={0.28} duration={0.6}>
          <div className="glass" style={{ borderRadius: 16, padding: '16px 14px' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={14} style={{ color: 'var(--accent)' }} />
              {t('归档', 'Archive')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {archiveList.map((group) => {
                const expanded = expandedMonths[group.ym] ?? true;
                return (
                  <div key={group.ym}>
                    <button
                      onClick={() => toggleMonth(group.ym)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 4px',
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        borderRadius: 6,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-soft)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>
                        {group.year}{t('年', '-')}{group.month}{t('月', '')}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        ({group.items.length})
                      </span>
                      {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {expanded && (
                      <div style={{ paddingLeft: 10, paddingBottom: 4 }}>
                        {group.items.map((a) => (
                          <Link
                            key={a.id}
                            to={`/article/${a.slug}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              minWidth: 0,
                              padding: '4px 6px',
                              fontSize: 11,
                              color: 'var(--text-muted)',
                              borderRadius: 4,
                              transition: 'background 0.2s, color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--accent-soft)';
                              e.currentTarget.style.color = 'var(--accent)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                          >
                            <span style={{ width: 10, height: 10, borderRadius: 3, border: '1px solid var(--text-muted)', flexShrink: 0 }} />
                            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.date.slice(8)}{t('日', '')} {t(a.titleZh, a.titleEn)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </AnimateIn>
      </aside>
    </div>
  );
}

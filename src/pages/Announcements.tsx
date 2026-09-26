import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Megaphone, Calendar, Sparkles, Inbox } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { useAnnouncements } from '../data/announcements';
import { asset } from '../utils/asset';

const BANNER = asset('/images/announcements-banner.png');

const TAG_COLORS: Record<string, { bg: string; fg: string }> = {
  更新: { bg: 'rgba(99,102,241,0.16)', fg: '#6366f1' },
  新功能: { bg: 'rgba(16,185,129,0.16)', fg: '#10b981' },
  文章: { bg: 'rgba(236,72,153,0.16)', fg: '#ec4899' },
  社区: { bg: 'rgba(245,158,11,0.16)', fg: '#f59e0b' },
};

const RECENT_DAYS = 7;
const isRecent = (date: string) => {
  const diff = Date.now() - new Date(date + 'T00:00:00').getTime();
  return diff >= 0 && diff < RECENT_DAYS * 86400000;
};

export default function Announcements() {
  const { t } = useApp();

  const all = useAnnouncements();
  // 须知类条目只在网站须知页展示，公告栏仅展示公告
  const news = useMemo(() => all.filter((a) => (a.kind ?? 'news') === 'news'), [all]);

  const tags = useMemo(() => Array.from(new Set(news.map((a) => a.tag))), [news]);
  const [activeTag, setActiveTag] = useState('全部');
  const filtered = activeTag === '全部' || !tags.includes(activeTag) ? news : news.filter((a) => a.tag === activeTag);

  return (
    <div
      style={{
        padding: '12px 24px 40px 80px',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Hero banner */}
        <AnimateIn>
          <div className="glass" style={{ borderRadius: 20, overflow: 'hidden', padding: 0, marginBottom: 28 }}>
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 6',
                background: `url(${BANNER}) center/cover`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 65%)',
                }}
              />
              <div style={{ position: 'absolute', bottom: 24, left: 28 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  <Megaphone size={14} />
                  {t('公告栏', 'Announcements')}
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  {t('最新动态', 'Latest Updates')}
                </h1>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Tag filters */}
        {tags.length > 1 && (
          <AnimateIn delay={0.05}>
            <LayoutGroup>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {[t('全部', 'All'), ...tags].map((tag) => {
                  const isActive = (tag === t('全部', 'All') && activeTag === '全部') || tag === activeTag;
                  const color = TAG_COLORS[tag] ?? { bg: 'var(--accent-soft)', fg: 'var(--accent)' };
                  return (
                    <motion.button
                      key={tag}
                      layout
                      onClick={() => setActiveTag(tag === t('全部', 'All') ? '全部' : tag)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        position: 'relative',
                        padding: '6px 14px',
                        borderRadius: 10,
                        border: '1px solid ' + (isActive ? color.fg : 'var(--border-subtle)'),
                        background: 'transparent',
                        color: isActive ? color.fg : 'var(--text-secondary)',
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="tag-pill"
                          style={{ position: 'absolute', inset: 0, borderRadius: 9, background: color.bg }}
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span style={{ position: 'relative' }}>{tag}</span>
                    </motion.button>
                  );
                })}
              </div>
            </LayoutGroup>
          </AnimateIn>
        )}

        {/* Count line */}
        <AnimateIn delay={0.06}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
              color: 'var(--text-muted)',
              fontSize: 13,
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            {activeTag === '全部'
              ? t(`共 ${news.length} 条公告`, `${news.length} announcements in total`)
              : t(`「${activeTag}」共 ${filtered.length} 条`, `${filtered.length} in "${activeTag}"`)}
          </div>
        </AnimateIn>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{ borderRadius: 16, padding: '56px 24px', textAlign: 'center' }}
          >
            <Inbox size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
              {t('暂无公告，敬请期待。', 'No announcements yet — stay tuned.')}
            </p>
          </motion.div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {/* vertical line */}
            <div
              style={{
                position: 'absolute',
                left: 6,
                top: 8,
                bottom: 8,
                width: 2,
                background: 'var(--border-subtle)',
                borderRadius: 1,
              }}
            />
            <motion.div
              layout
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {filtered.map((a, i) => {
                  const color = TAG_COLORS[a.tag] ?? { bg: 'var(--accent-soft)', fg: 'var(--accent)' };
                  return (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                      transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      style={{ position: 'relative' }}
                    >
                      {/* dot */}
                      <div
                        style={{
                          position: 'absolute',
                          left: -28,
                          top: 22,
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: color.fg,
                          border: '3px solid var(--bg, #fff)',
                          boxShadow: '0 0 0 2px ' + color.fg + '40',
                        }}
                      />
                      <motion.div
                        className="glass"
                        whileHover={{ x: 4 }}
                        style={{ borderRadius: 16, padding: '18px 22px' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 10,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 8,
                              background: color.bg,
                              color: color.fg,
                            }}
                          >
                            {t(a.tag, a.tagEn ?? a.tag)}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              color: 'var(--text-muted)',
                            }}
                          >
                            <Calendar size={12} />
                            {a.date}
                          </span>
                          {isRecent(a.date) && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: 0.5,
                                padding: '2px 7px',
                                borderRadius: 6,
                                background: 'rgba(239,68,68,0.14)',
                                color: '#ef4444',
                              }}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: 15,
                            lineHeight: 1.7,
                            color: 'var(--text-primary)',
                            margin: 0,
                            fontWeight: 500,
                          }}
                        >
                          {t(a.textZh, a.textEn)}
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Footer */}
        <AnimateIn delay={0.5}>
          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              padding: '32px 0 20px',
            }}
          >
            {t('感谢关注本站的每一次更新。', 'Thanks for following every update.')}
          </p>
        </AnimateIn>
      </div>
    </div>
  );
}

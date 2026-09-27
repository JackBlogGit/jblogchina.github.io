import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { useResources, useResourceGroups } from '../data/resources';
import { useDevice } from '../hooks/useDevice';

export default function ResourcesPage() {
  const { t, lang, toggleLang, toggleTheme, theme } = useApp();
  const { isMobile } = useDevice();
  const items = useResources();
  const allGroups = useResourceGroups();
  const [activeGroup, setActiveGroup] = useState(allGroups[0].key);

  const groups = allGroups.map((g) => ({
    ...g,
    items: items.filter((i) => i.groupKey === g.key),
  }));
  const currentGroup = groups.find((g) => g.key === activeGroup) || groups[0];

  return (
    <div style={{ padding: isMobile ? '16px 14px 32px' : '20px 40px 40px 60px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ===== Header Row ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AnimateIn>
          <h1 style={{ fontSize: 32, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--accent)' }}>📦</span>
            {t('资源', 'Resources')}
          </h1>
        </AnimateIn>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={toggleTheme}
            className="glass"
            style={{ padding: '6px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}
          >
            {theme === 'light' ? '明/暗' : 'Dark/Light'}
          </button>
          <button
            onClick={toggleLang}
            className="glass"
            style={{ padding: '6px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}
          >
            {lang === 'zh' ? '中/英' : 'EN/ZH'}
          </button>
        </div>
      </div>

      {/* ===== Main Layout: Left Sidebar + Content ===== */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
        {/* ===== Left Sidebar: Category Nav (pinned at 25% from top) ===== */}
        <aside style={{ width: isMobile ? '100%' : 140, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, position: isMobile ? 'static' : 'sticky', top: '25%', alignSelf: 'flex-start' }}>
          <AnimateIn x={-20} delay={0.1}>
            <div className="glass" style={{ borderRadius: 14, padding: '10px 8px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 4, overflowX: isMobile ? 'auto' : undefined }}>
              {groups.map((group) => {
                const isActive = activeGroup === group.key;
                return (
                  <button
                    key={group.key}
                    onClick={() => setActiveGroup(group.key)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      background: isActive ? 'var(--accent)' : 'transparent',
                      border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--accent-soft)';
                        e.currentTarget.style.color = 'var(--accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {t(group.zh, group.en)}
                  </button>
                );
              })}
            </div>
          </AnimateIn>
        </aside>

        {/* ===== Main Content Area ===== */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Category Heading */}
          <AnimateIn key={currentGroup.key} y={10}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--accent)' }}>•</span>
              {t(currentGroup.zh, currentGroup.en)}
            </h2>
          </AnimateIn>

          {/* Resource Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentGroup.items.map((item, i) => (
              <AnimateIn key={item.id} delay={0.05 * i} y={10}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="glass"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: `url(${item.image}) center/cover`,
                      border: '1px solid var(--glass-border)',
                    }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {t(item.titleZh, item.titleEn)}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {t(item.descZh, item.descEn)}
                    </div>
                    {item.source && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {t('来源于：', 'Source: ')}{item.source}
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass"
                      style={{
                        padding: '8px 18px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--accent)',
                        background: 'var(--accent-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
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
                      <Download size={14} />
                      {t('下载', 'Download')}
                    </motion.button>
                  </a>
                </motion.div>
              </AnimateIn>
            ))}
            {currentGroup.items.length === 0 && (
              <div className="glass" style={{ padding: 32, borderRadius: 14, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                {t('该分类下暂无资源', 'No resources in this category yet')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

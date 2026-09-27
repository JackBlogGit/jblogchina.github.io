import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Frame, Maximize2 } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import CameraScene from '../components/CameraScene';
import { useApp } from '../context/AppContext';
import { useGalleryArts, useGalleryCategories } from '../data/gallery';
import type { Art } from '../data/gallery';

const UNCATEGORIZED = '__none__';

/** 简易响应式断点 */
function useCols() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1400));
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  if (w < 900) return { cols: 2, heroStacked: true };
  if (w < 1280) return { cols: 3, heroStacked: false };
  return { cols: 4, heroStacked: false };
}

function ArtCaption({ art, idx }: { art: Art; idx: number }) {
  const { t } = useApp();
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '10px 2px 0' }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1 }}>
        {String(idx + 1).padStart(2, '0')}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {t(art.titleZh, art.titleEn)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {art.year} · {t(art.mediumZh, art.mediumEn)}
        </div>
      </div>
    </div>
  );
}

export default function Exhibition() {
  const { t } = useApp();
  const ARTS = useGalleryArts();
  const CATS = useGalleryCategories();
  const [activeCat, setActiveCat] = useState<string>('all');
  const [active, setActive] = useState<Art | null>(null);
  const { cols, heroStacked } = useCols();

  const hasUncategorized = ARTS.some((a) => !a.category);

  const visible = useMemo(() => {
    if (activeCat === 'all') return ARTS;
    if (activeCat === UNCATEGORIZED) return ARTS.filter((a) => !a.category);
    return ARTS.filter((a) => a.category === activeCat);
  }, [ARTS, activeCat]);

  const hero = visible[0];
  const rest = visible.slice(1);

  const idx = active ? visible.findIndex((a) => a.id === active.id) : -1;
  const prev = () => visible.length && setActive(visible[(idx - 1 + visible.length) % visible.length]);
  const next = () => visible.length && setActive(visible[(idx + 1) % visible.length]);

  // 杂志式跨度模式：每 5 个里第 1 个跨 2 列（feature），其余跨 1 列
  const spanFor = (i: number) => (cols >= 3 && i % 5 === 0 ? 2 : 1);
  const catLabel = (id: string) => {
    const c = CATS.find((k) => k.id === id);
    return c ? t(c.zh, c.en) : t('未分类', 'Uncategorized');
  };

  const tabs: { key: string; label: string }[] = [
    { key: 'all', label: t('全部', 'All') },
    ...CATS.map((c) => ({ key: c.id, label: t(c.zh, c.en) })),
    ...(hasUncategorized ? [{ key: UNCATEGORIZED, label: t('未分类', 'Uncategorized') }] : []),
  ];

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(14,165,233,0.15) 100%)',
          zIndex: 0,
        }}
      />
      <CameraScene opacity={0.35} zIndex={2} />

      <div style={{ position: 'relative', zIndex: 1, padding: '12px 24px 40px 80px', height: '100%', overflowY: 'auto' }}>
        <AnimateIn>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Frame size={26} style={{ color: 'var(--accent)' }} />
            {t('画展', 'Exhibition')}
          </h1>
        </AnimateIn>
        <AnimateIn delay={0.08}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
            {t(
              '个人视觉作品——按分类浏览,点击任意作品查看详情。',
              'Personal visual works — browse by category, click any piece to view.',
            )}
          </p>
        </AnimateIn>

        {/* 分类标签栏 */}
        <AnimateIn delay={0.12} y={16} duration={0.5}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {tabs.map((tab) => {
              const on = activeCat === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCat(tab.key)}
                  className="glass"
                  style={{
                    position: 'relative',
                    padding: '7px 16px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: on ? 700 : 500,
                    color: on ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  {on && (
                    <motion.span
                      layoutId="exh-tab-bg"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 999,
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span style={{ position: 'relative' }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </AnimateIn>

        {visible.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0' }}>{t('该分类下暂无作品。', 'No pieces in this category yet.')}</p>
        )}

        {/* 杂志式 hero 特写 */}
        {hero && (
          <AnimateIn delay={0.05} y={40} duration={0.7}>
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => setActive(hero)}
              className="glass"
              style={{
                display: 'flex',
                flexDirection: heroStacked ? 'column' : 'row',
                borderRadius: 20,
                overflow: 'hidden',
                cursor: 'pointer',
                marginBottom: 28,
              }}
            >
              <div style={{ flex: heroStacked ? 'none' : '1.7 1 0%', minHeight: heroStacked ? 260 : 380, position: 'relative', overflow: 'hidden' }}>
                <motion.img
                  src={hero.url}
                  alt={t(hero.titleZh, hero.titleEn)}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', top: 14, left: 16, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#fff', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 999 }}>
                  {catLabel(hero.category || UNCATEGORIZED)}
                </div>
              </div>
              <div style={{ flex: heroStacked ? 'none' : '1 1 0%', padding: '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)' }}>
                  {t('本期聚焦', 'Featured')}
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}>{t(hero.titleZh, hero.titleEn)}</h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t(hero.artistZh, hero.artistEn)} · {hero.year} · {t(hero.mediumZh, hero.mediumEn)}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{t(hero.descZh, hero.descEn)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginTop: 6 }}>
                  <Maximize2 size={14} />
                  {t('查看大图', 'View full size')}
                </div>
              </div>
            </motion.div>
          </AnimateIn>
        )}

        {/* 不规则杂志网格 */}
        {rest.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 18,
              gridAutoFlow: 'dense',
            }}
          >
            {rest.map((a, i) => {
              const span = spanFor(i);
              const aspect = span === 2 ? '16 / 10' : a.w >= 1 ? '4 / 5' : '3 / 2';
              return (
                <AnimateIn key={a.id} delay={0.04 * (i % 6)} y={26} duration={0.6} style={{ gridColumn: `span ${span}` }}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    onClick={() => setActive(a)}
                    style={{ cursor: 'pointer', position: 'relative', borderRadius: 16, overflow: 'hidden' }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                      <img
                        src={a.url}
                        alt={t(a.titleZh, a.titleEn)}
                        loading="lazy"
                        style={{ width: '100%', aspectRatio: aspect, objectFit: 'cover', display: 'block', borderRadius: 16 }}
                      />
                    </motion.div>
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 12,
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#fff',
                        background: 'rgba(0,0,0,0.35)',
                        backdropFilter: 'blur(6px)',
                        padding: '3px 8px',
                        borderRadius: 999,
                      }}
                    >
                      {catLabel(a.category || UNCATEGORIZED)}
                    </div>
                    <ArtCaption art={a} idx={i + 1} />
                  </motion.div>
                </AnimateIn>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass glass-strong"
              style={{
                maxWidth: 'min(90vw, 700px)',
                maxHeight: '90vh',
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <img src={active.url} alt={t(active.titleZh, active.titleEn)} style={{ maxWidth: '100%', maxHeight: '60vh', display: 'block', objectFit: 'contain' }} />

                <button onClick={() => setActive(null)} style={{ position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: 10, background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: 12, background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: 12, background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={20} />
                </button>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{t(active.titleZh, active.titleEn)}</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {idx + 1} / {visible.length}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>{t(active.artistZh, active.artistEn)}</span>
                  <span>·</span>
                  <span>{active.year}</span>
                  <span>·</span>
                  <span>{t(active.mediumZh, active.mediumEn)}</span>
                  <span>·</span>
                  <span>{catLabel(active.category || UNCATEGORIZED)}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 4 }}>
                  {t(active.descZh, active.descEn)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

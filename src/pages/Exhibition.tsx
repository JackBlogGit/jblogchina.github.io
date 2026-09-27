import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Frame, Maximize2 } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import CameraScene from '../components/CameraScene';
import { useApp } from '../context/AppContext';
import { useGalleryArts, useGalleryCategories } from '../data/gallery';
import type { Art } from '../data/gallery';

const UNCATEGORIZED = '__none__';

/* 滑动切换阈值:拖够 72px 才翻页,或者甩动速度够快(且至少拖动 16px) */
const SWIPE_MIN_DIST = 72;
const SWIPE_MIN_VELOCITY = 550;

/** lightbox 左右滑动 -> 上/下一张 */
function swipeHandler(prev: () => void, next: () => void) {
  return (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    // 纵向意图(滚页面)不当成翻页
    if (Math.abs(offset.x) <= Math.abs(offset.y)) return;
    const far = Math.abs(offset.x) >= SWIPE_MIN_DIST;
    const flick = Math.abs(velocity.x) >= SWIPE_MIN_VELOCITY && Math.abs(offset.x) >= 16;
    if (!far && !flick) return;
    if (offset.x < 0) next();
    else prev();
  };
}

/** 简易响应式断点:宽度量化到 16px,避免每个像素都 re-render */
function useCols() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1400));
  useEffect(() => {
    const h = () => {
      const nextW = window.innerWidth;
      setW((cur) => (Math.floor(cur / 16) === Math.floor(nextW / 16) ? cur : nextW));
    };
    h();
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);
  // phone / tablet 的判定跟 useDevice + FloatingToolbar 的 ≤767 / ≤1199 对齐
  const phone = w < 768;
  if (w < 640) return { cols: 1, heroStacked: true, phone, tablet: !phone && w < 1200 };
  if (w < 900) return { cols: 2, heroStacked: true, phone, tablet: !phone && w < 1200 };
  if (w < 1280) return { cols: 3, heroStacked: false, phone, tablet: !phone && w < 1200 };
  return { cols: 4, heroStacked: false, phone, tablet: !phone && w < 1200 };
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
  const { cols, heroStacked, phone, tablet } = useCols();

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
  const canSwipe = visible.length > 1;

  // 键盘导航:只在 lightbox 打开时挂监听,Escape / ← →
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, idx, visible]);

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

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: phone ? '12px 14px 32px' : '12px 24px 40px 80px',
          height: '100%',
          overflowY: 'auto',
        }}
      >
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
          <div
            className={phone ? 'scroll-x scroll-x--bare' : undefined}
            style={{
              display: 'flex',
              gap: phone ? 6 : 8,
              flexWrap: phone ? 'nowrap' : 'wrap',
              marginBottom: phone ? 18 : 28,
              paddingBottom: phone ? 6 : 0,
            }}
          >
            {tabs.map((tab) => {
              const on = activeCat === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCat(tab.key)}
                  className={`glass${phone ? ' tap' : ''}`}
                  style={{
                    position: 'relative',
                    padding: phone ? '10px 14px' : '7px 16px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: on ? 700 : 500,
                    color: on ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
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
                marginBottom: phone ? 18 : 28,
              }}
            >
              <div style={{ flex: heroStacked ? 'none' : '1.7 1 0%', minHeight: heroStacked ? (phone ? 200 : 260) : 380, position: 'relative', overflow: 'hidden' }}>
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
              <div style={{ flex: heroStacked ? 'none' : '1 1 0%', padding: phone ? '18px 16px 20px' : '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: phone ? 9 : 12, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)' }}>
                  {t('本期聚焦', 'Featured')}
                </div>
                <h2 style={{ fontSize: phone ? 20 : 26, fontWeight: 800, lineHeight: 1.25 }}>{t(hero.titleZh, hero.titleEn)}</h2>
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
              gap: phone ? 12 : 18,
              gridAutoFlow: 'dense',
            }}
          >
            {rest.map((a, i) => {
              const span = spanFor(i);
              const aspect = span === 2 ? '16 / 10' : a.w >= 1 ? (phone ? '3 / 2' : '4 / 5') : '3 / 2';
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
              padding: phone ? '10px 10px calc(10px + var(--safe-bottom))' : tablet ? 24 : 40,
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
                width: phone ? '100%' : undefined,
                maxWidth: phone ? '100%' : tablet ? 'min(92vw, 700px)' : 'min(90vw, 700px)',
                maxHeight: phone ? 'calc(100dvh - 24px)' : '90vh',
                borderRadius: phone ? 16 : 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                {/* 图片层可左右拖动;dragSnapToOrigin 保证松手/换图后偏移自动复位 */}
                <motion.div
                  drag={canSwipe ? 'x' : false}
                  dragDirectionLock
                  dragConstraints={{ left: -96, right: 96 }}
                  dragElastic={0.22}
                  dragMomentum={false}
                  dragSnapToOrigin
                  onDragEnd={swipeHandler(prev, next)}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: canSwipe ? 'grab' : 'default',
                  }}
                >
                  <img
                    src={active.url}
                    alt={t(active.titleZh, active.titleEn)}
                    draggable={false}
                    style={{ maxWidth: '100%', maxHeight: phone ? '46dvh' : tablet ? '56dvh' : '60vh', display: 'block', objectFit: 'contain' }}
                  />
                </motion.div>

                <button
                  aria-label={t('关闭', 'Close')}
                  onClick={() => setActive(null)}
                  style={{ position: 'absolute', top: phone ? 8 : 12, right: phone ? 8 : 12, zIndex: 2, width: phone ? 44 : 38, height: phone ? 44 : 38, borderRadius: 10, background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
                <button
                  aria-label={t('上一张', 'Previous')}
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  style={{ position: 'absolute', top: '50%', left: phone ? 8 : 12, transform: 'translateY(-50%)', zIndex: 2, width: phone ? 46 : 42, height: phone ? 46 : 42, borderRadius: 12, background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  aria-label={t('下一张', 'Next')}
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  style={{ position: 'absolute', top: '50%', right: phone ? 8 : 12, transform: 'translateY(-50%)', zIndex: 2, width: phone ? 46 : 42, height: phone ? 46 : 42, borderRadius: 12, background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div
                style={{
                  flexShrink: phone || tablet ? 0 : undefined,
                  padding: phone ? '14px 16px 16px' : '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: phone ? '46dvh' : undefined,
                  overflowY: phone ? 'auto' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: phone || tablet ? 10 : undefined }}>
                  <h3 style={{ fontSize: phone ? 16 : 18, fontWeight: 800 }}>{t(active.titleZh, active.titleEn)}</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: phone || tablet ? 0 : undefined }}>
                    {idx + 1} / {visible.length}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: phone ? 8 : 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
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
                {canSwipe && (phone || tablet) && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {t('← 左右滑动切换作品 →', '← Swipe to browse works →')}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

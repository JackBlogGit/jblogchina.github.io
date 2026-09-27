import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { useDevice } from '../hooks/useDevice';
import { useArticles } from '../data/articles';

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

/**
 * 触屏上必须完全不写内联 opacity：内联样式优先级高于 index.css 里
 * `@media (hover: none) { .gallery-caption { opacity: 1 } }`，写了就会把标题永久按死在隐藏态。
 */
function useCanHover() {
  const [canHover, setCanHover] = useState(
    () => (typeof window === 'undefined' ? true : window.matchMedia('(hover: hover)').matches),
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    const h = () => setCanHover(mq.matches);
    h();
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return canHover;
}

export default function Gallery() {
  const { t } = useApp();
  const { isMobile, isTablet } = useDevice();
  const canHover = useCanHover();
  const articles = useArticles();
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // 收集所有文章的内嵌图片 + 封面作为图集
  const ALL_IMAGES = articles.flatMap((a) => {
    const list: { url: string; captionZh: string; captionEn: string; title: string }[] = [];
    list.push({ url: a.cover, captionZh: a.titleZh, captionEn: a.titleEn, title: a.titleZh });
    for (const b of a.blocks) {
      if (b.type === 'img' && b.img) {
        list.push({
          url: b.img,
          captionZh: b.captionZh ?? '',
          captionEn: b.captionEn ?? '',
          title: a.titleZh,
        });
      }
    }
    return list;
  });

  const idx = active ?? -1;
  const prev = () => setActive((idx - 1 + ALL_IMAGES.length) % ALL_IMAGES.length);
  const next = () => setActive((idx + 1) % ALL_IMAGES.length);
  const canSwipe = ALL_IMAGES.length > 1;

  // 键盘导航:只在 lightbox 打开时挂监听,Escape / ← →
  useEffect(() => {
    if (active == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, idx, ALL_IMAGES.length]);

  return (
    <div style={{ padding: isMobile ? '12px 14px 32px' : '12px 24px 40px 80px', height: '100%', overflowY: 'auto' }}>
      <AnimateIn>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Camera size={26} style={{ color: 'var(--accent)' }} />
          {t('图集', 'Gallery')}
        </h1>
      </AnimateIn>
      <AnimateIn delay={0.08}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
          {t('文章中的精选图片，点击查看大图。', 'Selected images from articles. Click to view full size.')}
        </p>
      </AnimateIn>

      {/* masonry-ish grid */}
      <div
        style={{
          columnCount: isMobile ? 1 : isTablet ? 2 : 3,
          columnGap: isMobile ? 12 : 16,
        }}
      >
        {ALL_IMAGES.map((im, i) => (
          <AnimateIn key={i} delay={0.03 * (i % 8)} y={20} duration={0.5}>
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              onClick={() => setActive(i)}
              onMouseEnter={canHover ? () => setHovered(i) : undefined}
              onMouseLeave={canHover ? () => setHovered((cur) => (cur === i ? null : cur)) : undefined}
              className="glass"
              style={{
                marginBottom: isMobile ? 12 : 16,
                breakInside: 'avoid',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <img
                src={im.url}
                alt={t(im.captionZh, im.captionEn)}
                style={{ width: '100%', display: 'block' }}
                loading="lazy"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4))',
                  /* 触屏:完全不写内联 opacity,交给 index.css 的 (hover:none) 规则 */
                  opacity: canHover ? (hovered === i ? 1 : 0) : undefined,
                  transition: 'opacity 0.3s',
                }}
                className="gallery-overlay"
              />
              {im.captionZh && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 12,
                    right: 12,
                    color: '#fff',
                    fontSize: isMobile ? 13 : 12,
                    fontWeight: 600,
                    lineHeight: 1.45,
                    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    opacity: canHover ? (hovered === i ? 1 : 0) : undefined,
                    transition: 'opacity 0.3s',
                  }}
                  className="gallery-caption"
                >
                  {t(im.captionZh, im.captionEn)}
                </div>
              )}
            </motion.div>
          </AnimateIn>
        ))}
      </div>

      {/* Lightbox — portal 到 body，避开 PageTransition 的 transform 包含块 */}
      {createPortal(
        <AnimatePresence>
        {active != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '10px 10px calc(10px + var(--safe-bottom))' : isTablet ? 24 : 40,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass"
              style={{
                width: isMobile ? '100%' : undefined,
                maxWidth: isMobile ? '100%' : isTablet ? 'min(92vw, 900px)' : '80vw',
                maxHeight: isMobile ? 'calc(100dvh - 24px)' : '80vh',
                borderRadius: isMobile ? 16 : 20,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 图片层可左右拖动;dragSnapToOrigin 保证松手/换图后偏移复位 */}
              <motion.div
                drag={canSwipe ? 'x' : false}
                dragDirectionLock
                dragConstraints={{ left: -96, right: 96 }}
                dragElastic={0.22}
                dragMomentum={false}
                dragSnapToOrigin
                onDragEnd={swipeHandler(prev, next)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '100%',
                  cursor: canSwipe ? 'grab' : 'default',
                }}
              >
                <img
                  src={ALL_IMAGES[idx].url}
                  alt={t(ALL_IMAGES[idx].captionZh, ALL_IMAGES[idx].captionEn)}
                  draggable={false}
                  style={{
                    maxWidth: isMobile ? '100%' : '80vw',
                    maxHeight: isMobile ? '58dvh' : isTablet ? '62dvh' : '70vh',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                />
              </motion.div>

              {(ALL_IMAGES[idx].captionZh || isMobile) && (
                <div
                  style={{
                    padding: isMobile ? '12px 16px 14px' : '14px 20px',
                    fontSize: 13,
                    lineHeight: isMobile ? 1.55 : undefined,
                    color: 'var(--text-secondary)',
                    flexShrink: isMobile || isTablet ? 0 : undefined,
                    maxHeight: isMobile ? '30dvh' : undefined,
                    overflowY: isMobile ? 'auto' : undefined,
                  }}
                >
                  {ALL_IMAGES[idx].captionZh ? t(ALL_IMAGES[idx].captionZh, ALL_IMAGES[idx].captionEn) : null}
                  {(isMobile || isTablet) && (
                    <span style={{ marginLeft: 8, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {idx + 1} / {ALL_IMAGES.length}
                    </span>
                  )}
                  {canSwipe && (isMobile || isTablet) && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      {t('← 左右滑动切换图片 →', '← Swipe to browse images →')}
                    </div>
                  )}
                </div>
              )}

              <button
                aria-label={t('关闭', 'Close')}
                onClick={() => setActive(null)}
                style={{
                  position: 'absolute',
                  top: isMobile ? 8 : 12,
                  right: isMobile ? 8 : 12,
                  zIndex: 2,
                  width: isMobile ? 44 : 38,
                  height: isMobile ? 44 : 38,
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
              <button
                aria-label={t('上一张', 'Previous')}
                onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: isMobile ? 8 : 12,
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  width: isMobile ? 46 : 42,
                  height: isMobile ? 46 : 42,
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                aria-label={t('下一张', 'Next')}
                onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: isMobile ? 8 : 12,
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  width: isMobile ? 46 : 42,
                  height: isMobile ? 46 : 42,
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

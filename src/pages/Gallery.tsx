import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { useArticles } from '../data/articles';

export default function Gallery() {
  const { t } = useApp();
  const articles = useArticles();
  const [active, setActive] = useState<number | null>(null);

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

  return (
    <div style={{ padding: '12px 24px 40px 80px', height: '100%', overflowY: 'auto' }}>
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
          columnCount: 3,
          columnGap: 16,
        }}
      >
        {ALL_IMAGES.map((im, i) => (
          <AnimateIn key={i} delay={0.03 * i} y={20} duration={0.5}>
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              onClick={() => setActive(i)}
              className="glass"
              style={{
                marginBottom: 16,
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
                  opacity: 0,
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
                    fontSize: 12,
                    fontWeight: 600,
                    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    opacity: 0,
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

      {/* Lightbox */}
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
              padding: 40,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass"
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                borderRadius: 20,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <img
                src={ALL_IMAGES[idx].url}
                alt={t(ALL_IMAGES[idx].captionZh, ALL_IMAGES[idx].captionEn)}
                style={{ maxWidth: '80vw', maxHeight: '70vh', display: 'block', objectFit: 'contain' }}
              />
              {ALL_IMAGES[idx].captionZh && (
                <div style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {t(ALL_IMAGES[idx].captionZh, ALL_IMAGES[idx].captionEn)}
                </div>
              )}

              <button
                onClick={() => setActive(null)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 12,
                  transform: 'translateY(-50%)',
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 12,
                  transform: 'translateY(-50%)',
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

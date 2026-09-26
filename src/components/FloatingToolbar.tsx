import { motion, AnimatePresence } from 'framer-motion';
import { Music, RotateCcw, User, ArrowUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSiteMedia } from '../data/siteMedia';
import { asset } from '../utils/asset';

export default function FloatingToolbar() {
  const { t } = useApp();
  const navigate = useNavigate();
  const media = useSiteMedia();
  const musicSrc = media.musicUrl || asset('/music/memory-reboot.mp3');
  const [musicOn, setMusicOn] = useState(true);
  const [showTop, setShowTop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio(musicSrc);
      audio.loop = true;
      audio.volume = 0.4;
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  // 进站自动播放；被浏览器拦截时在首次交互重试
  useEffect(() => {
    const audio = ensureAudio();
    const play = () => {
      audio
        .play()
        .then(() => cleanup())
        .catch(() => {});
      return true;
    };
    const cleanup = () => {
      window.removeEventListener('pointerdown', play);
      window.removeEventListener('keydown', play);
    };
    play();
    window.addEventListener('pointerdown', play, { once: true });
    window.addEventListener('keydown', play, { once: true });
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 设置中更换音乐源后即时切换（保持播放状态）
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextUrl = new URL(musicSrc, window.location.href).href;
    if (audio.src === nextUrl) return;
    const wasPlaying = !audio.paused;
    audio.src = musicSrc;
    if (wasPlaying) audio.play().catch(() => {});
  }, [musicSrc]);

  const toggleMusic = () => {
    const audio = ensureAudio();
    if (audio.paused) {
      audio.play();
      setMusicOn(true);
    } else {
      audio.pause();
      setMusicOn(false);
    }
  };

  const items = [
    {
      icon: <Music size={18} />,
      label: t('音乐', 'Music'),
      active: musicOn,
      onClick: toggleMusic,
      spin: true,
    },
    {
      icon: <RotateCcw size={18} />,
      label: t('刷新', 'Refresh'),
      onClick: () => window.location.reload(),
    },
    {
      icon: <User size={18} />,
      label: t('关于', 'About'),
      onClick: () => navigate('/about'),
    },
  ];

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {items.map((it, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
          whileHover={{ x: 4, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={it.onClick}
          className="glass"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: it.active ? 'var(--accent)' : 'var(--text-secondary)',
          }}
          title={it.label}
        >
          {it.spin && it.active ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              {it.icon}
            </motion.div>
          ) : (
            it.icon
          )}
        </motion.button>
      ))}

      {/* back-to-top — fades in after scroll */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="glass"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}
            title={t('回到顶部', 'Back to top')}
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

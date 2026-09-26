import { useApp } from '../context/AppContext';
import { useSiteMedia } from '../data/siteMedia';
import { asset } from '../utils/asset';

export default function GlassBackground() {
  const { theme } = useApp();
  const media = useSiteMedia();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {media.bgType === 'image' && media.bgUrl ? (
        <img
          src={media.bgUrl}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          src={media.bgType === 'video' && media.bgUrl ? media.bgUrl : asset('/videos/beach.mp4')}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* overlay to keep glass panels readable */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            theme === 'light'
              ? 'rgba(255, 255, 255, 0.25)'
              : 'rgba(0, 0, 0, 0.35)',
          transition: 'background 0.8s ease',
        }}
      />

      {/* grain layer for liquid feel */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            theme === 'light'
              ? 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)'
              : 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: theme === 'light' ? 'soft-light' : 'overlay',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

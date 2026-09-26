import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, User, Send, MessageSquare, Star, AlertTriangle } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { useMessages, saveMessage } from '../data/messages';
import { inspectMessage, type FilterCategory } from '../utils/contentFilter';

const CATEGORY_LABELS: Record<FilterCategory, [string, string]> = {
  profanity: ['不文明用语', 'offensive language'],
  ad: ['广告推广', 'advertising/spam'],
  porn: ['色情内容', 'sexual content'],
  violence: ['暴力内容', 'violent content'],
};

export default function Message() {
  const { t } = useApp();
  const list = useMessages();
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');
  const [popup, setPopup] = useState('');

  useEffect(() => {
    if (!popup) return;
    const timer = setTimeout(() => setPopup(''), 4000);
    return () => clearTimeout(timer);
  }, [popup]);

  const submit = () => {
    if (!name.trim() || !content.trim()) return;
    const hits = inspectMessage(name, content);
    if (hits.length) {
      const msg = t(
        `留言包含${hits.map((h) => CATEGORY_LABELS[h][0]).join('、')}，无法发布，请修改后再试`,
        `Message blocked: it contains ${hits.map((h) => CATEGORY_LABELS[h][1]).join(', ')}. Please edit before posting.`,
      );
      setError(msg);
      setPopup(msg);
      return;
    }
    setError('');
    saveMessage({
      id: `user-${Date.now()}`,
      name: name.trim(),
      mail: mail.trim(),
      content: content.trim(),
      rating,
      at: new Date().toLocaleString(),
    });
    setName('');
    setMail('');
    setContent('');
    setRating(5);
  };

  return (
    <div style={{ padding: '12px 24px 40px 80px', height: '100%', overflowY: 'auto' }}>
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={() => setPopup('')}
            className="glass"
            style={{
              position: 'fixed',
              top: 88,
              left: '50%',
              x: '-50%',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 16,
              maxWidth: 520,
              border: '1px solid rgba(248,113,113,0.45)',
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>{popup}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimateIn>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={26} style={{ color: 'var(--accent)' }} />
          {t('读者留言', 'Reader Messages')}
        </h1>
      </AnimateIn>

      {/* Form */}
      <AnimateIn y={20} delay={0.1}>
        <div className="glass" style={{ padding: 24, borderRadius: 20, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="glass" style={{ padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                placeholder={t('昵称', 'Nickname')}
                style={{ flex: 1, background: 'transparent', fontSize: 14, color: 'var(--text-primary)' }}
              />
            </div>
            <div className="glass" style={{ padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder={t('邮箱（可选）', 'Email (optional)')}
                style={{ flex: 1, background: 'transparent', fontSize: 14, color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('评分', 'Rating')}</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(n)}
                style={{ color: n <= rating ? '#fbbf24' : 'var(--text-muted)' }}
              >
                <Star size={18} fill={n <= rating ? '#fbbf24' : 'none'} />
              </motion.button>
            ))}
          </div>

          <div className="glass" style={{ padding: '12px 14px', borderRadius: 12, marginBottom: 14 }}>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); if (error) setError(''); }}
              placeholder={t('给博客留句话…', 'Leave a message for the blog…')}
              rows={4}
              style={{
                width: '100%',
                background: 'transparent',
                resize: 'none',
                fontSize: 14,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Send size={14} />
              {t('发布留言', 'Post')}
            </motion.button>
            {error && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: 13, color: '#f87171', maxWidth: 420 }}
              >
                {error}
              </motion.span>
            )}
          </div>
        </div>
      </AnimateIn>

      {/* List */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <MessageSquare size={16} />
        {t('全部留言', 'All messages')}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.map((m, i) => (
          <AnimateIn key={i} y={14} delay={0.04 * i}>
            <div className="glass" style={{ padding: 18, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                  }}
                >
                  {m.name.slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.at}</div>
                </div>
                <div style={{ display: 'flex', gap: 1 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={13}
                      style={{ color: n <= m.rating ? '#fbbf24' : 'var(--text-muted)' }}
                      fill={n <= m.rating ? '#fbbf24' : 'none'}
                    />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{m.content}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </div>
  );
}

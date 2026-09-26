import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Star, MessageSquare } from 'lucide-react';
import { useMessages, removeMessage, saveMessage } from '../../data/messages';
import { useApp } from '../../context/AppContext';

export default function MessageManager() {
  const { t } = useApp();
  const messages = useMessages();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm(t('确定删除这条留言？', 'Delete this message?'))) {
      removeMessage(id);
    }
  };

  const sendReply = (originalId: string) => {
    const original = messages.find((m) => m.id === originalId);
    if (!original || !replyText.trim()) return;
    saveMessage({
      id: `admin-${Date.now()}`,
      name: t('博主', 'Admin'),
      mail: '',
      content: replyText.trim(),
      rating: 5,
      at: new Date().toLocaleString(),
    });
    setReplyTo(null);
    setReplyText('');
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquare size={22} style={{ color: 'var(--accent)' }} />
        {t('留言管理', 'Messages')}
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
          {t(`共 ${messages.length} 条`, `${messages.length} total`)}
        </span>
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg, #fff)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
            {t('暂无留言', 'No messages yet')}
          </div>
        )}
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: m.name === t('博主', 'Admin') ? 'var(--accent)' : 'var(--accent-soft)',
                  color: m.name === t('博主', 'Admin') ? '#fff' : 'var(--accent)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                }}
              >
                {m.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {m.at}
                  {m.mail && ` · ${m.mail}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
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
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>{m.content}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setReplyTo(replyTo === m.id ? null : m.id); setReplyText(''); }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--hover-bg, #f3f4f6)',
                  borderRadius: 6,
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {t('回复', 'Reply')}
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                style={{
                  padding: '6px 12px',
                  background: '#fee2e2',
                  borderRadius: 6,
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                }}
              >
                <Trash2 size={14} />
                {t('删除', 'Delete')}
              </button>
            </div>
            {replyTo === m.id && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t('以博主身份回复…', 'Reply as admin…')}
                  rows={2}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: '10px 12px',
                    background: 'var(--hover-bg, #f9fafb)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    fontSize: 14,
                    resize: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={() => sendReply(m.id)}
                  disabled={!replyText.trim()}
                  style={{
                    alignSelf: 'flex-end',
                    padding: '8px 16px',
                    background: replyText.trim() ? 'var(--accent)' : 'var(--border-subtle)',
                    borderRadius: 8,
                    border: 'none',
                    color: '#fff',
                    cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {t('发送回复', 'Send')}
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

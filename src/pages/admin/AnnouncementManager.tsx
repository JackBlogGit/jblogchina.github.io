import { useState } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAnnouncements, saveAnnouncement, removeAnnouncement, newAnnouncementId } from '../../data/announcements';
import { useApp } from '../../context/AppContext';
import type { Announcement } from '../../data/announcements';

interface Draft {
  id?: number;
  textZh: string;
  textEn: string;
  tag: string;
  tagEn: string;
  date: string;
  kind: 'news' | 'notice';
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const emptyDraft = (): Draft => ({ textZh: '', textEn: '', tag: '更新', tagEn: 'Update', date: today(), kind: 'news' });

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  background: 'var(--hover-bg, #f9fafb)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  color: 'var(--text-primary)',
  boxSizing: 'border-box',
  width: '100%',
};

export default function AnnouncementManager() {
  const { t } = useApp();
  const list = useAnnouncements();
  const [draft, setDraft] = useState<Draft | null>(null);

  const startEdit = (a: Announcement) => {
    setDraft({ id: a.id, textZh: a.textZh, textEn: a.textEn, tag: a.tag, tagEn: a.tagEn ?? '', date: a.date, kind: a.kind ?? 'news' });
  };

  const publish = () => {
    if (!draft || !draft.textZh.trim()) return;
    saveAnnouncement({
      id: draft.id ?? newAnnouncementId(),
      textZh: draft.textZh.trim(),
      textEn: draft.textEn.trim() || draft.textZh.trim(),
      date: draft.date || today(),
      tag: draft.tag.trim() || '更新',
      tagEn: draft.tagEn.trim() || undefined,
      kind: draft.kind,
    });
    setDraft(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t('确定删除这条？', 'Delete this item?'))) removeAnnouncement(id);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Megaphone size={22} style={{ color: 'var(--accent)' }} />
          {t('公告 / 须知管理', 'Announcements & Notices')}
        </h1>
        {!draft && (
          <button
            onClick={() => setDraft(emptyDraft())}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            {t('发布新条目', 'New Post')}
          </button>
        )}
      </div>

      {/* Editor card */}
      {draft && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--accent)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              {draft.id ? t('编辑条目', 'Edit Item') : t('发布条目', 'Publish Item')}
            </h2>
            <button onClick={() => setDraft(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* kind + tag + date row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as 'news' | 'notice' })} style={inputStyle}>
                <option value="news">{t('类型：公告（公告栏展示）', 'Type: Announcement')}</option>
                <option value="notice">{t('类型：须知（网站需知页展示）', 'Type: Site Notice')}</option>
              </select>
              <input value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} placeholder={t('标签（如：更新）', 'Tag (e.g. 更新)')} style={inputStyle} />
              <input value={draft.tagEn} onChange={(e) => setDraft({ ...draft, tagEn: e.target.value })} placeholder={t('英文标签（可选）', 'English tag (optional)')} style={inputStyle} />
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} style={inputStyle} />
            </div>

            <textarea value={draft.textZh} onChange={(e) => setDraft({ ...draft, textZh: e.target.value })} placeholder={t('中文内容 *', 'Chinese text *')} rows={3} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }} />
            <textarea value={draft.textEn} onChange={(e) => setDraft({ ...draft, textEn: e.target.value })} placeholder={t('英文内容（留空则复用中文）', 'English text (falls back to Chinese)')} rows={2} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }} />

            <div>
              <button
                onClick={publish}
                disabled={!draft.textZh.trim()}
                style={{
                  padding: '10px 20px',
                  background: draft.textZh.trim() ? 'var(--accent)' : 'var(--border-subtle)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: draft.textZh.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {draft.id ? t('保存修改', 'Save') : t('立即发布', 'Publish Now')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
        {list.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>{t('暂无公告', 'Nothing yet')}</div>
        ) : (
          list.map((a, i) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                borderBottom: i < list.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: a.kind === 'notice' ? 'rgba(245,158,11,0.16)' : 'var(--accent-soft)',
                  color: a.kind === 'notice' ? '#d97706' : 'var(--accent)',
                }}
              >
                {a.kind === 'notice' ? t('须知', 'Notice') : t('公告', 'News')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{a.date}</span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{a.textZh}</div>
                {a.textEn && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.textEn}</div>}
              </div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'var(--hover-bg, #f3f4f6)', color: 'var(--text-secondary)' }}>{a.tag}</span>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button
                  onClick={() => startEdit(a)}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--hover-bg, #f3f4f6)',
                    borderRadius: 6,
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                  }}
                >
                  <Edit2 size={14} />
                  {t('编辑', 'Edit')}
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  style={{
                    padding: '8px 12px',
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

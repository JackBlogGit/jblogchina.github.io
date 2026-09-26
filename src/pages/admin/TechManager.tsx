import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, FolderPlus, X, Lock } from 'lucide-react';
import { useTechGroups, addTechGroup, removeTechGroup, TECH_GROUPS } from '../../data/techStack';
import { useApp } from '../../context/AppContext';

const inputStyle: React.CSSProperties = {
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

export default function TechManager() {
  const { t } = useApp();
  const groups = useTechGroups();
  const [showForm, setShowForm] = useState(false);
  const [zh, setZh] = useState('');
  const [en, setEn] = useState('');
  const [err, setErr] = useState('');

  const handleAdd = () => {
    if (!zh.trim()) {
      setErr(t('分类名称不能为空', 'Name is required'));
      return;
    }
    if (addTechGroup(zh, en) === null) {
      setErr(t('该分类已存在', 'Category already exists'));
      return;
    }
    setZh('');
    setEn('');
    setErr('');
    setShowForm(false);
  };

  const handleRemove = (key: string, name: string) => {
    if (window.confirm(t(`确定删除分类「${name}」？`, `Delete category "${name}"?`))) removeTechGroup(key);
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={22} style={{ color: 'var(--accent)' }} />
          {t('技栈管理', 'Tech Stack')}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
            {t(`共 ${groups.length} 个分类`, `${groups.length} categories`)}
          </span>
        </h1>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setErr(''); }}
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
            <FolderPlus size={16} />
            {t('添加分类', 'Add Category')}
          </button>
        )}
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--accent)', borderRadius: 12, padding: 16, marginBottom: 20 }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={zh}
              onChange={(e) => { setZh(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={`${t('分类名称（中文）', 'Category ZH')} *`}
              style={{ ...inputStyle, maxWidth: 220 }}
              autoFocus
            />
            <input
              value={en}
              onChange={(e) => { setEn(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={t('分类名称（英文）', 'Category EN')}
              style={{ ...inputStyle, maxWidth: 220 }}
            />
            <button
              onClick={handleAdd}
              style={{ padding: '9px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              {t('确定', 'Add')}
            </button>
            <button
              onClick={() => { setShowForm(false); setZh(''); setEn(''); setErr(''); }}
              style={{ padding: '9px 16px', background: 'var(--card-bg, #fff)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
            >
              {t('取消', 'Cancel')}
            </button>
            {err && <span style={{ fontSize: 12, color: '#dc2626' }}>{err}</span>}
          </div>
        </motion.div>
      )}

      {/* Category list */}
      <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
        {groups.map((g, i) => {
          const Icon = g.icon;
          const isCustom = !!g.key && g.key.startsWith('g-');
          return (
            <div
              key={g.key ?? g.en}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderBottom: i < groups.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <Icon size={18} style={{ color: 'var(--accent)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {t(g.zh, g.en)}
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>{g.en}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {t(`${g.items.length} 个条目`, `${g.items.length} items`)}
                </div>
              </div>
              {isCustom ? (
                <button
                  onClick={() => handleRemove(g.key!, t(g.zh, g.en))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '7px 12px',
                    background: '#fee2e2',
                    borderRadius: 6,
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <X size={14} />
                  {t('删除', 'Delete')}
                </button>
              ) : (
                <span
                  title={t('内置分类不可删除', 'Built-in categories cannot be deleted')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', padding: '7px 10px' }}
                >
                  <Lock size={13} />
                  {t('内置', 'Built-in')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
        {t(
          `前台技栈页会实时显示新分类；内置 ${TECH_GROUPS.length} 个分类不可删除。`,
          `New categories appear on the frontend Tech Stack page instantly; the ${TECH_GROUPS.length} built-in categories cannot be deleted.`
        )}
      </p>
    </div>
  );
}

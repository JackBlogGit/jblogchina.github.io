import { useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, X, Upload, Link as LinkIcon, FolderPlus } from 'lucide-react';
import { useResources, saveResource, removeResource, useResourceGroups, addResourceGroup, removeResourceGroup } from '../../data/resources';
import type { ResourceItem } from '../../data/resources';
import { fileToDataUrl } from '../../data/gallery';
import { useApp } from '../../context/AppContext';

interface Draft {
  id?: string;
  groupKey: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  image: string;
  url: string;
  source: string;
}

const emptyDraft = (firstGroupKey: string): Draft => ({
  groupKey: firstGroupKey,
  titleZh: '',
  titleEn: '',
  descZh: '',
  descEn: '',
  image: '',
  url: '#',
  source: '',
});

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

export default function ResourceManager() {
  const { t } = useApp();
  const items = useResources();
  const groups = useResourceGroups();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupZh, setGroupZh] = useState('');
  const [groupEn, setGroupEn] = useState('');
  const [groupErr, setGroupErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddGroup = () => {
    if (!groupZh.trim()) {
      setGroupErr(t('分类名称不能为空', 'Name is required'));
      return;
    }
    if (addResourceGroup(groupZh, groupEn) === null) {
      setGroupErr(t('该分类已存在', 'Category already exists'));
      return;
    }
    setGroupZh('');
    setGroupEn('');
    setGroupErr('');
    setShowGroupForm(false);
  };

  const handleRemoveGroup = (key: string) => {
    const count = items.filter((i) => i.groupKey === key).length;
    const msg = count
      ? t(`删除分类「${groupName(key)}」将同时删除其下 ${count} 条资源，确定？`, `Delete category "${groupName(key)}" together with its ${count} resources?`)
      : t(`确定删除分类「${groupName(key)}」？`, `Delete category "${groupName(key)}"?`);
    if (window.confirm(msg)) {
      removeResourceGroup(key);
      if (activeGroup === key) setActiveGroup('all');
    }
  };

  const startEdit = (r: ResourceItem) => {
    setDraft({
      id: r.id,
      groupKey: r.groupKey,
      titleZh: r.titleZh,
      titleEn: r.titleEn,
      descZh: r.descZh,
      descEn: r.descEn,
      image: r.image,
      url: r.url,
      source: r.source ?? '',
    });
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file, 400, 0.85);
      setDraft((d) => (d ? { ...d, image: dataUrl } : d));
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    if (!draft || !draft.titleZh.trim()) return;
    saveResource({
      id: draft.id ?? `res-${Date.now()}`,
      groupKey: draft.groupKey,
      titleZh: draft.titleZh.trim(),
      titleEn: draft.titleEn.trim() || draft.titleZh.trim(),
      descZh: draft.descZh.trim(),
      descEn: draft.descEn.trim() || draft.descZh.trim(),
      image: draft.image,
      url: draft.url.trim() || '#',
      source: draft.source.trim() || undefined,
    });
    setDraft(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('确定删除这条资源？', 'Delete this resource?'))) removeResource(id);
  };

  const filtered = activeGroup === 'all' ? items : items.filter((i) => i.groupKey === activeGroup);
  const groupName = (key: string) => {
    const g = groups.find((x) => x.key === key);
    return g ? t(g.zh, g.en) : key;
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={22} style={{ color: 'var(--accent)' }} />
          {t('资源管理', 'Resources')}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
            {t(`共 ${items.length} 条`, `${items.length} items`)}
          </span>
        </h1>
        {!draft && (
          <button
            onClick={() => setDraft(emptyDraft(groups[0].key))}
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
            {t('新增资源', 'New Resource')}
          </button>
        )}
      </div>

      {/* Group tabs + add-category */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', ...groups.map((g) => g.key)].map((key) => (
          <button
            key={key}
            onClick={() => setActiveGroup(key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: activeGroup === key ? 'var(--accent)' : 'var(--card-bg, #fff)',
              color: activeGroup === key ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {key === 'all' ? t('全部', 'All') : groupName(key)}
            {key !== 'all' && key.startsWith('g-') && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveGroup(key);
                }}
                style={{ display: 'inline-flex', opacity: 0.7 }}
                title={t('删除分类', 'Delete category')}
              >
                <X size={13} />
              </span>
            )}
          </button>
        ))}
        {!showGroupForm && (
          <button
            onClick={() => { setShowGroupForm(true); setGroupErr(''); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              border: '1px dashed var(--accent)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <FolderPlus size={15} />
            {t('添加分类', 'Add Category')}
          </button>
        )}
      </div>

      {/* Add-category form */}
      {showGroupForm && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: -8, marginBottom: 20 }}>
          <input
            value={groupZh}
            onChange={(e) => { setGroupZh(e.target.value); setGroupErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            placeholder={`${t('分类名称（中文）', 'Category ZH')} *`}
            style={{ ...inputStyle, maxWidth: 200 }}
            autoFocus
          />
          <input
            value={groupEn}
            onChange={(e) => { setGroupEn(e.target.value); setGroupErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            placeholder={t('分类名称（英文）', 'Category EN')}
            style={{ ...inputStyle, maxWidth: 200 }}
          />
          <button
            onClick={handleAddGroup}
            style={{ padding: '9px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            {t('确定', 'Add')}
          </button>
          <button
            onClick={() => { setShowGroupForm(false); setGroupZh(''); setGroupEn(''); setGroupErr(''); }}
            style={{ padding: '9px 16px', background: 'var(--card-bg, #fff)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
          >
            {t('取消', 'Cancel')}
          </button>
          {groupErr && <span style={{ fontSize: 12, color: '#dc2626' }}>{groupErr}</span>}
        </div>
      )}

      {/* Editor card */}
      {draft && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--accent)', borderRadius: 12, padding: 20, marginBottom: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              {draft.id ? t('编辑资源', 'Edit Resource') : t('新增资源', 'New Resource')}
            </h2>
            <button onClick={() => setDraft(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 14 }}>
            <select value={draft.groupKey} onChange={(e) => setDraft({ ...draft, groupKey: e.target.value })} style={inputStyle}>
              {groups.map((g) => (
                <option key={g.key} value={g.key}>{t(g.zh, g.en)}</option>
              ))}
            </select>
            <input value={draft.titleZh} onChange={(e) => setDraft({ ...draft, titleZh: e.target.value })} placeholder={`${t('名称', 'Name ZH')} *`} style={inputStyle} />
            <input value={draft.titleEn} onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} placeholder={t('名称（英文）', 'Name EN')} style={inputStyle} />
            <input value={draft.descZh} onChange={(e) => setDraft({ ...draft, descZh: e.target.value })} placeholder={t('说明（中文，如：ISO 镜像下载）', 'Desc ZH')} style={inputStyle} />
            <input value={draft.descEn} onChange={(e) => setDraft({ ...draft, descEn: e.target.value })} placeholder={t('说明（英文）', 'Desc EN')} style={inputStyle} />
            <input value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} placeholder={t('来源（如：Microsoft）', 'Source')} style={inputStyle} />
          </div>

          {/* image + url */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                flexShrink: 0,
                border: '1px solid var(--border-subtle)',
                background: draft.image ? `url(${draft.image}) center/cover` : 'var(--hover-bg, #f9fafb)',
              }}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 14px',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent)',
                borderRadius: 8,
                color: 'var(--accent)',
                cursor: uploading ? 'wait' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Upload size={14} />
              {uploading ? t('处理中…', 'Processing…') : t('上传图标', 'Upload Icon')}
            </button>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LinkIcon size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder={t('下载链接 URL', 'Download URL')} style={inputStyle} />
            </div>
          </div>

          <button
            onClick={save}
            disabled={!draft.titleZh.trim()}
            style={{
              padding: '10px 20px',
              background: draft.titleZh.trim() ? 'var(--accent)' : 'var(--border-subtle)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: draft.titleZh.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {draft.id ? t('保存修改', 'Save') : t('添加资源', 'Add')}
          </button>
        </motion.div>
      )}

      {/* List */}
      <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>{t('暂无资源', 'No resources')}</div>
        ) : (
          filtered.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 14,
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: r.image ? `url(${r.image}) center/cover` : 'var(--hover-bg, #f3f4f6)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{r.titleZh}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {r.descZh}
                  {r.source && ` · ${r.source}`}
                </div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600 }}>
                {groupName(r.groupKey)}
              </span>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button
                  onClick={() => startEdit(r)}
                  style={{
                    padding: '7px 12px',
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
                  onClick={() => handleDelete(r.id)}
                  style={{
                    padding: '7px 12px',
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

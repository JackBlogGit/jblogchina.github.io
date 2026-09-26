import { useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Frame, Plus, Edit2, Trash2, X, Upload, ImageIcon, Link as LinkIcon, Tag } from 'lucide-react';
import { useGalleryArts, useGalleryCategories, addCategory, removeCategory, saveArt, removeArt, newArtId, fileToDataUrl } from '../../data/gallery';
import type { Art } from '../../data/gallery';
import { useApp } from '../../context/AppContext';

interface Draft {
  id?: number | string;
  titleZh: string;
  titleEn: string;
  artistZh: string;
  artistEn: string;
  year: string;
  mediumZh: string;
  mediumEn: string;
  descZh: string;
  descEn: string;
  url: string;
  w: number;
  category: string;
}

const emptyDraft = (): Draft => ({
  titleZh: '',
  titleEn: '',
  artistZh: '林',
  artistEn: 'Lin',
  year: String(new Date().getFullYear()),
  mediumZh: '摄影',
  mediumEn: 'Photography',
  descZh: '',
  descEn: '',
  url: '',
  w: 1,
  category: '',
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

export default function GalleryManager() {
  const { t } = useApp();
  const arts = useGalleryArts();
  const cats = useGalleryCategories();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [newCatZh, setNewCatZh] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const catName = (id: string) => {
    const c = cats.find((k) => k.id === id);
    return c ? t(c.zh, c.en) : t('未分类', 'Uncategorized');
  };

  const createCategory = () => {
    if (!newCatZh.trim()) return;
    const created = addCategory({ zh: newCatZh, en: newCatEn });
    setDraft((d) => (d ? { ...d, category: created.id } : d));
    setNewCatZh('');
    setNewCatEn('');
  };

  const deleteCategory = (id: string, label: string) => {
    if (window.confirm(t(`确定删除分类「${label}」？该分类下的作品会变为未分类。`, `Delete category "${label}"? Its artworks become uncategorized.`))) {
      removeCategory(id);
      if (filterCat === id) setFilterCat('all');
    }
  };

  const startEdit = (a: Art) => {
    setDraft({
      id: a.id,
      titleZh: a.titleZh,
      titleEn: a.titleEn,
      artistZh: a.artistZh,
      artistEn: a.artistEn,
      year: a.year,
      mediumZh: a.mediumZh,
      mediumEn: a.mediumEn,
      descZh: a.descZh,
      descEn: a.descEn,
      url: a.url,
      w: a.w,
      category: a.category ?? '',
    });
    setUploadError('');
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError('');
    try {
      const dataUrl = await fileToDataUrl(file);
      setDraft((d) => (d ? { ...d, url: dataUrl } : d));
    } catch {
      setUploadError(t('图片读取失败，请换一张试试', 'Failed to read image, try another one'));
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    if (!draft || !draft.titleZh.trim() || !draft.url) return;
    saveArt({
      id: draft.id ?? newArtId(),
      titleZh: draft.titleZh.trim(),
      titleEn: draft.titleEn.trim() || draft.titleZh.trim(),
      artistZh: draft.artistZh.trim() || '林',
      artistEn: draft.artistEn.trim() || 'Lin',
      year: draft.year.trim() || String(new Date().getFullYear()),
      mediumZh: draft.mediumZh.trim(),
      mediumEn: draft.mediumEn.trim() || draft.mediumZh.trim(),
      descZh: draft.descZh.trim(),
      descEn: draft.descEn.trim() || draft.descZh.trim(),
      url: draft.url,
      w: draft.w > 0 ? draft.w : 1,
      category: draft.category,
    });
    setDraft(null);
  };

  const handleDelete = (id: number | string) => {
    if (window.confirm(t('确定从图展中移除这件作品？', 'Remove this artwork?'))) removeArt(id);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Frame size={22} style={{ color: 'var(--accent)' }} />
          {t('图展管理', 'Gallery')}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
            {t(`共 ${arts.length} 件作品`, `${arts.length} works`)}
          </span>
        </h1>
        {!draft && (
          <button
            onClick={() => { setDraft(emptyDraft()); setUploadError(''); }}
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
            {t('新增作品', 'New Artwork')}
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
              {draft.id ? t('编辑作品', 'Edit Artwork') : t('新增作品', 'New Artwork')}
            </h2>
            <button onClick={() => setDraft(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
            {/* Image picker */}
            <div style={{ width: 220, flexShrink: 0 }}>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: 10,
                  border: '1px dashed var(--border-subtle)',
                  background: draft.url ? `url(${draft.url}) center/cover` : 'var(--hover-bg, #f9fafb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                  overflow: 'hidden',
                }}
              >
                {!draft.url && <ImageIcon size={28} />}
              </div>
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
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent)',
                  borderRadius: 8,
                  color: 'var(--accent)',
                  cursor: uploading ? 'wait' : 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Upload size={14} />
                {uploading ? t('处理中…', 'Processing…') : t('上传本地照片', 'Upload Photo')}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <LinkIcon size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  value={draft.url.startsWith('data:') ? '' : draft.url}
                  onChange={(e) => setDraft((d) => (d ? { ...d, url: e.target.value } : d))}
                  placeholder={t('或粘贴图片链接 https://…', 'Or paste image URL')}
                  style={{ ...inputStyle, fontSize: 12 }}
                  disabled={draft.url.startsWith('data:')}
                />
              </div>
              {draft.url.startsWith('data:') && (
                <button
                  onClick={() => setDraft((d) => (d ? { ...d, url: '' } : d))}
                  style={{ marginTop: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  {t('清除已上传照片以改用链接', 'Clear photo to use a link')}
                </button>
              )}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.6 }}>
                {t('照片会自动压缩后存入浏览器本地。', 'Photos are compressed and stored locally in the browser.')}
              </p>
              {uploadError && <p style={{ fontSize: 12, color: '#dc2626', margin: '6px 0 0' }}>{uploadError}</p>}
            </div>

            {/* Fields */}
            <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={draft.titleZh} onChange={(e) => setDraft({ ...draft, titleZh: e.target.value })} placeholder={`${t('中文标题', 'Title ZH')} *`} style={inputStyle} />
                <input value={draft.titleEn} onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} placeholder={t('英文标题', 'Title EN')} style={inputStyle} />
                <input value={draft.mediumZh} onChange={(e) => setDraft({ ...draft, mediumZh: e.target.value })} placeholder={t('媒介（如：摄影）', 'Medium ZH')} style={inputStyle} />
                <input value={draft.mediumEn} onChange={(e) => setDraft({ ...draft, mediumEn: e.target.value })} placeholder={t('媒介（英文）', 'Medium EN')} style={inputStyle} />
                <input value={draft.artistZh} onChange={(e) => setDraft({ ...draft, artistZh: e.target.value })} placeholder={t('作者', 'Artist')} style={inputStyle} />
                <input value={draft.artistEn} onChange={(e) => setDraft({ ...draft, artistEn: e.target.value })} placeholder={t('作者（英文）', 'Artist EN')} style={inputStyle} />
                <input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} placeholder={t('年份', 'Year')} style={inputStyle} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{t('高度权重', 'Height')}</span>
                  <input
                    type="number"
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={draft.w}
                    onChange={(e) => setDraft({ ...draft, w: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <textarea value={draft.descZh} onChange={(e) => setDraft({ ...draft, descZh: e.target.value })} placeholder={t('中文描述', 'Description ZH')} rows={2} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }} />
              <textarea value={draft.descEn} onChange={(e) => setDraft({ ...draft, descEn: e.target.value })} placeholder={t('英文描述（可选）', 'Description EN (optional)')} rows={2} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }} />

              {/* 分类选择 + 内联新建分类 */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Tag size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  style={{ ...inputStyle, width: 'auto', minWidth: 130, cursor: 'pointer' }}
                >
                  <option value="">{t('未分类', 'Uncategorized')}</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{t(c.zh, c.en)}</option>
                  ))}
                </select>
                <input value={newCatZh} onChange={(e) => setNewCatZh(e.target.value)} placeholder={t('新分类（中文）', 'New cat ZH')} style={{ ...inputStyle, width: 120 }} />
                <input value={newCatEn} onChange={(e) => setNewCatEn(e.target.value)} placeholder={t('英文（可选）', 'EN (optional)')} style={{ ...inputStyle, width: 120 }} />
                <button
                  onClick={createCategory}
                  disabled={!newCatZh.trim()}
                  style={{
                    padding: '9px 12px',
                    background: newCatZh.trim() ? 'var(--accent)' : 'var(--border-subtle)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: newCatZh.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Plus size={14} />
                  {t('添加分类', 'Add')}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={save}
              disabled={!draft.titleZh.trim() || !draft.url}
              style={{
                padding: '10px 20px',
                background: draft.titleZh.trim() && draft.url ? 'var(--accent)' : 'var(--border-subtle)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: draft.titleZh.trim() && draft.url ? 'pointer' : 'not-allowed',
              }}
            >
              {draft.id ? t('保存修改', 'Save') : t('加入图展', 'Add to Gallery')}
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {!draft.url && t('请先上传照片', 'Upload a photo first')}
            </span>
          </div>
        </motion.div>
      )}

      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {(['all', ...cats.map((c) => c.id), ...(arts.some((a) => !a.category) ? ['__none__'] : [])] as string[]).map((key) => {
          const on = filterCat === key;
          const label = key === 'all' ? t('全部', 'All') : key === '__none__' ? t('未分类', 'Uncategorized') : catName(key);
          const catObj = cats.find((c) => c.id === key);
          return (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <button
                onClick={() => setFilterCat(key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px 0 0 999px',
                  border: '1px solid var(--border-subtle)',
                  borderRight: catObj ? 'none' : undefined,
                  background: on ? 'var(--accent)' : 'var(--card-bg, #fff)',
                  color: on ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: on ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {label}
                <span style={{ opacity: 0.7, fontSize: 11, marginLeft: 4 }}>
                  {key === 'all' ? arts.length : key === '__none__' ? arts.filter((a) => !a.category).length : arts.filter((a) => a.category === key).length}
                </span>
              </button>
              {catObj && (
                <button
                  onClick={() => deleteCategory(catObj.id, label)}
                  title={t('删除分类', 'Delete category')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '0 999px 999px 0',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: 'none',
                    background: on ? 'var(--accent)' : 'var(--card-bg, #fff)',
                    color: on ? '#fff' : 'var(--text-muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Grid list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {arts
          .filter((a) => (filterCat === 'all' ? true : filterCat === '__none__' ? !a.category : a.category === filterCat))
          .map((a) => (
          <div key={a.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ width: '100%', aspectRatio: '4 / 3', background: `url(${a.url}) center/cover`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', padding: '3px 8px', borderRadius: 999 }}>
                {catName(a.category ?? '')}
              </span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titleZh}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                {a.year} · {a.mediumZh}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => startEdit(a)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    background: 'var(--hover-bg, #f3f4f6)',
                    borderRadius: 6,
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontSize: 12,
                  }}
                >
                  <Edit2 size={13} />
                  {t('编辑', 'Edit')}
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    background: '#fee2e2',
                    borderRadius: 6,
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontSize: 12,
                  }}
                >
                  <Trash2 size={13} />
                  {t('删除', 'Delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

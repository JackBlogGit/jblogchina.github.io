import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Copy, Check, Search, ImageIcon, X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { img as genImg } from '../../data/articles';

interface MediaItem {
  id: string;
  url: string;
  prompt?: string;
  createdAt: string;
}

const STORAGE_KEY = 'blog-media-library';

function loadMedia(): MediaItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMedia(items: MediaItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function MediaLibrary() {
  const { t } = useApp();
  const [items, setItems] = useState<MediaItem[]>(loadMedia);
  const [showAdd, setShowAdd] = useState(false);
  const [showGen, setShowGen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    saveMedia(items);
  }, [items]);

  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.url.toLowerCase().includes(q) || (item.prompt ?? '').toLowerCase().includes(q);
  });

  const addByUrl = () => {
    if (!urlInput.trim()) return;
    const item: MediaItem = {
      id: `media-${Date.now()}`,
      url: urlInput.trim(),
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [item, ...prev]);
    setUrlInput('');
    setShowAdd(false);
  };

  const generateImage = () => {
    if (!promptInput.trim()) return;
    setGenerating(true);
    const url = genImg(promptInput.trim());
    const item: MediaItem = {
      id: `media-${Date.now()}`,
      url,
      prompt: promptInput.trim(),
      createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
      setItems((prev) => [item, ...prev]);
      setPromptInput('');
      setShowGen(false);
      setGenerating(false);
    }, 500);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (previewItem?.id === id) setPreviewItem(null);
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = item.url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t('媒体库', 'Media Library')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setShowGen(true); setShowAdd(false); }}
            style={{
              padding: '10px 16px',
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <Sparkles size={16} />
            {t('AI 生图', 'AI Generate')}
          </button>
          <button
            onClick={() => { setShowAdd(true); setShowGen(false); }}
            style={{
              padding: '10px 16px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Plus size={16} />
            {t('添加图片', 'Add Image')}
          </button>
        </div>
      </div>

      {/* Add by URL panel */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 16 }}
          >
            <div
              style={{
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{t('通过 URL 添加图片', 'Add image by URL')}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => e.key === 'Enter' && addByUrl()}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--hover-bg, #f9fafb)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={addByUrl}
                  disabled={!urlInput.trim()}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--accent)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: !urlInput.trim() ? 0.5 : 1,
                  }}
                >
                  {t('添加', 'Add')}
                </button>
                <button
                  onClick={() => { setShowAdd(false); setUrlInput(''); }}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generate panel */}
      <AnimatePresence>
        {showGen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 16 }}
          >
            <div
              style={{
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                {t('AI 生成图片', 'AI Generate Image')}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={t('描述你想生成的图片…', 'Describe the image you want…')}
                  onKeyDown={(e) => e.key === 'Enter' && !generating && generateImage()}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--hover-bg, #f9fafb)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={generateImage}
                  disabled={!promptInput.trim() || generating}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--accent)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: !promptInput.trim() || generating ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {generating ? t('生成中…', 'Generating…') : t('生成', 'Generate')}
                </button>
                <button
                  onClick={() => { setShowGen(false); setPromptInput(''); }}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('搜索图片…', 'Search images…')}
          style={{
            width: '100%',
            padding: '10px 14px 10px 40px',
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            fontSize: 14,
            outline: 'none',
            color: 'var(--text-primary)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Stats */}
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        {t(`共 ${items.length} 张图片`, `${items.length} image${items.length !== 1 ? 's' : ''}`)}
        {search && filtered.length !== items.length && t(`，匹配 ${filtered.length} 张`, `, ${filtered.length} matched`)}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 60,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <ImageIcon size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 16, marginBottom: 8 }}>
            {items.length === 0
              ? t('媒体库为空', 'Media library is empty')
              : t('没有匹配的图片', 'No matching images')}
          </p>
          <p style={{ fontSize: 13 }}>
            {t('点击「添加图片」或「AI 生图」开始', 'Click "Add Image" or "AI Generate" to start')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="glass"
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              whileHover={{ y: -3 }}
              onClick={() => setPreviewItem(item)}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: `url(${item.url}) center/cover`,
                  backgroundColor: 'var(--hover-bg, #f0f0f0)',
                }}
              />
              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {item.prompt || item.url.slice(0, 30) + '…'}
                </span>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(item); }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: 'none',
                      background: copiedId === item.id ? 'var(--accent-soft)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: copiedId === item.id ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                    title={t('复制 URL', 'Copy URL')}
                  >
                    {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                    }}
                    title={t('删除', 'Delete')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewItem(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
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
              style={{
                background: 'var(--card-bg, #fff)',
                borderRadius: 16,
                overflow: 'hidden',
                maxWidth: 700,
                width: '100%',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <img
                src={previewItem.url}
                alt={previewItem.prompt || ''}
                style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', background: '#000' }}
              />
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {previewItem.prompt && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{previewItem.prompt}</p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {previewItem.url}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => copyUrl(previewItem)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 13,
                      color: copiedId === previewItem.id ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {copiedId === previewItem.id ? <Check size={14} /> : <Copy size={14} />}
                    {t('复制 URL', 'Copy URL')}
                  </button>
                  <button
                    onClick={() => setPreviewItem(null)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--accent)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {t('关闭', 'Close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

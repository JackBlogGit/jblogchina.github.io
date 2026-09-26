import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, ArrowLeft, Bold, Italic, Heading1, Heading2, Quote, Code, List, Image as ImageIcon } from 'lucide-react';
import { useArticles, savePublishedArticle, parseContentToBlocks, slugify, img, CATEGORIES } from '../../data/articles';
import { TECH_GROUPS } from '../../data/techStack';
import { useApp } from '../../context/AppContext';
import type { Article, Block } from '../../data/articles';

const CATS = CATEGORIES.filter((c) => c.key !== 'home' && c.key !== 'gallery');

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useApp();
  const articles = useArticles();

  const existingArticle = id ? articles.find((a) => a.id === Number(id)) : null;

  const [title, setTitle] = useState(existingArticle?.titleZh ?? '');
  const [titleEn, setTitleEn] = useState(existingArticle?.titleEn ?? '');
  const [excerpt, setExcerpt] = useState(existingArticle?.excerptZh ?? '');
  const [excerptEn, setExcerptEn] = useState(existingArticle?.excerptEn ?? '');
  const [catKey, setCatKey] = useState(existingArticle?.catKey ?? CATS[0]?.key ?? 'journal');
  const [tagsInput, setTagsInput] = useState(existingArticle?.tags.join(', ') ?? '');
  const [coverUrl, setCoverUrl] = useState(existingArticle?.cover ?? '');
  const [content, setContent] = useState(() => {
    if (existingArticle?.blocks) {
      return existingArticle.blocks
        .map((b) => {
          if (b.type === 'h2') return `# ${b.textZh ?? ''}`;
          if (b.type === 'h3') return `## ${b.textZh ?? ''}`;
          if (b.type === 'quote') return `> ${b.textZh ?? ''}`;
          if (b.type === 'code') return `\`\`\`${b.lang ?? ''}\n${b.textZh ?? ''}\n\`\`\``;
          if (b.type === 'list') return (b.itemsZh ?? []).map((item) => `- ${item}`).join('\n');
          if (b.type === 'img') return `![${b.captionZh ?? ''}](${b.img ?? ''})`;
          return b.textZh ?? '';
        })
        .join('\n\n');
    }
    return '';
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = before + (selected || 'text') + after;
    setContent((prev) => prev.slice(0, start) + replacement + prev.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      const newCursorPos = start + before.length + (selected || 'text').length;
      ta.setSelectionRange(selected ? start + before.length : start + before.length, newCursorPos);
    });
  };

  const handleSave = (publish: boolean) => {
    if (!title.trim() || !content.trim()) return;

    const cat = CATS.find((c) => c.key === catKey) ?? CATS[0];
    const now = new Date();
    const dateStr = publish
      ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      : existingArticle?.date ?? '';

    const article: Article = {
      id: existingArticle?.id ?? Date.now(),
      slug: existingArticle?.slug ?? `${slugify(title)}-${Date.now().toString(36)}`,
      titleZh: title.trim(),
      titleEn: titleEn.trim() || title.trim(),
      excerptZh: excerpt.trim() || title.trim(),
      excerptEn: excerptEn.trim() || excerpt.trim() || titleEn.trim() || title.trim(),
      date: dateStr,
      readMin: Math.max(1, Math.round(content.replace(/\s/g, '').length / 300)),
      catZh: cat.zh,
      catEn: cat.en,
      catKey: cat.key,
      tags: tagsInput
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      cover: coverUrl.trim() || img(`article cover for ${title.trim()}, modern minimalist`, 'landscape_16_9'),
      author: existingArticle?.author ?? 'Lin',
      authorAvatar: existingArticle?.authorAvatar ?? img('A minimalist avatar icon, abstract geometric face, indigo and purple gradient, flat design', 'square'),
      blocks: parseContentToBlocks(content),
    };

    savePublishedArticle(article);
    navigate('/admin/articles');
  };

  const insertBlock = (type: string) => {
    const templates: Record<string, string> = {
      h2: '\n# ',
      h3: '\n## ',
      quote: '\n> ',
      code: '\n```\n\n```\n',
      list: '\n- ',
      img: '\n![](https://example.com/image.jpg)\n',
    };
    setContent((prev) => prev + (templates[type] ?? ''));
  };

  const previewBlocks = useMemo(() => parseContentToBlocks(content), [content]);

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 12px',
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-secondary)',
              fontSize: 14,
            }}
          >
            <ArrowLeft size={16} />
            {t('返回', 'Back')}
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{existingArticle ? t('编辑文章', 'Edit Article') : t('新建文章', 'New Article')}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowPreview((v) => !v)}
            style={{
              padding: '10px 16px',
              background: showPreview ? 'var(--accent-soft)' : 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: showPreview ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <Eye size={16} />
            {t('预览', 'Preview')}
          </button>
          <button
            onClick={() => handleSave(false)}
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
            <Save size={16} />
            {t('保存草稿', 'Save Draft')}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={!title.trim() || !content.trim()}
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
              opacity: !title.trim() || !content.trim() ? 0.5 : 1,
            }}
          >
            <Save size={16} />
            {t('发布', 'Publish')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Editor */}
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          {/* Title (Chinese) */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('文章标题（中文）', 'Article title (Chinese)')}
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: 24,
              fontWeight: 700,
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              marginBottom: 8,
              outline: 'none',
              color: 'var(--text-primary)',
              boxSizing: 'border-box',
            }}
          />
          {/* Title (English) */}
          <input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder={t('英文标题（留空则同中文）', 'English title (defaults to Chinese)')}
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: 16,
              fontWeight: 600,
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              marginBottom: 16,
              outline: 'none',
              color: 'var(--text-secondary)',
              boxSizing: 'border-box',
            }}
          />

          {/* Excerpt (Chinese) */}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={t('摘要（中文，可选）', 'Excerpt (Chinese, optional)')}
            rows={2}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 14,
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              marginBottom: 8,
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              boxSizing: 'border-box',
            }}
          />
          {/* Excerpt (English) */}
          <textarea
            value={excerptEn}
            onChange={(e) => setExcerptEn(e.target.value)}
            placeholder={t('英文摘要（留空则同中文）', 'English excerpt (defaults to Chinese)')}
            rows={2}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 14,
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              marginBottom: 16,
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              color: 'var(--text-secondary)',
              boxSizing: 'border-box',
            }}
          />

          {/* Meta fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                {t('分类', 'Category')}
              </label>
              <select
                value={catKey}
                onChange={(e) => {
                  setCatKey(e.target.value);
                  if (e.target.value !== 'stack') setTagsInput('');
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--card-bg, #fff)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              >
                {CATS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {t(c.zh, c.en)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                {t('标签', 'Tags')}
              </label>
              {catKey === 'stack' ? (
                <div ref={tagDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowTagDropdown((v) => !v)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--card-bg, #fff)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      fontSize: 14,
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: tagsInput ? 'var(--text-primary)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span>
                      {tagsInput
                        ? `${t('已选', 'Selected')} ${tagsInput.split(/[,，]/).filter(Boolean).length} ${t('个标签', 'tags')}`
                        : t('请选择标签…', 'Select tags…')}
                    </span>
                    <span style={{ fontSize: 12, transform: showTagDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                  </button>
                  {showTagDropdown && (
                    <div
                      className="glass glass-strong"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        borderRadius: 12,
                        padding: 12,
                        maxHeight: 320,
                        overflowY: 'auto',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      }}
                    >
                      {TECH_GROUPS.map((g) => {
                        const Icon = g.icon;
                        const currentTags = tagsInput.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
                        return (
                          <div key={g.en} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <Icon size={13} style={{ color: 'var(--accent)' }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{t(g.zh, g.en)}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{g.items.length}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {g.items.map((item) => {
                                const isSelected = currentTags.includes(item.name);
                                return (
                                  <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => {
                                      const next = isSelected
                                        ? currentTags.filter((t) => t !== item.name)
                                        : [...currentTags, item.name];
                                      setTagsInput(next.join(', '));
                                    }}
                                    style={{
                                      padding: '3px 9px',
                                      borderRadius: 6,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                                      background: isSelected ? 'var(--accent-soft)' : 'transparent',
                                      color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                                      transition: 'all 0.15s',
                                    }}
                                  >
                                    {item.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '10px 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  {t('仅「技栈」分类可选标签', 'Tags available only for "Stack" category')}
                </div>
              )}
            </div>
          </div>

          {/* Cover URL */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              {t('封面图 URL（可选，留空自动生成）', 'Cover image URL (optional, auto-generated)')}
            </label>
            <input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Content editor */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Toolbar */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--hover-bg, #f9fafb)',
              }}
            >
              <button onClick={() => wrapSelection('**', '**')} title={t('粗体', 'Bold')} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--text-secondary)' }}>
                <Bold size={16} />
              </button>
              <button onClick={() => wrapSelection('*', '*')} title={t('斜体', 'Italic')} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--text-secondary)' }}>
                <Italic size={16} />
              </button>
              <div style={{ width: 1, background: 'var(--border-subtle)', margin: '0 4px' }} />
              <button onClick={() => insertBlock('h2')} title={t('标题', 'Heading')} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--text-secondary)' }}>
                <Heading1 size={16} />
              </button>
              <button onClick={() => insertBlock('h3')} title={t('副标题', 'Subheading')} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--text-secondary)' }}>
                <Heading2 size={16} />
              </button>
              <button onClick={() => insertBlock('quote')} title={t('引用', 'Quote')} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--text-secondary)' }}>
                <Quote size={16} />
              </button>
              <button onClick={() => insertBlock('code')} title={t('代码', 'Code')} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--text-secondary)' }}>
                <Code size={16} />
              </button>
              <button onClick={() => insertBlock('list')} title={t('列表', 'List')} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--text-secondary)' }}>
                <List size={16} />
              </button>
              <button onClick={() => insertBlock('img')} title={t('图片', 'Image')} style={{ padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--text-secondary)' }}>
                <ImageIcon size={16} />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('开始写作... 支持 Markdown 语法', 'Start writing... Markdown supported')}
              style={{
                width: '100%',
                minHeight: 500,
                padding: 20,
                fontSize: 15,
                lineHeight: 1.8,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div
            style={{
              width: 420,
              flexShrink: 0,
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: 24,
              maxHeight: 'calc(100vh - 120px)',
              overflow: 'auto',
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('预览', 'Preview')}</h3>
            {title && (
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {lang === 'zh' ? title : (titleEn || title)}
              </h2>
            )}
            {(excerpt || excerptEn) && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                {lang === 'zh' ? (excerpt || title) : (excerptEn || excerpt || titleEn || title)}
              </p>
            )}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              {previewBlocks.map((block, i) => (
                <PreviewBlock key={i} block={block} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewBlock({ block, lang }: { block: Block; lang: string }) {
  if (block.type === 'p') {
    return (
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 14 }}>
        {lang === 'zh' ? block.textZh : block.textEn}
      </p>
    );
  }
  if (block.type === 'h2') {
    return (
      <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 12, marginBottom: 8, color: 'var(--text-primary)' }}>
        {lang === 'zh' ? block.textZh : block.textEn}
      </h2>
    );
  }
  if (block.type === 'h3') {
    return (
      <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 10, marginBottom: 6, color: 'var(--text-primary)' }}>
        {lang === 'zh' ? block.textZh : block.textEn}
      </h3>
    );
  }
  if (block.type === 'quote') {
    return (
      <blockquote style={{ margin: '0 0 14px', padding: '12px 16px', borderLeft: '3px solid var(--accent)', fontSize: 14, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.7, background: 'var(--hover-bg, #f9fafb)', borderRadius: '0 8px 8px 0' }}>
        {lang === 'zh' ? block.textZh : block.textEn}
      </blockquote>
    );
  }
  if (block.type === 'code') {
    return (
      <div style={{ margin: '0 0 14px', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        {block.lang && (
          <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
            {block.lang}
          </div>
        )}
        <pre style={{ margin: 0, padding: '12px 14px', overflowX: 'auto', fontSize: 12, lineHeight: 1.6, fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace", color: 'var(--text-primary)' }}>
          <code>{lang === 'zh' ? block.textZh : block.textEn}</code>
        </pre>
      </div>
    );
  }
  if (block.type === 'list') {
    const items = lang === 'zh' ? block.itemsZh : block.itemsEn;
    return (
      <ul style={{ margin: '0 0 14px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(items ?? []).map((item, i) => (
          <li key={i} style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'img') {
    return (
      <figure style={{ margin: '0 0 14px' }}>
        <div style={{ borderRadius: 8, overflow: 'hidden', background: 'var(--hover-bg, #f0f0f0)' }}>
          <img src={block.img} alt={lang === 'zh' ? block.captionZh : block.captionEn} style={{ width: '100%', display: 'block' }} loading="lazy" />
        </div>
        {block.captionZh && (
          <figcaption style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
            {lang === 'zh' ? block.captionZh : block.captionEn}
          </figcaption>
        )}
      </figure>
    );
  }
  return null;
}

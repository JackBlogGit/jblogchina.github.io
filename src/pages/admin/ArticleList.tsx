import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, ChevronDown, CheckSquare, Square, Star } from 'lucide-react';
import { useArticles, removePublishedArticle, savePublishedArticle, CATEGORIES } from '../../data/articles';
import { confirmDeletePassword } from '../../data/deleteGuard';
import { useFeaturedId, setFeaturedId } from '../../data/featured';
import { useApp } from '../../context/AppContext';
import type { Article } from '../../data/articles';

type Status = 'all' | 'published' | 'draft';
type SortBy = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'words-desc';

export default function ArticleList() {
  const { t } = useApp();
  const articles = useArticles();
  const featuredId = useFeaturedId();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const getWordCount = (article: Article) => {
    return article.blocks
      .filter((b) => b.type === 'p' || b.type === 'h2' || b.type === 'h3')
      .reduce((s, b) => s + (b.textZh?.length ?? 0), 0);
  };

  const filtered = useMemo(() => {
    let result = articles.filter((a) => {
      const matchesSearch =
        !search ||
        a.titleZh.toLowerCase().includes(search.toLowerCase()) ||
        a.titleEn.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' && a.date) || (statusFilter === 'draft' && !a.date);
      const matchesCat = catFilter === 'all' || a.catKey === catFilter;
      return matchesSearch && matchesStatus && matchesCat;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (b.date || '').localeCompare(a.date || '');
        case 'date-asc':
          return (a.date || '').localeCompare(b.date || '');
        case 'title-asc':
          return a.titleZh.localeCompare(b.titleZh);
        case 'title-desc':
          return b.titleZh.localeCompare(a.titleZh);
        case 'words-desc':
          return getWordCount(b) - getWordCount(a);
        default:
          return 0;
      }
    });

    return result;
  }, [articles, search, statusFilter, catFilter, sortBy]);

  const handleDelete = (id: number) => {
    if (!confirmDeletePassword(t)) return;
    if (window.confirm(t('确定删除这篇文章？', 'Delete this article?'))) {
      removePublishedArticle(id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBatchDelete = () => {
    if (selected.size === 0) return;
    if (!confirmDeletePassword(t)) return;
    if (window.confirm(t(`确定删除选中的 ${selected.size} 篇文章？`, `Delete ${selected.size} selected articles?`))) {
      selected.forEach((id) => removePublishedArticle(id));
      setSelected(new Set());
    }
  };

  const handleToggleStatus = (article: Article) => {
    const updated = { ...article };
    if (article.date) {
      updated.date = '';
    } else {
      const now = new Date();
      updated.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    savePublishedArticle(updated);
  };

  const handleToggleFeatured = (article: Article) => {
    setFeaturedId(featuredId === article.id ? null : article.id);
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t('文章管理', 'Articles')}</h1>
        <Link
          to="/admin/articles/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <Plus size={16} />
          {t('新建文章', 'New Article')}
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div
          style={{
            flex: 1,
            minWidth: 250,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('搜索文章...', 'Search articles...')}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'published', 'draft'] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '10px 16px',
                background: statusFilter === s ? 'var(--accent)' : 'var(--card-bg, #fff)',
                color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {s === 'all' ? t('全部', 'All') : s === 'published' ? t('已发布', 'Published') : t('草稿', 'Draft')}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ position: 'relative' }}>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            style={{
              padding: '10px 32px 10px 14px',
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              fontSize: 14,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none',
            }}
          >
            <option value="all">{t('所有分类', 'All Categories')}</option>
            {CATEGORIES.filter((c) => c.key !== 'home' && c.key !== 'gallery').map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.zh}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
            }}
          />
        </div>

        {/* Sort */}
        <div style={{ position: 'relative' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{
              padding: '10px 32px 10px 14px',
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              fontSize: 14,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none',
            }}
          >
            <option value="date-desc">{t('最新优先', 'Newest')}</option>
            <option value="date-asc">{t('最早优先', 'Oldest')}</option>
            <option value="title-asc">{t('标题 A-Z', 'Title A-Z')}</option>
            <option value="title-desc">{t('标题 Z-A', 'Title Z-A')}</option>
            <option value="words-desc">{t('字数最多', 'Most Words')}</option>
          </select>
          <ChevronDown
            size={14}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
            }}
          />
        </div>
      </div>

      {/* Batch actions */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: 'var(--accent-soft)',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {t(`已选择 ${selected.size} 篇`, `${selected.size} selected`)}
          </span>
          <button
            onClick={handleBatchDelete}
            style={{
              padding: '6px 12px',
              background: '#fee2e2',
              border: 'none',
              borderRadius: 6,
              color: '#dc2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Trash2 size={14} />
            {t('批量删除', 'Delete Selected')}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{
              padding: '6px 12px',
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {t('取消选择', 'Deselect')}
          </button>
        </motion.div>
      )}

      {/* Article list */}
      <div style={{ background: 'var(--card-bg, #fff)', borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            {articles.length === 0
              ? t('暂无文章，点击上方按钮创建', 'No articles yet. Click the button above to create one.')
              : t('没有匹配的文章', 'No matching articles')}
          </div>
        ) : (
          <>
            {/* Header with select all */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--hover-bg, #f9fafb)',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              <button
                onClick={toggleSelectAll}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {selected.size === filtered.length && filtered.length > 0 ? (
                  <CheckSquare size={18} style={{ color: 'var(--accent)' }} />
                ) : (
                  <Square size={18} />
                )}
              </button>
              <span style={{ flex: 1 }}>
                {t(`共 ${filtered.length} 篇文章`, `${filtered.length} articles`)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((article, i) => {
                const wordCount = getWordCount(article);
                const isSelected = selected.has(article.id);
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 16,
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      background: isSelected ? 'var(--accent-soft)' : 'transparent',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => toggleSelect(article.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {isSelected ? (
                        <CheckSquare size={18} style={{ color: 'var(--accent)' }} />
                      ) : (
                        <Square size={18} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </button>
                    <div
                      style={{
                        width: 64,
                        height: 48,
                        borderRadius: 8,
                        background: `url(${article.cover}) center/cover`,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                          {t(article.titleZh, article.titleEn)}
                        </span>
                        {featuredId === article.id && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#f59e0b',
                              background: 'rgba(245,158,11,0.14)',
                              padding: '1px 7px',
                              borderRadius: 5,
                              flexShrink: 0,
                            }}
                          >
                            <Star size={11} fill="currentColor" />
                            {t('精选', 'Featured')}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>{article.date || t('草稿', 'Draft')}</span>
                        <span>{article.catZh}</span>
                        <span>{article.readMin} {t('分钟', 'min')}</span>
                        <span>{wordCount.toLocaleString()} {t('字', 'words')}</span>
                        {article.tags.length > 0 && <span>#{article.tags[0]}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
                      <Link
                        to={`/admin/articles/edit/${article.id}`}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--hover-bg, #f3f4f6)',
                          borderRadius: 6,
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 13,
                        }}
                      >
                        <Edit2 size={14} />
                        {t('编辑', 'Edit')}
                      </Link>
                      <Link
                        to={`/article/${article.slug}`}
                        target="_blank"
                        style={{
                          padding: '8px 12px',
                          background: 'var(--hover-bg, #f3f4f6)',
                          borderRadius: 6,
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 13,
                        }}
                      >
                        <Eye size={14} />
                        {t('预览', 'View')}
                      </Link>
                      {article.date && (
                        <button
                          onClick={() => handleToggleFeatured(article)}
                          style={{
                            padding: '8px 12px',
                            background: featuredId === article.id ? 'rgba(245,158,11,0.16)' : 'var(--hover-bg, #f3f4f6)',
                            borderRadius: 6,
                            border: 'none',
                            color: featuredId === article.id ? '#d97706' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          <Star size={14} fill={featuredId === article.id ? 'currentColor' : 'none'} />
                          {featuredId === article.id ? t('取消精选', 'Unfeature') : t('设为精选', 'Feature')}
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(article)}
                        style={{
                          padding: '8px 12px',
                          background: article.date ? '#fef3c7' : '#d1fae5',
                          borderRadius: 6,
                          border: 'none',
                          color: article.date ? '#92400e' : '#065f46',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {article.date ? t('取消发布', 'Unpublish') : t('发布', 'Publish')}
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
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
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

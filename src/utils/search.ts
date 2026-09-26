import type { Article, Block } from '../data/articles';

/**
 * 从文章的内容块中提取所有可搜索的纯文本（中英文）。
 */
export function getArticleText(article: Article): string {
  const parts: string[] = [];
  article.blocks.forEach((b: Block) => {
    if (b.textZh) parts.push(b.textZh);
    if (b.textEn) parts.push(b.textEn);
    if (b.itemsZh) parts.push(...b.itemsZh);
    if (b.itemsEn) parts.push(...b.itemsEn);
  });
  return parts.join(' ');
}

/**
 * 判断文章是否匹配关键词查询。
 * 匹配范围：标题、摘要、标签、作者、分类、正文内容。
 * 支持多个关键词（空格分隔），全部命中才算匹配（AND 语义）。
 */
export function articleMatches(article: Article, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    article.titleZh,
    article.titleEn,
    article.excerptZh,
    article.excerptEn,
    article.author,
    article.catZh,
    article.catEn,
    ...article.tags,
    getArticleText(article),
  ]
    .join(' ')
    .toLowerCase();

  // 多关键词 AND：空格分隔的每个词都必须出现
  const terms = q.split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

/**
 * 过滤文章列表，返回匹配关键词的文章。
 */
export function searchArticles(articles: Article[], query: string): Article[] {
  if (!query.trim()) return articles;
  return articles.filter((a) => articleMatches(a, query));
}

// 精选文章 — 存文章 id，后台可设置，首页优先展示
import { useEffect, useState } from 'react';

const KEY = 'blog-featured-article';
const EVENT = 'featured-article-updated';

export function loadFeaturedId(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as number | null;
    return typeof v === 'number' ? v : null;
  } catch {
    return null;
  }
}

export function setFeaturedId(id: number | null) {
  if (id === null) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, JSON.stringify(id));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** 响应式精选文章 id */
export function useFeaturedId(): number | null {
  const [id, setId] = useState<number | null>(() => loadFeaturedId());
  useEffect(() => {
    const refresh = () => setId(loadFeaturedId());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return id;
}

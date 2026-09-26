// 公告栏数据 — localStorage 持久化，首页预览、公告栏页面与后台共享
import { useEffect, useState } from 'react';

export interface Announcement {
  id: number;
  textZh: string;
  textEn: string;
  date: string;
  tag: string;
  tagEn?: string;
  /** news=公告（默认） notice=网站须知 */
  kind?: 'news' | 'notice';
}

const KEY = 'blog-announcements';
const EVENT = 'announcements-updated';

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    textZh: '液态玻璃博客 2.0 上线，全新视觉与交互体验。',
    textEn: 'Liquid Glass Blog 2.0 launched — new visual and interaction.',
    date: '2026-09-12',
    tag: '更新',
    tagEn: 'Update',
  },
  {
    id: 2,
    textZh: '新增"技栈"页面，展示我日常使用的工具与框架。',
    textEn: 'New "Tech Stack" page showcasing my daily tools and frameworks.',
    date: '2026-09-08',
    tag: '新功能',
    tagEn: 'Feature',
  },
  {
    id: 3,
    textZh: '京都旅行图文已发布，秋天的哲学之道。',
    textEn: "Kyoto travel photo-essay published — autumn Philosopher's Path.",
    date: '2026-09-05',
    tag: '文章',
    tagEn: 'Article',
  },
  {
    id: 4,
    textZh: '后台留言功能开放，欢迎交流想法与建议。',
    textEn: 'The message board is now open — share your ideas and suggestions.',
    date: '2026-08-28',
    tag: '社区',
    tagEn: 'Community',
  },
  {
    id: 5,
    textZh: '全站适配深色模式，可在右上角切换主题。',
    textEn: 'Dark mode supported site-wide — toggle the theme at the top right.',
    date: '2026-08-20',
    tag: '更新',
    tagEn: 'Update',
  },
];

export function loadAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
      return [...DEFAULT_ANNOUNCEMENTS];
    }
    return JSON.parse(raw) as Announcement[];
  } catch {
    return [...DEFAULT_ANNOUNCEMENTS];
  }
}

function persist(list: Announcement[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function saveAnnouncement(ann: Announcement) {
  const list = loadAnnouncements();
  const idx = list.findIndex((a) => a.id === ann.id);
  if (idx >= 0) list[idx] = ann;
  else list.unshift(ann);
  persist(list);
}

export function removeAnnouncement(id: number) {
  persist(loadAnnouncements().filter((a) => a.id !== id));
}

export function newAnnouncementId(): number {
  return Date.now();
}

/** 按日期倒序的公告列表（响应式） */
export function useAnnouncements(): Announcement[] {
  const [list, setList] = useState<Announcement[]>(() => loadAnnouncements());
  useEffect(() => {
    const refresh = () => setList(loadAnnouncements());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

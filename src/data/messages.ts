import { useEffect, useState } from 'react';
import { inspectMessage } from '../utils/contentFilter';

export interface Msg {
  id: string;
  name: string;
  mail: string;
  content: string;
  rating: number;
  at: string;
}

const KEY = 'blog-messages';
const EVENT = 'messages-updated';

const DEFAULT_MESSAGES: Msg[] = [
  {
    id: 'seed-1',
    name: 'Alice',
    mail: 'alice@example.com',
    content: '博客做得太美了，每篇都准时读，液态玻璃效果绝了！',
    rating: 5,
    at: '2026-09-10 14:22',
  },
  {
    id: 'seed-2',
    name: 'Bob',
    mail: 'bob@example.com',
    content: '京都那篇旅行随笔看哭了，文字和照片都好治愈。',
    rating: 5,
    at: '2026-09-09 08:31',
  },
  {
    id: 'seed-3',
    name: 'Cara',
    mail: '',
    content: '希望多写一些 CSS 和动画的实战文章～',
    rating: 4,
    at: '2026-09-05 19:10',
  },
];

function persist(list: Msg[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

// 自动删除已存储的违规留言（不文明用语/广告/色情/暴力）
function purge(list: Msg[]): Msg[] {
  const clean = list.filter((m) => inspectMessage(m.name, m.content).length === 0);
  if (clean.length !== list.length) persist(clean);
  return clean;
}

export function loadMessages(): Msg[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_MESSAGES));
      return [...DEFAULT_MESSAGES];
    }
    return purge(JSON.parse(raw) as Msg[]);
  } catch {
    return [...DEFAULT_MESSAGES];
  }
}

export function saveMessage(msg: Msg) {
  const list = loadMessages();
  const idx = list.findIndex((m) => m.id === msg.id);
  if (idx >= 0) list[idx] = msg;
  else list.unshift(msg);
  persist(list);
}

export function removeMessage(id: string) {
  persist(loadMessages().filter((m) => m.id !== id));
}

export function useMessages(): Msg[] {
  const [messages, setMessages] = useState<Msg[]>(() => loadMessages());
  useEffect(() => {
    const refresh = () => setMessages(loadMessages());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return messages;
}

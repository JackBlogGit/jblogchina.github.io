import { useEffect, useState } from 'react';

export interface ResourceItem {
  id: string;
  groupKey: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  image: string;
  url: string;
  source?: string;
}

export interface ResourceGroup {
  key: string;
  zh: string;
  en: string;
}

export const RESOURCE_GROUPS: ResourceGroup[] = [
  { key: 'adobe', zh: 'Adobe', en: 'Adobe' },
  { key: 'system', zh: '系统', en: 'System' },
  { key: 'tools', zh: '优化工具', en: 'Optimization Tools' },
  { key: 'kali', zh: 'Kali', en: 'Kali' },
  { key: 'blender', zh: 'Blender', en: 'Blender' },
  { key: 'original', zh: '原创', en: 'Original' },
];

const traImg = (p: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(p)}&image_size=square`;

const KEY = 'blog-resources';
const EVENT = 'resources-updated';

const DEFAULT_ITEMS: ResourceItem[] = [
  { id: 'ps', groupKey: 'adobe', titleZh: 'Photoshop 2026', titleEn: 'Photoshop 2026', descZh: 'Windows x64 下载', descEn: 'Windows x64 Download', image: traImg('Adobe Photoshop logo icon, blue gradient square, modern flat design'), url: '#', source: 'Adobe 官方' },
  { id: 'ai', groupKey: 'adobe', titleZh: 'Illustrator 2026', titleEn: 'Illustrator 2026', descZh: 'Windows x64 下载', descEn: 'Windows x64 Download', image: traImg('Adobe Illustrator logo icon, orange gradient square, modern flat design'), url: '#', source: 'Adobe 官方' },
  { id: 'pr', groupKey: 'adobe', titleZh: 'Premiere Pro 2026', titleEn: 'Premiere Pro 2026', descZh: 'Windows x64 下载', descEn: 'Windows x64 Download', image: traImg('Adobe Premiere Pro logo icon, purple gradient square, modern flat design'), url: '#', source: 'Adobe 官方' },
  { id: 'ae', groupKey: 'adobe', titleZh: 'After Effects 2026', titleEn: 'After Effects 2026', descZh: 'Windows x64 下载', descEn: 'Windows x64 Download', image: traImg('Adobe After Effects logo icon, dark blue gradient square, modern flat design'), url: '#', source: 'Adobe 官方' },
  { id: 'win11', groupKey: 'system', titleZh: 'Windows 11 Pro', titleEn: 'Windows 11 Pro', descZh: 'ISO 镜像下载', descEn: 'ISO Image Download', image: traImg('Windows 11 logo icon, blue four squares, modern flat design'), url: '#', source: 'Microsoft' },
  { id: 'ubuntu', groupKey: 'system', titleZh: 'Ubuntu 24.04 LTS', titleEn: 'Ubuntu 24.04 LTS', descZh: 'ISO 镜像下载', descEn: 'ISO Image Download', image: traImg('Ubuntu Linux logo icon, orange circle, modern flat design'), url: '#', source: 'Canonical' },
  { id: 'macos', groupKey: 'system', titleZh: 'macOS Sequoia', titleEn: 'macOS Sequoia', descZh: 'DMG 镜像下载', descEn: 'DMG Image Download', image: traImg('macOS logo icon, grey apple symbol, modern flat design'), url: '#', source: 'Apple' },
  { id: 'debian', groupKey: 'system', titleZh: 'Debian 12', titleEn: 'Debian 12', descZh: 'ISO 镜像下载', descEn: 'ISO Image Download', image: traImg('Debian Linux logo icon, red spiral, modern flat design'), url: '#', source: 'Debian Project' },
  { id: 'ccleaner', groupKey: 'tools', titleZh: 'CCleaner Pro', titleEn: 'CCleaner Pro', descZh: '系统清理优化', descEn: 'System Cleaner', image: traImg('CCleaner logo icon, green broom, modern flat design'), url: '#', source: 'Piriform' },
  { id: 'geek', groupKey: 'tools', titleZh: 'Geek Uninstaller', titleEn: 'Geek Uninstaller', descZh: '强制卸载工具', descEn: 'Force Uninstall Tool', image: traImg('Software uninstaller icon, red trash bin, modern flat design'), url: '#', source: 'Geek Uninstaller' },
  { id: 'everything', groupKey: 'tools', titleZh: 'Everything', titleEn: 'Everything', descZh: '极速文件搜索', descEn: 'Fast File Search', image: traImg('File search icon, magnifying glass blue, modern flat design'), url: '#', source: 'Voidtools' },
  { id: 'potplayer', groupKey: 'tools', titleZh: 'PotPlayer', titleEn: 'PotPlayer', descZh: '万能视频播放器', descEn: 'Universal Video Player', image: traImg('Video player icon, green play button, modern flat design'), url: '#', source: 'Kakao' },
  { id: 'kali-vm', groupKey: 'kali', titleZh: 'Kali Linux VM', titleEn: 'Kali Linux VM', descZh: '虚拟机镜像下载', descEn: 'VM Image Download', image: traImg('Kali Linux logo icon, blue dragon, modern flat design'), url: '#', source: 'Offensive Security' },
  { id: 'kali-live', groupKey: 'kali', titleZh: 'Kali Live USB', titleEn: 'Kali Live USB', descZh: 'Live USB 镜像', descEn: 'Live USB Image', image: traImg('USB drive icon, blue and black, modern flat design'), url: '#', source: 'Offensive Security' },
  { id: 'kali-docker', groupKey: 'kali', titleZh: 'Kali Docker', titleEn: 'Kali Docker', descZh: 'Docker 容器镜像', descEn: 'Docker Container Image', image: traImg('Docker whale icon, blue, modern flat design'), url: '#', source: 'Docker Hub' },
  { id: 'blender-win', groupKey: 'blender', titleZh: 'Blender 4.3 Windows', titleEn: 'Blender 4.3 Windows', descZh: 'Windows 安装包', descEn: 'Windows Installer', image: traImg('Blender 3D logo icon, orange and blue, modern flat design'), url: '#', source: 'Blender Foundation' },
  { id: 'blender-mac', groupKey: 'blender', titleZh: 'Blender 4.3 macOS', titleEn: 'Blender 4.3 macOS', descZh: 'macOS 安装包', descEn: 'macOS Installer', image: traImg('Blender 3D logo icon, orange and blue, modern flat design'), url: '#', source: 'Blender Foundation' },
  { id: 'blender-linux', groupKey: 'blender', titleZh: 'Blender 4.3 Linux', titleEn: 'Blender 4.3 Linux', descZh: 'Linux AppImage', descEn: 'Linux AppImage', image: traImg('Blender 3D logo icon, orange and blue, modern flat design'), url: '#', source: 'Blender Foundation' },
  { id: 'glass-kit', groupKey: 'original', titleZh: '液态玻璃 UI Kit', titleEn: 'Liquid Glass UI Kit', descZh: 'Figma 组件库', descEn: 'Figma Component Library', image: traImg('Figma logo icon, purple and pink, modern flat design'), url: '#', source: '本站原创' },
  { id: 'icon-set', groupKey: 'original', titleZh: '玻璃风格图标集', titleEn: 'Glass Icon Set', descZh: 'SVG 图标包', descEn: 'SVG Icon Pack', image: traImg('Icon set preview, glassmorphism style, colorful, modern flat design'), url: '#', source: '本站原创' },
  { id: 'wallpaper', groupKey: 'original', titleZh: '液态玻璃壁纸包', titleEn: 'Liquid Glass Wallpaper Pack', descZh: '4K 壁纸合集', descEn: '4K Wallpaper Collection', image: traImg('Abstract glass wallpaper, colorful blurred blobs, modern aesthetic'), url: '#', source: '本站原创' },
];

export function loadResources(): ResourceItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_ITEMS));
      return [...DEFAULT_ITEMS];
    }
    return JSON.parse(raw) as ResourceItem[];
  } catch {
    return [...DEFAULT_ITEMS];
  }
}

function persist(list: ResourceItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function saveResource(item: ResourceItem) {
  const list = loadResources();
  const idx = list.findIndex((r) => r.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  persist(list);
}

export function removeResource(id: string) {
  persist(loadResources().filter((r) => r.id !== id));
}

export function useResources(): ResourceItem[] {
  const [items, setItems] = useState<ResourceItem[]>(() => loadResources());
  useEffect(() => {
    const refresh = () => setItems(loadResources());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return items;
}

// ===== 自定义分类（内置 RESOURCE_GROUPS 之外的用户新增分类） =====

const GROUPS_KEY = 'blog-resource-groups';
const GROUPS_EVENT = 'resource-groups-updated';

function loadCustomGroups(): ResourceGroup[] {
  try {
    return JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]') as ResourceGroup[];
  } catch {
    return [];
  }
}

export function loadResourceGroups(): ResourceGroup[] {
  return [...RESOURCE_GROUPS, ...loadCustomGroups()];
}

function persistCustomGroups(list: ResourceGroup[]) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(GROUPS_EVENT));
}

/** 新增自定义分类，返回新分类 key；名称重复时返回 null */
export function addResourceGroup(zh: string, en: string): string | null {
  const trimmed = zh.trim();
  if (!trimmed) return null;
  const existing = loadResourceGroups();
  if (existing.some((g) => g.zh === trimmed || g.en.trim() === en.trim())) return null;
  const key = `g-${Date.now()}`;
  persistCustomGroups([...loadCustomGroups(), { key, zh: trimmed, en: en.trim() || trimmed }]);
  return key;
}

/** 删除自定义分类，并连带删除该分类下的所有资源 */
export function removeResourceGroup(key: string) {
  if (RESOURCE_GROUPS.some((g) => g.key === key)) return;
  persistCustomGroups(loadCustomGroups().filter((g) => g.key !== key));
  persist(loadResources().filter((r) => r.groupKey !== key));
}

export function useResourceGroups(): ResourceGroup[] {
  const [groups, setGroups] = useState<ResourceGroup[]>(() => loadResourceGroups());
  useEffect(() => {
    const refresh = () => setGroups(loadResourceGroups());
    window.addEventListener(GROUPS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(GROUPS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return groups;
}

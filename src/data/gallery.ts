import { useEffect, useState } from 'react';

const traeImg = (p: string, s = 'square') =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(p)}&image_size=${s}`;

export interface Art {
  id: number | string;
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
  category?: string;
}

export interface Category {
  id: string;
  zh: string;
  en: string;
}

const KEY = 'blog-gallery-arts';
const EVENT = 'gallery-updated';

const CAT_KEY = 'blog-gallery-categories';
const CAT_EVENT = 'gallery-categories-updated';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'humanities', zh: '人文', en: 'Humanities' },
  { id: 'landscape', zh: '风景', en: 'Landscape' },
];

const DEFAULT_ARTS: Art[] = [
  {
    id: 1,
    titleZh: '雾散时',
    titleEn: 'When the Fog Lifts',
    artistZh: '林',
    artistEn: 'Lin',
    year: '2026',
    mediumZh: '数字绘画',
    mediumEn: 'Digital painting',
    descZh: '清晨的雾从山谷里退去，像一场缓慢的退潮。光是最后才到的。',
    descEn: 'Morning fog retreats from the valley like a slow ebb. Light arrives last.',
    url: traeImg('A misty mountain valley at dawn, fog lifting to reveal layered ridges, soft golden light breaking through, ethereal atmospheric painting, cool and warm tones', 'portrait_4_3'),
    w: 1,
    category: 'landscape',
  },
  {
    id: 2,
    titleZh: '液态记忆',
    titleEn: 'Liquid Memory',
    artistZh: '林',
    artistEn: 'Lin',
    year: '2026',
    mediumZh: '生成艺术',
    mediumEn: 'Generative art',
    descZh: '把一段三分钟的回忆喂给算法，它吐出了一张像玻璃碎片拼成的脸。',
    descEn: 'Fed a three-minute memory to the algorithm; it returned a face like glass shards.',
    url: traeImg('Abstract liquid glass sculpture resembling a fragmented human face, shards of translucent colored glass, refracted light, dark background, surreal digital art', 'square'),
    w: 1.2,
    category: 'humanities',
  },
  {
    id: 3,
    titleZh: '夜行列车',
    titleEn: 'Night Train',
    artistZh: '林',
    artistEn: 'Lin',
    year: '2025',
    mediumZh: '摄影',
    mediumEn: 'Photography',
    descZh: '车窗外是飞驰的灯火，每一盏都像在跟谁告别。',
    descEn: 'Lights streak past the window of a night train, each like a farewell.',
    url: traeImg('View from a moving night train window, blurred city lights streaking past, reflections on glass, moody cinematic photography, deep blues and warm yellows', 'landscape_16_9'),
    w: 0.7,
    category: 'humanities',
  },
  {
    id: 4,
    titleZh: '无题 No.7',
    titleEn: 'Untitled No.7',
    artistZh: '林',
    artistEn: 'Lin',
    year: '2025',
    mediumZh: '丙烯',
    mediumEn: 'Acrylic',
    descZh: '画到第七张的时候，我发现颜色自己在说话，我只是负责不挡路。',
    descEn: 'By the seventh canvas I realized color speaks for itself; my job was to not get in the way.',
    url: traeImg('Bold abstract acrylic painting, thick brushstrokes in indigo, crimson and gold, raw texture, expressive, modern art gallery aesthetic', 'square'),
    w: 1,
    category: 'humanities',
  },
  {
    id: 5,
    titleZh: '雨季的手记',
    titleEn: 'Notes from the Rainy Season',
    artistZh: '林',
    artistEn: 'Lin',
    year: '2025',
    mediumZh: '水彩',
    mediumEn: 'Watercolor',
    descZh: '在京都的小寺里画的。纸被雨打湿了，颜色洇开，比我计划的更好。',
    descEn: 'Painted in a small Kyoto temple. Rain soaked the paper; the colors bled better than I planned.',
    url: traeImg('Delicate watercolor painting of a Kyoto temple in rain, soft bleeding colors, wet paper texture, muted greens and greys, serene, loose brushwork', 'portrait_4_3'),
    w: 1.1,
    category: 'landscape',
  },
  {
    id: 6,
    titleZh: '蓝色房间',
    titleEn: 'The Blue Room',
    artistZh: '林',
    artistEn: 'Lin',
    year: '2024',
    mediumZh: '数字绘画',
    mediumEn: 'Digital painting',
    descZh: '一个人住的房间，连蓝色都是孤独的形状。',
    descEn: 'A room for one — even the blue is shaped like loneliness.',
    url: traeImg('A solitary room bathed in deep blue light, a single chair by a window, minimal interior, melancholic atmosphere, Hopper-esque, digital painting', 'landscape_4_3'),
    w: 0.85,
    category: 'humanities',
  },
  {
    id: 7,
    titleZh: '折叠的午后',
    titleEn: 'A Folded Afternoon',
    artistZh: '林',
    artistEn: 'Lin',
    year: '2024',
    mediumZh: '拼贴',
    mediumEn: 'Collage',
    descZh: '把三张不同年代的旧报纸叠在一起剪，剪出来的下午是折过的。',
    descEn: 'Layering three old newspapers from different eras, the afternoon I cut out came pre-folded.',
    url: traeImg('A layered paper collage with vintage newspaper textures, folded edges, sepia and muted tones, abstract composition, tactile material art', 'square'),
    w: 1,
    category: 'humanities',
  },
  {
    id: 8,
    titleZh: '光的语言',
    titleEn: 'The Language of Light',
    artistZh: '林',
    artistEn: 'Lin',
    year: '2024',
    mediumZh: '摄影',
    mediumEn: 'Photography',
    descZh: '给一束光拍证件照。它不肯坐好。',
    descEn: 'A passport photo for a beam of light. It would not sit still.',
    url: traeImg('A single dramatic beam of light entering a dark room through a window, dust particles visible in the light, minimalist, high contrast, fine art photography', 'portrait_16_9'),
    w: 0.6,
    category: 'landscape',
  },
];

const SEED_CATEGORY: Record<string, string> = {
  '1': 'landscape', '2': 'humanities', '3': 'humanities', '4': 'humanities',
  '5': 'landscape', '6': 'humanities', '7': 'humanities', '8': 'landscape',
};

export function loadArts(): Art[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_ARTS));
      return [...DEFAULT_ARTS];
    }
    const list = JSON.parse(raw) as Art[];
    return list.map((a) => (a.category === undefined ? { ...a, category: SEED_CATEGORY[String(a.id)] ?? '' } : a));
  } catch {
    return [...DEFAULT_ARTS];
  }
}

function persist(list: Art[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function saveArt(art: Art) {
  const list = loadArts();
  const idx = list.findIndex((a) => String(a.id) === String(art.id));
  if (idx >= 0) list[idx] = art;
  else list.unshift(art);
  persist(list);
}

export function removeArt(id: number | string) {
  persist(loadArts().filter((a) => String(a.id) !== String(id)));
}

export function newArtId(): number {
  return Date.now();
}

export function useGalleryArts(): Art[] {
  const [arts, setArts] = useState<Art[]>(() => loadArts());
  useEffect(() => {
    const refresh = () => setArts(loadArts());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return arts;
}

/** 把本地图片文件压缩后转为 data URL，用于 localStorage 存储 */
export function fileToDataUrl(file: File, maxSide = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(type, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- categories ---------- */

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    if (!raw) {
      localStorage.setItem(CAT_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return [...DEFAULT_CATEGORIES];
    }
    const list = JSON.parse(raw) as Category[];
    return Array.isArray(list) ? list : [...DEFAULT_CATEGORIES];
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

function persistCategories(list: Category[]) {
  localStorage.setItem(CAT_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(CAT_EVENT));
}

export function addCategory(cat: Omit<Category, 'id'> & { id?: string }): Category {
  const list = loadCategories();
  const id = cat.id || `cat-${Date.now()}`;
  const created: Category = { id, zh: cat.zh.trim(), en: (cat.en || cat.zh).trim() };
  if (!created.zh) return list.find((c) => c.id === id) ?? created;
  list.push(created);
  persistCategories(list);
  return created;
}

export function removeCategory(id: string) {
  persistCategories(loadCategories().filter((c) => c.id !== id));
  persist(loadArts().map((a) => (a.category === id ? { ...a, category: '' } : a)));
}

export function newCategoryId(): string {
  return `cat-${Date.now()}`;
}

export function useGalleryCategories(): Category[] {
  const [cats, setCats] = useState<Category[]>(() => loadCategories());
  useEffect(() => {
    const refresh = () => setCats(loadCategories());
    window.addEventListener(CAT_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CAT_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return cats;
}

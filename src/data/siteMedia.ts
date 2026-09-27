import { useEffect, useState } from 'react';

export interface SiteMedia {
  bgType: 'default' | 'image' | 'video';
  bgUrl: string;
  musicUrl: string;
  hiMusicUrl: string;
}

type MediaUrlField = 'bgUrl' | 'musicUrl' | 'hiMusicUrl';

const KEY = 'blog-site-media';
const EVENT = 'site-media-updated';
const DB_NAME = 'blog-site-media';
const DB_STORE = 'files';
// localStorage 只保存 local:<id> 指针，文件本体放进 IndexedDB，因此不受 ~5MB 配额限制
const LOCAL_PREFIX = 'local:';

const URL_FIELDS: MediaUrlField[] = ['bgUrl', 'musicUrl', 'hiMusicUrl'];

export const DEFAULT_SITE_MEDIA: SiteMedia = {
  bgType: 'default',
  bgUrl: '',
  musicUrl: '',
  hiMusicUrl: '',
};

export function isLocalMediaRef(ref: string): boolean {
  return ref.startsWith(LOCAL_PREFIX);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) {
        request.result.createObjectStore(DB_STORE);
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function runTx<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(DB_STORE, mode);
        const request = work(tx.objectStore(DB_STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(request.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
        tx.onabort = () => {
          db.close();
          reject(tx.error);
        };
      })
  );
}

const blobUrls = new Map<string, string>();

function releaseBlobUrl(ref: string) {
  const url = blobUrls.get(ref);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrls.delete(ref);
  }
}

function displayable(ref: string): string {
  if (!isLocalMediaRef(ref)) return ref;
  // 尚未解析出 blob 地址前返回空串，避免把 local: 指针当作 src
  return blobUrls.get(ref) ?? '';
}

export function loadSiteMedia(): SiteMedia {
  try {
    return { ...DEFAULT_SITE_MEDIA, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULT_SITE_MEDIA };
  }
}

export function saveSiteMedia(media: SiteMedia) {
  const previous = loadSiteMedia();
  try {
    localStorage.setItem(KEY, JSON.stringify(media));
  } catch {
    throw new Error('QUOTA_EXCEEDED');
  }
  // 回收被替换或清除的本地文件，避免 IndexedDB 里堆积无用大文件
  for (const field of URL_FIELDS) {
    const old = previous[field];
    if (isLocalMediaRef(old) && !URL_FIELDS.some((f) => media[f] === old)) {
      releaseBlobUrl(old);
      void idbDelete(old.slice(LOCAL_PREFIX.length)).catch(() => undefined);
    }
  }
  resolvedCache = null;
  window.dispatchEvent(new CustomEvent(EVENT));
}

async function idbPut(id: string, blob: Blob): Promise<void> {
  await runTx('readwrite', (store) => store.put(blob, id));
}

async function idbGet(id: string): Promise<Blob | undefined> {
  return runTx('readonly', (store) => store.get(id));
}

async function idbDelete(id: string): Promise<void> {
  await runTx('readwrite', (store) => store.delete(id));
}

async function idbClear(): Promise<void> {
  await runTx('readwrite', (store) => store.clear());
}

/** 把文件存进 IndexedDB，返回可写入 SiteMedia 的 local:<id> 引用。不限制文件大小。 */
export async function saveLocalMediaFile(file: File): Promise<string> {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  await idbPut(id, file);
  return `${LOCAL_PREFIX}${id}`;
}

const pending = new Map<string, Promise<string>>();

/** 把存储值解析成可直接赋给 src 的地址（链接原样返回，本地引用转 blob: 地址）。 */
export function resolveMediaUrl(ref: string): Promise<string> {
  if (!ref || !isLocalMediaRef(ref)) return Promise.resolve(ref);
  const cached = blobUrls.get(ref);
  if (cached) return Promise.resolve(cached);
  let inflight = pending.get(ref);
  if (!inflight) {
    inflight = idbGet(ref.slice(LOCAL_PREFIX.length)).then(
      (blob) => {
        pending.delete(ref);
        if (!blob) return '';
        const url = URL.createObjectURL(blob);
        blobUrls.set(ref, url);
        return url;
      },
      () => {
        pending.delete(ref);
        return '';
      }
    );
    pending.set(ref, inflight);
  }
  return inflight;
}

let resolvedCache: SiteMedia | null = null;

function seedFrom(raw: SiteMedia): SiteMedia {
  return {
    bgType: raw.bgType,
    bgUrl: displayable(raw.bgUrl),
    musicUrl: displayable(raw.musicUrl),
    hiMusicUrl: displayable(raw.hiMusicUrl),
  };
}

function seedMedia(): SiteMedia {
  if (resolvedCache) return resolvedCache;
  return seedFrom(loadSiteMedia());
}

async function resolveMedia(raw: SiteMedia): Promise<SiteMedia> {
  const [bgUrl, musicUrl, hiMusicUrl] = await Promise.all(URL_FIELDS.map((f) => resolveMediaUrl(raw[f])));
  return { bgType: raw.bgType, bgUrl, musicUrl, hiMusicUrl };
}

// 模块加载即开始读取本地上传的媒体，缩短首帧回退到默认背景的窗口
void resolveMedia(loadSiteMedia()).then((resolved) => {
  resolvedCache = resolved;
});

export function useSiteMedia(): SiteMedia {
  const [media, setMedia] = useState<SiteMedia>(seedMedia);
  useEffect(() => {
    let alive = true;
    const refresh = () => {
      const raw = loadSiteMedia();
      setMedia(seedFrom(raw));
      void resolveMedia(raw).then((resolved) => {
        if (!alive) return;
        resolvedCache = resolved;
        setMedia(resolved);
      });
    };
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      alive = false;
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return media;
}

/** 清空 IndexedDB 里所有本地上传的媒体文件（配合「清除所有本地数据」使用）。 */
export async function clearLocalMediaFiles(): Promise<void> {
  blobUrls.forEach((url) => URL.revokeObjectURL(url));
  blobUrls.clear();
  resolvedCache = null;
  await idbClear();
}

let hiAudio: HTMLAudioElement | null = null;

export function playHiMusic(url: string) {
  stopHiMusic();
  if (!url) return;
  hiAudio = new Audio(url);
  hiAudio.loop = true;
  hiAudio.volume = 0.6;
  hiAudio.play().catch(() => {});
}

export function stopHiMusic() {
  if (hiAudio) {
    hiAudio.pause();
    hiAudio = null;
  }
}

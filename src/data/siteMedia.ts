import { useEffect, useState } from 'react';

export interface SiteMedia {
  bgType: 'default' | 'image' | 'video';
  bgUrl: string;
  musicUrl: string;
  hiMusicUrl: string;
}

const KEY = 'blog-site-media';
const EVENT = 'site-media-updated';

export const DEFAULT_SITE_MEDIA: SiteMedia = {
  bgType: 'default',
  bgUrl: '',
  musicUrl: '',
  hiMusicUrl: '',
};

export function loadSiteMedia(): SiteMedia {
  try {
    return { ...DEFAULT_SITE_MEDIA, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULT_SITE_MEDIA };
  }
}

export function saveSiteMedia(media: SiteMedia) {
  try {
    localStorage.setItem(KEY, JSON.stringify(media));
  } catch {
    throw new Error('QUOTA_EXCEEDED');
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useSiteMedia(): SiteMedia {
  const [media, setMedia] = useState<SiteMedia>(loadSiteMedia);
  useEffect(() => {
    const refresh = () => setMedia(loadSiteMedia());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return media;
}

// data URLs inflate ~33%; keep uploaded files small enough for the ~5MB localStorage quota
const MAX_FILE_BYTES = 2.5 * 1024 * 1024;

export function fileToMediaDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error('FILE_TOO_LARGE'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('READ_FAILED'));
    reader.readAsDataURL(file);
  });
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

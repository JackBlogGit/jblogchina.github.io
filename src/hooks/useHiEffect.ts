import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getHiShatter } from '../utils/hiShatterBus';
import { loadSiteMedia, playHiMusic, stopHiMusic, resolveMediaUrl } from '../data/siteMedia';
import type { Lang, Theme } from '../context/AppContext';

const MELODY = [
  { freq: 523.25, dur: 0.18 },
  { freq: 587.33, dur: 0.18 },
  { freq: 659.25, dur: 0.18 },
  { freq: 698.46, dur: 0.18 },
  { freq: 783.99, dur: 0.36 },
  { freq: 659.25, dur: 0.18 },
  { freq: 783.99, dur: 0.36 },
  { freq: 1046.5, dur: 0.36 },
  { freq: 880.0, dur: 0.18 },
  { freq: 783.99, dur: 0.18 },
  { freq: 698.46, dur: 0.18 },
  { freq: 659.25, dur: 0.18 },
  { freq: 587.33, dur: 0.18 },
  { freq: 523.25, dur: 0.54 },
];

const DURATION_MS = 30_000;
const FLICKER_MS = 20_000;
const THEME_STEP_MS = 800;
const LANG_STEP_MS = 1600;

function playSynthMusic(): { stop: () => void } {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return { stop: () => {} };

  const ctx = new Ctx();
  const melodyDur = MELODY.reduce((s, n) => s + n.dur, 0);
  const loops = Math.ceil(DURATION_MS / 1000 / melodyDur);

  for (let loop = 0; loop < loops; loop++) {
    let t = ctx.currentTime + loop * melodyDur;
    for (const note of MELODY) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = note.freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur * 0.9);
      osc.start(t);
      osc.stop(t + note.dur);
      t += note.dur;
    }
  }

  const stop = () => {
    try {
      ctx.close();
    } catch {
      // already closed
    }
  };

  setTimeout(stop, DURATION_MS + 500);
  return { stop };
}

export function useHiEffect() {
  const { theme, setTheme, toggleTheme, lang, setLang, toggleLang } = useApp();
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const synthRef = useRef<{ stop: () => void } | null>(null);
  const snapshotRef = useRef<{ theme: Theme; lang: Lang }>({ theme, lang });

  const clearSchedules = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    timeoutsRef.current = [];
  }, []);

  const haltMusic = useCallback(() => {
    stopHiMusic();
    synthRef.current?.stop();
    synthRef.current = null;
  }, []);

  const finish = useCallback(() => {
    activeRef.current = false;
    clearSchedules();
    haltMusic();
    getHiShatter()?.stop();
    document.documentElement.classList.remove('hi-shake-active');
    setTheme(snapshotRef.current.theme);
    setLang(snapshotRef.current.lang);
    setActive(false);
  }, [clearSchedules, haltMusic, setLang, setTheme]);

  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  const trigger = useCallback(() => {
    if (active) return;
    snapshotRef.current = { theme, lang };
    activeRef.current = true;
    setActive(true);
    document.documentElement.classList.add('hi-shake-active');

    void resolveMediaUrl(loadSiteMedia().hiMusicUrl).then((url) => {
      if (!activeRef.current) return;
      if (url) playHiMusic(url);
      else synthRef.current = playSynthMusic();
    });

    getHiShatter()?.start(DURATION_MS);

    intervalsRef.current.push(setInterval(toggleTheme, THEME_STEP_MS));
    intervalsRef.current.push(setInterval(toggleLang, LANG_STEP_MS));

    // Flicker phase ends, glass keeps breaking, then everything restores
    timeoutsRef.current.push(
      setTimeout(() => {
        intervalsRef.current.forEach(clearInterval);
        intervalsRef.current = [];
      }, FLICKER_MS)
    );
    timeoutsRef.current.push(setTimeout(() => finishRef.current(), DURATION_MS));
  }, [active, lang, theme, toggleLang, toggleTheme]);

  useEffect(() => {
    return () => {
      if (activeRef.current) {
        finishRef.current();
        return;
      }
      clearSchedules();
      haltMusic();
      document.documentElement.classList.remove('hi-shake-active');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(() => {
    if (active) finish();
    else trigger();
  }, [active, finish, trigger]);

  return { active, trigger, stop: finish, toggle };
}

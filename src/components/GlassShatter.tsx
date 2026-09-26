import { useCallback, useEffect, useRef } from 'react';
import { registerHiShatter } from '../utils/hiShatterBus';
import type { HiShatterHandle } from '../utils/hiShatterBus';

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotSpeed: number;
  points: { x: number; y: number }[];
  time: number;
  life: number;
  fade: number;
}

interface Crack {
  x: number;
  y: number;
  time: number;
  life: number;
  fade: number;
  lines: { dx: number; dy: number; offsetX: number; offsetY: number }[];
}

interface ScheduledEvent {
  time: number;
  run: () => void;
}

interface BurstOptions {
  cracks: number;
  shards: number;
  crackLife: number;
  crackFade: number;
  shardLife: number;
  shardFade: number;
  spread: number;
}

const CLICK_BURST: Partial<BurstOptions> = {
  crackLife: 300,
  crackFade: 500,
  shardLife: 700,
  shardFade: 500,
};

export default function GlassShatter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shardsRef = useRef<Shard[]>([]);
  const cracksRef = useRef<Crack[]>([]);
  const queueRef = useRef<ScheduledEvent[]>([]);
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();

    if (queueRef.current.some((q) => q.time <= now)) {
      const due = queueRef.current.filter((q) => q.time <= now);
      queueRef.current = queueRef.current.filter((q) => q.time > now);
      due.forEach((q) => q.run());
    }

    // Draw and update cracks
    cracksRef.current = cracksRef.current.filter((crack) => {
      const age = now - crack.time;
      if (age > crack.life + crack.fade) return false;
      const progress = Math.min(age / 300, 1);
      const alpha = age < crack.life ? 1 : Math.max(0, 1 - (age - crack.life) / crack.fade);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 4;

      crack.lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(crack.x, crack.y);
        const endX = crack.x + line.dx * progress;
        const endY = crack.y + line.dy * progress;
        const midX = crack.x + line.dx * 0.5 + line.offsetX;
        const midY = crack.y + line.dy * 0.5 + line.offsetY;
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
      });

      ctx.restore();
      return true;
    });

    // Draw and update shards
    shardsRef.current = shardsRef.current.filter((shard) => {
      const age = now - shard.time;
      if (age > shard.life + shard.fade) return false;

      const t = age / 1000;
      const x = shard.x + shard.vx * t;
      const y = shard.y + shard.vy * t + 0.5 * 400 * t * t;
      const rotation = shard.rotSpeed * t;
      const alpha = age < shard.life ? 1 : Math.max(0, 1 - (age - shard.life) / shard.fade);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;

      // Glass shard
      ctx.beginPath();
      ctx.moveTo(shard.points[0].x, shard.points[0].y);
      for (let i = 1; i < shard.points.length; i++) {
        ctx.lineTo(shard.points[i].x, shard.points[i].y);
      }
      ctx.closePath();

      const gradient = ctx.createLinearGradient(-8, -8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
      return true;
    });

    if (shardsRef.current.length > 0 || cracksRef.current.length > 0 || queueRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  const spawnBurst = useCallback((x: number, y: number, options: Partial<BurstOptions> = {}) => {
    const cfg: BurstOptions = {
      cracks: 8 + Math.floor(Math.random() * 6),
      shards: 12 + Math.floor(Math.random() * 8),
      spread: 1,
      ...CLICK_BURST,
      ...options,
    } as BurstOptions;

    const now = performance.now();

    // Generate crack lines radiating from the impact point
    const crackLines: Crack['lines'] = [];
    for (let i = 0; i < cfg.cracks; i++) {
      const angle = (Math.PI * 2 * i) / cfg.cracks + (Math.random() - 0.5) * 0.5;
      const len = (40 + Math.random() * 80) * cfg.spread;
      crackLines.push({
        dx: Math.cos(angle) * len,
        dy: Math.sin(angle) * len,
        offsetX: (Math.random() - 0.5) * 20 * cfg.spread,
        offsetY: (Math.random() - 0.5) * 20 * cfg.spread,
      });
    }
    if (cfg.cracks > 0) {
      cracksRef.current.push({
        x,
        y,
        time: now,
        life: cfg.crackLife,
        fade: cfg.crackFade,
        lines: crackLines,
      });
    }

    // Generate flying shards
    for (let i = 0; i < cfg.shards; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (60 + Math.random() * 180) * cfg.spread;
      const size = 3 + Math.random() * 10;
      const numPoints = 3 + Math.floor(Math.random() * 3);
      const points: { x: number; y: number }[] = [];
      for (let p = 0; p < numPoints; p++) {
        const a = (Math.PI * 2 * p) / numPoints + (Math.random() - 0.5) * 0.6;
        const r = size * (0.5 + Math.random() * 0.5);
        points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }

      shardsRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        rotSpeed: (Math.random() - 0.5) * 8,
        points,
        time: now,
        life: cfg.shardLife,
        fade: cfg.shardFade,
      });
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      const glassEl = target.closest('.glass');
      if (!glassEl) return;

      spawnBurst(e.clientX, e.clientY);
    };

    window.addEventListener('click', handleClick);

    // One-shot progressive shatter driven by the Hi effect timeline
    const handle: HiShatterHandle = {
      start(durationMs) {
        const now = performance.now();
        const w = canvas.width;
        const h = canvas.height;
        const rnd = (a: number, b: number) => a + Math.random() * (b - a);
        const breakStart = durationMs * 0.68;
        const breakEnd = durationMs * 0.94;
        queueRef.current = [];

        // Smash: single hard impact
        const impactX = rnd(w * 0.25, w * 0.75);
        const impactY = rnd(h * 0.22, h * 0.5);
        queueRef.current.push({
          time: now,
          run: () =>
            spawnBurst(impactX, impactY, {
              cracks: 16,
              shards: 24,
              spread: 1.6,
              crackLife: breakEnd,
              crackFade: 1200,
              shardLife: 900,
              shardFade: 700,
            }),
        });

        // Cracks creep across the page, denser over time
        const spreadCount = 18;
        for (let i = 0; i < spreadCount; i++) {
          const delay = 1200 + (i / spreadCount) * (breakStart - 1600);
          const x = rnd(w * 0.06, w * 0.94);
          const y = rnd(h * 0.08, h * 0.92);
          queueRef.current.push({
            time: now + delay,
            run: () =>
              spawnBurst(x, y, {
                cracks: 7 + Math.floor(i / 2),
                shards: i > spreadCount / 2 ? 6 : 0,
                spread: 0.7 + (i / spreadCount) * 0.6,
                crackLife: Math.max(600, breakEnd - delay),
                crackFade: 1200,
                shardLife: 900,
                shardFade: 700,
              }),
          });
        }

        // Break apart: flakes peel off the existing cracks, wave by wave
        const waveCount = 12;
        for (let i = 0; i < waveCount; i++) {
          const delay = breakStart + (i / waveCount) * (breakEnd - breakStart - 1500);
          queueRef.current.push({
            time: now + delay,
            run: () => {
              const count = 8 + i * 6;
              const sites = cracksRef.current;
              for (let k = 0; k < count; k++) {
                const site = sites.length
                  ? sites[Math.floor(Math.random() * sites.length)]
                  : { x: rnd(0, w), y: rnd(0, h) };
                spawnBurst(site.x + rnd(-30, 30), site.y + rnd(-30, 30), {
                  cracks: 0,
                  shards: 1,
                  spread: 1.1,
                  shardLife: 500,
                  shardFade: 900,
                });
              }
            },
          });
        }

        // Final collapse: the whole sheet shatters at once
        queueRef.current.push({
          time: now + breakEnd,
          run: () => {
            for (let k = 0; k < 90; k++) {
              spawnBurst(rnd(0, w), rnd(0, h * 0.85), {
                cracks: 0,
                shards: 1,
                spread: 1.5,
                shardLife: 600,
                shardFade: 1200,
              });
            }
          },
        });

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
      },
      stop() {
        queueRef.current = [];
        cracksRef.current.forEach((c) => {
          c.life = 0;
        });
        shardsRef.current.forEach((s) => {
          s.life = 0;
        });
        if (cracksRef.current.length || shardsRef.current.length) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(animate);
        }
      },
    };
    registerHiShatter(handle);

    return () => {
      registerHiShatter(null);
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(rafRef.current);
      queueRef.current = [];
    };
  }, [animate, spawnBurst]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}

const BOT_UA =
  /\b(bot|crawl|spider|slurp|fetch|lwp|curl|wget|python|scrapy|httpclient|java\/|go-http|node-fetch|axios|headless|phantomjs|selenium|puppeteer|playwright)|gptbot|claudebot|ccbot|bytespider|diffbot|dataforseosb|semrush|ahrefs|mj12bot|dotbot|petalbot|applebot|amazonbot|blessdeck|blexbot|cohere-ai|perplexitybot|you\.com|metachan|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot/i;

export interface GuardEnv {
  userAgent: string;
  referrer: string;
  dev: boolean;
}

function realEnv(): GuardEnv {
  return { userAgent: navigator.userAgent, referrer: document.referrer, dev: import.meta.env.DEV };
}

/** 允许的同源/本地来源；其余站点的 Referer 视为盗链 */
function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.origin === location.origin || url.hostname === location.hostname) return true;
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function hotlinked(referrer: string): boolean {
  if (!referrer) return false; // 直接访问 / 无 Referer：交由服务端策略
  try {
    return !isAllowedOrigin(new URL(referrer).origin);
  } catch {
    return false;
  }
}

function stripImages() {
  document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    if (img.dataset.guarded === '1') return;
    img.dataset.guarded = '1';
    img.removeAttribute('src');
    img.removeAttribute('srcset');
    img.style.visibility = 'hidden';
  });
}

function shieldImages() {
  const block = (e: Event) => {
    const el = e.target as HTMLElement;
    if (el && (el.tagName === 'IMG' || el.closest('img'))) e.preventDefault();
  };
  document.addEventListener('contextmenu', block, true);
  document.addEventListener('dragstart', block, true);

  const guard = (img: HTMLImageElement) => {
    if (img.dataset.shielded === '1') return;
    img.dataset.shielded = '1';
    img.draggable = false;
  };
  document.querySelectorAll<HTMLImageElement>('img').forEach(guard);
  new MutationObserver(() => {
    document.querySelectorAll<HTMLImageElement>('img:not([data-shielded])').forEach(guard);
  }).observe(document.documentElement, { childList: true, subtree: true });
}

function showBlockedNotice() {
  const box = document.createElement('div');
  box.setAttribute(
    'data-hotlink-blocked',
    '1',
  );
  box.setAttribute(
    'style',
    [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'flex-direction:column',
      'gap:12px',
      'padding:24px',
      'text-align:center',
      'background:#0b0d12',
      'color:#e8ebf2',
      "font-family:system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif",
    ].join(';'),
  );
  box.innerHTML =
    '<div style="font-size:22px;font-weight:700">本站已阻止该访问</div>' +
    '<div style="font-size:14px;opacity:.7;line-height:1.8">资源防盗链保护中，请从本站正常访问。</div>';
  document.documentElement.appendChild(box);
}

/** 全站防盗链 + 防爬虫基线防护（前端层，真正拦截以服务端为准） */
export function runSiteGuard(env: GuardEnv) {
  shieldImages();

  if (BOT_UA.test(env.userAgent)) {
    stripImages();
    document.documentElement.dataset.crawler = '1';
    return 'crawler' as const;
  }

  // Referer 校验只在构建产物中生效，避免本地预览被误伤
  if (!env.dev && hotlinked(env.referrer)) {
    stripImages();
    showBlockedNotice();
    return 'hotlink' as const;
  }
  return 'pass' as const;
}

export function startSiteGuard() {
  return runSiteGuard(realEnv());
}

if (import.meta.env.DEV) {
  // 本地自测：/assets/site-guard.selftest.ts 由测试脚本调用 runSiteGuard 注入假环境
  (window as unknown as { __siteGuard?: unknown }).__siteGuard = {
    runSiteGuard,
    hotlinked,
    isBot: (ua: string) => BOT_UA.test(ua),
    env: realEnv,
  };
}

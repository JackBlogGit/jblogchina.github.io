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

/** 正常访客来源：搜索引擎 / 社交与 IM 分享 / 社区与代码托管 / 网页邮箱，命中即放行 */
const TRUSTED_REFERRER_HOSTS = [
  'google.', 'bing.', 'baidu.', 'sogou.', 'so.com', 'sm.cn', 'duckduckgo.', 'yahoo.', 'yandex.', 'ecosia.', 'search.brave.',
  'weibo.', 'weixin.qq.com', 'qq.com', 't.me', 'telegram.', 'discord.', 'slack.', 'messenger.com', 'threads.net',
  'facebook.', 'instagram.', 'twitter.com', 'x.com', 't.co', 'wa.me', 'linkedin.', 'reddit.com', 'youtube.com',
  'github.', 'github.io', 'gitlab.', 'gitee.', 'zhihu.', 'bilibili.', 'juejin.', 'csdn.', 'segmentfault.', 'v2ex.',
  'medium.com', 'dev.to', 'stackoverflow.',
  'mail.', 'gmail.', 'outlook.live.', '163.com', '126.com',
];

function isTrustedReferrer(referrer: string): boolean {
  try {
    const url = new URL(referrer);
    // file: / 浏览器扩展页 / about: 等没有真实站点，不算盗链
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return true;
    return TRUSTED_REFERRER_HOSTS.some((d) => host.includes(d));
  } catch {
    return true; // about:blank、null 之类解析不出来的来源，不误伤正常访客
  }
}

function hotlinked(referrer: string): boolean {
  if (!referrer) return false; // 直接访问 / 无 Referer：交由服务端策略
  try {
    if (isAllowedOrigin(new URL(referrer).origin)) return false;
  } catch {
    return false;
  }
  return !isTrustedReferrer(referrer);
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

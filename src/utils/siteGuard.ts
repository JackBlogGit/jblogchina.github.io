const BOT_UA =
  /\b(bot|crawl|spider|slurp|fetch|lwp|curl|wget|python|scrapy|httpclient|java\/|go-http|node-fetch|axios|headless|phantomjs|selenium|puppeteer|playwright)|gptbot|claudebot|ccbot|bytespider|diffbot|dataforseosb|semrush|ahrefs|mj12bot|dotbot|petalbot|applebot|amazonbot|blessdeck|blexbot|cohere-ai|perplexitybot|you\.com|metachan|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot/i;

export interface GuardEnv {
  userAgent: string;
}

function realEnv(): GuardEnv {
  return { userAgent: navigator.userAgent };
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

/** 全站防爬虫基线防护（前端层，真正拦截以服务端为准）；不按访问来源拦截 */
export function runSiteGuard(env: GuardEnv) {
  shieldImages();

  if (BOT_UA.test(env.userAgent)) {
    stripImages();
    document.documentElement.dataset.crawler = '1';
    return 'crawler' as const;
  }
  return 'pass' as const;
}

export function startSiteGuard() {
  return runSiteGuard(realEnv());
}

if (import.meta.env.DEV) {
  // 本地自测：dev 环境下控制台调用 runSiteGuard({ userAgent }) 注入假 UA 验证分支
  (window as unknown as { __siteGuard?: unknown }).__siteGuard = {
    runSiteGuard,
    isBot: (ua: string) => BOT_UA.test(ua),
    env: realEnv,
  };
}

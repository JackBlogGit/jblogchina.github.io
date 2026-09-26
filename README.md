# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## 防盗链与防爬虫

分三层，从「威慑」到「真正拦截」：

1. 前端守卫 `src/utils/siteGuard.ts`（在 `src/main.tsx` 中启动）
   - 识别到爬虫 UA / headless 工具时隐藏全部图片，并给 `<html>` 打 `data-crawler="1"`；
   - 构建产物中校验 `document.referrer`，非本站来源直接剥除图片并显示拦截页（dev 环境不生效，避免本地预览被误伤）；
   - 全站图片禁用拖拽保存与右键菜单（自动覆盖后续渲染出的 `<img>`）。
   本地自测：dev 环境下浏览器控制台可用 `window.__siteGuard.runSiteGuard({ userAgent, referrer, dev })` 注入假环境，验证 `crawler` / `hotlink` / `pass` 三条分支。
2. 爬虫协议 `public/robots.txt`：默认 `Disallow: /`（同时关闭搜索引擎收录），并显式列出主流 AI 抓取器与国内爬虫。需要被收录时把首段改成只禁 `/admin`。
3. 服务端策略（真正的拦截，必须自己部署）
   - nginx：`deploy/nginx-security.conf` — Referer 白名单、UA 黑名单、`limit_req` 限速、`CORP/X-Frame-Options/X-Robots-Tag` 响应头。`include` 进站点 `server{}` 后把两处 `jblog.example.com` 换成真实域名，再 `nginx -t && nginx -s reload`。
   - Vercel：`deploy/vercel-security.json` — 只能设置安全响应头与缓存（Vercel 的 `headers` 不支持按 Referer/UA 条件拦截）。需要条件拦截时改用 nginx，或在 Cloudflare 上配 Referer/UA 规则集与 Rate Limiting。

注意：Referer 与 UA 都可伪造，纯前端方案只能挡住手动另存和低阶抓取；要真正防住盗链与批量爬虫，必须落到 nginx / CDN 层。

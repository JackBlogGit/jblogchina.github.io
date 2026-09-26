// 拼接 public/ 静态资源路径，兼容 GitHub Pages 子路径部署
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

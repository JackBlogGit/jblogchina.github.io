/** 删除保护密码：未单独设置时沿用管理登录密码 */

const DELETE_PW_KEY = 'blog-delete-password';
const ADMIN_PW_KEY = 'blog-admin-password';
const DEFAULT_ADMIN_PW = 'admin123';

export function getDeletePassword(): string {
  return localStorage.getItem(DELETE_PW_KEY) || localStorage.getItem(ADMIN_PW_KEY) || DEFAULT_ADMIN_PW;
}

export function setDeletePassword(pw: string) {
  if (pw) localStorage.setItem(DELETE_PW_KEY, pw);
  else localStorage.removeItem(DELETE_PW_KEY);
}

/** 弹窗校验删除密码；用户确认并输入正确返回 true */
export function confirmDeletePassword(t: (zh: string, en: string) => string): boolean {
  const input = window.prompt(t('请输入删除密码：', 'Enter the delete password:'));
  if (input === null) return false;
  if (input !== getDeletePassword()) {
    window.alert(t('密码错误，已取消删除', 'Wrong password, delete cancelled'));
    return false;
  }
  return true;
}

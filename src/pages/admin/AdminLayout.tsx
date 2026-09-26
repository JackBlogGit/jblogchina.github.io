import { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  Lock,
  RefreshCw,
  MessageSquare,
  Megaphone,
  Frame,
  Package,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { asset } from '../../utils/asset';

const MENU = [
  { to: '/admin', icon: LayoutDashboard, zh: '仪表盘', en: 'Dashboard' },
  { to: '/admin/articles', icon: FileText, zh: '文章管理', en: 'Articles' },
  { to: '/admin/tech', icon: Layers, zh: '技栈管理', en: 'Tech Stack' },
  { to: '/admin/messages', icon: MessageSquare, zh: '留言管理', en: 'Messages' },
  { to: '/admin/announcements', icon: Megaphone, zh: '公告/须知', en: 'Announcements' },
  { to: '/admin/gallery', icon: Frame, zh: '图展管理', en: 'Gallery' },
  { to: '/admin/resources', icon: Package, zh: '资源管理', en: 'Resources' },
  { to: '/admin/media', icon: ImageIcon, zh: '媒体库', en: 'Media' },
  { to: '/admin/settings', icon: Settings, zh: '设置', en: 'Settings' },
];

const AUTH_KEY = 'blog-admin-auth';
const PASSWORD_KEY = 'blog-admin-password';
const DEFAULT_PASSWORD = 'admin123';

function getPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
}

// 登录时记住输入的密码；每次打开后台子页面自动与当前管理密码比对校验
function checkAuth(): string | null {
  const saved = localStorage.getItem(AUTH_KEY);
  if (saved === null) return null;
  if (saved === getPassword()) return saved;
  localStorage.removeItem(AUTH_KEY);
  return null;
}

function setAuth(password: string) {
  localStorage.setItem(AUTH_KEY, password);
}

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCaptcha(len = 4): string {
  let code = '';
  for (let i = 0; i < len; i++) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return code;
}

function drawCaptcha(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#f0f2f5';
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `hsla(${Math.random() * 360}, 50%, 60%, 0.4)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.bezierCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h);
    ctx.stroke();
  }

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `hsla(${Math.random() * 360}, 50%, 50%, 0.5)`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  for (let i = 0; i < code.length; i++) {
    ctx.save();
    const x = 18 + i * 28;
    const y = h / 2 + (Math.random() * 8 - 4);
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.5);
    ctx.font = `bold ${20 + Math.random() * 6}px "Courier New", monospace`;
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.textBaseline = 'middle';
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }
}

function CaptchaCanvas({ code, onRefresh }: { code: string; onRefresh: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawCaptcha(canvasRef.current, code);
    }
  }, [code]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <canvas
        ref={canvasRef}
        width={140}
        height={44}
        style={{ borderRadius: 8, border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        onClick={onRefresh}
        title="点击刷新验证码"
      />
      <button
        type="button"
        onClick={onRefresh}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: '1px solid var(--border-subtle)',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}
        title="刷新验证码"
      >
        <RefreshCw size={15} />
      </button>
    </div>
  );
}

export default function AdminLayout() {
  const { t } = useApp();
  const location = useLocation();
  const [authPw, setAuthPw] = useState(checkAuth);
  const authed = authPw !== null;
  const [pw, setPw] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => randomCaptcha());
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<'pw' | 'captcha' | ''>('');

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(randomCaptcha());
    setCaptchaInput('');
  }, []);

  // 切换后台子页面 / 回到标签页时，自动校验已保存的密码是否仍然正确
  useEffect(() => {
    if (authPw !== null && authPw !== getPassword()) {
      localStorage.removeItem(AUTH_KEY);
      setAuthPw(null);
    }
  }, [authPw, location.pathname]);

  useEffect(() => {
    const verify = () => setAuthPw(checkAuth());
    window.addEventListener('focus', verify);
    return () => window.removeEventListener('focus', verify);
  }, []);

  if (!authed) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <div
          style={{
            width: 380,
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={22} style={{ color: 'var(--accent)' }} />
            </div>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 6, color: 'var(--text-primary)' }}>
            {t('管理员登录', 'Admin Login')}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24 }}>
            {t('请输入管理密码和验证码以继续', 'Enter password and captcha to continue')}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (captchaInput.toUpperCase() !== captchaCode) {
                setError(t('验证码错误', 'Wrong captcha'));
                setErrorField('captcha');
                refreshCaptcha();
                return;
              }
              if (pw !== getPassword()) {
                setError(t('密码错误', 'Wrong password'));
                setErrorField('pw');
                refreshCaptcha();
                return;
              }
              setAuth(pw);
              setAuthPw(pw);
              setError('');
            }}
          >
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(''); setErrorField(''); }}
              placeholder={t('管理密码', 'Admin password')}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--hover-bg, #f9fafb)',
                border: `1px solid ${error && errorField === 'pw' ? '#ef4444' : 'var(--border-subtle)'}`,
                borderRadius: 10,
                fontSize: 15,
                outline: 'none',
                color: 'var(--text-primary)',
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            <div style={{ marginBottom: error ? 8 : 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <input
                  value={captchaInput}
                  onChange={(e) => { setCaptchaInput(e.target.value.toUpperCase()); setError(''); setErrorField(''); }}
                  placeholder={t('验证码', 'Captcha')}
                  maxLength={4}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'var(--hover-bg, #f9fafb)',
                    border: `1px solid ${error && errorField === 'captcha' ? '#ef4444' : 'var(--border-subtle)'}`,
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                    letterSpacing: '0.15em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                />
                <CaptchaCanvas code={captchaCode} onRefresh={refreshCaptcha} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {t('点击图片或刷新按钮更换验证码', 'Click image or refresh button to change captcha')}
              </p>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 16 }}>{error}</p>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('登录', 'Login')}
            </button>
          </form>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
            {t('默认密码: admin123（可在设置中修改）', 'Default: admin123 (changeable in Settings)')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: 'var(--sidebar-bg, #1a1a2e)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '0 20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            <img
              src={asset('/logo.png')}
              alt="Jack logo"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                objectFit: 'cover',
                background: '#fff',
              }}
            />
            {t('Jblog 后台', 'Jblog Admin')}
          </Link>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {MENU.map((item) => {
            const active = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                <item.icon size={18} />
                {t(item.zh, item.en)}
              </Link>
            );
          })}
        </nav>

        {/* Logout + Back */}
        <div style={{ padding: '0 12px', borderTop: '1px solid var(--border-subtle)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => {
              localStorage.removeItem(AUTH_KEY);
              setAuthPw(null);
              setPw('');
              setCaptchaInput('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              color: 'var(--text-muted)',
              fontSize: 14,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Lock size={18} />
            {t('锁定后台', 'Lock admin')}
          </button>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              fontSize: 14,
            }}
          >
            <ChevronLeft size={18} />
            {t('返回前台', 'Back to site')}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}

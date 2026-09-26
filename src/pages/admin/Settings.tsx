import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Globe, User, Link2, Palette, Check, Shield, Image as ImageIcon, Music, Upload, Trash2 } from 'lucide-react';
import { setDeletePassword } from '../../data/deleteGuard';
import { useApp } from '../../context/AppContext';
import { useSiteMedia, saveSiteMedia, fileToMediaDataUrl } from '../../data/siteMedia';
import type { SiteMedia } from '../../data/siteMedia';

interface BlogSettings {
  blogTitleZh: string;
  blogTitleEn: string;
  authorName: string;
  authorBioZh: string;
  authorBioEn: string;
  github: string;
  twitter: string;
  email: string;
  website: string;
  wechat: string;
  qq: string;
  bilibili: string;
  wechatGroup: string;
  qqGroup: string;
  wechatMp: string;
  defaultTheme: 'light' | 'dark' | 'system';
  defaultLang: 'zh' | 'en';
}

const SETTINGS_KEY = 'blog-settings';

const defaultSettings: BlogSettings = {
  blogTitleZh: 'Jblog',
  blogTitleEn: 'Jblog',
  authorName: 'Lin',
  authorBioZh: '设计师 / 前端开发者 / 旅行者。相信好的界面应该像液态玻璃——透明、有形、流动。',
  authorBioEn: 'Designer / Frontend Developer / Traveler. Believes good interfaces should be like liquid glass.',
  github: '',
  twitter: '',
  email: '',
  website: '',
  wechat: '',
  qq: '',
  bilibili: '',
  wechatGroup: '',
  qqGroup: '',
  wechatMp: '',
  defaultTheme: 'system',
  defaultLang: 'zh',
};

function loadSettings(): BlogSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...defaultSettings, ...saved };
  } catch {
    return { ...defaultSettings };
  }
}

export default function Settings() {
  const { t, setTheme, setLang } = useApp();
  const [settings, setSettings] = useState<BlogSettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [delPw, setDelPw] = useState('');
  const [delPwMsg, setDelPwMsg] = useState('');
  const media = useSiteMedia();
  const [mediaMsg, setMediaMsg] = useState('');
  const [bgUrlDraft, setBgUrlDraft] = useState(media.bgUrl);
  const [musicUrlDraft, setMusicUrlDraft] = useState(media.musicUrl);
  const [hiUrlDraft, setHiUrlDraft] = useState(media.hiMusicUrl);

  const showMediaMsg = (msg: string) => {
    setMediaMsg(msg);
    setTimeout(() => setMediaMsg(''), 2500);
  };

  const patchMedia = (p: Partial<SiteMedia>) => {
    try {
      saveSiteMedia({ ...media, ...p });
      showMediaMsg(t('已保存并生效', 'Saved & applied'));
    } catch {
      showMediaMsg(t('保存失败：浏览器存储空间不足，请改用更小的文件或链接', 'Save failed: browser storage full — use a smaller file or a link'));
    }
  };

  const uploadMedia = async (file: File, kind: 'image' | 'video' | 'music' | 'hi') => {
    try {
      const dataUrl = await fileToMediaDataUrl(file);
      if (kind === 'image') patchMedia({ bgType: 'image', bgUrl: dataUrl });
      else if (kind === 'video') patchMedia({ bgType: 'video', bgUrl: dataUrl });
      else if (kind === 'music') {
        patchMedia({ musicUrl: dataUrl });
        setMusicUrlDraft('');
      } else {
        patchMedia({ hiMusicUrl: dataUrl });
        setHiUrlDraft('');
      }
    } catch {
      showMediaMsg(t('文件过大（单个上限约 2.5MB）或读取失败', 'File too large (~2.5MB limit) or read failed'));
    }
  };

  const update = <K extends keyof BlogSettings>(key: K, value: BlogSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setDirty(true);
  };

  const handleSave = useCallback(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.defaultTheme !== 'system') {
      setTheme(settings.defaultTheme);
    }
    setLang(settings.defaultLang);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2000);
  }, [settings, setTheme, setLang]);

  const handleReset = () => {
    setSettings({ ...defaultSettings });
    localStorage.removeItem(SETTINGS_KEY);
    setDirty(false);
  };

  // Ctrl+S / Cmd+S 保存快捷键
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: 'var(--text-secondary)',
  };

  const sectionStyle: React.CSSProperties = {
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  };

  const solidBtnStyle: React.CSSProperties = {
    padding: '10px 16px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  const ghostBtnStyle: React.CSSProperties = {
    ...solidBtnStyle,
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
  };

  const audioRow = (
    label: string,
    url: string,
    draft: string,
    setDraft: (v: string) => void,
    onApply: (v: string) => void,
    onUpload: (f: File) => void,
    onClear: () => void,
  ) => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://.../music.mp3"
          style={{ ...inputStyle, flex: 1, minWidth: 220 }}
        />
        <button onClick={() => draft.trim() && onApply(draft.trim())} style={solidBtnStyle}>
          {t('应用链接', 'Apply link')}
        </button>
        <label style={ghostBtnStyle}>
          <Upload size={14} />
          {t('本地上传', 'Upload')}
          <input
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = '';
            }}
          />
        </label>
        {url && (
          <button onClick={onClear} style={ghostBtnStyle}>
            <Trash2 size={14} />
            {t('清除', 'Clear')}
          </button>
        )}
      </div>
      {url && <audio controls src={url} style={{ width: '100%', marginTop: 10, height: 36 }} />}
    </div>
  );

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t('设置', 'Settings')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 16px',
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-secondary)',
              fontSize: 14,
            }}
          >
            <RotateCcw size={16} />
            {t('重置默认', 'Reset')}
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 16px',
              background: saved ? '#10b981' : 'var(--accent)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              transition: 'background 0.3s',
            }}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? t('已保存', 'Saved') : `${t('保存设置', 'Save')} (Ctrl+S)`}
          </button>
        </div>
      </div>

      {/* Blog Info */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <Globe size={18} style={{ color: 'var(--accent)' }} />
          {t('博客信息', 'Blog Info')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>{t('博客名称（中文）', 'Blog name (Chinese)')}</label>
            <input
              value={settings.blogTitleZh}
              onChange={(e) => update('blogTitleZh', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('博客名称（英文）', 'Blog name (English)')}</label>
            <input
              value={settings.blogTitleEn}
              onChange={(e) => update('blogTitleEn', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Author */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <User size={18} style={{ color: 'var(--accent)' }} />
          {t('作者信息', 'Author')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>{t('作者名', 'Author name')}</label>
              <input
                value={settings.authorName}
                onChange={(e) => update('authorName', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div />
          </div>
          <div>
            <label style={labelStyle}>{t('作者简介（中文）', 'Author bio (Chinese)')}</label>
            <textarea
              value={settings.authorBioZh}
              onChange={(e) => update('authorBioZh', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('作者简介（英文）', 'Author bio (English)')}</label>
            <textarea
              value={settings.authorBioEn}
              onChange={(e) => update('authorBioEn', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <Link2 size={18} style={{ color: 'var(--accent)' }} />
          {t('社交链接', 'Social Links')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>GitHub</label>
            <input
              value={settings.github}
              onChange={(e) => update('github', e.target.value)}
              placeholder="https://github.com/username"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Twitter / X</label>
            <input
              value={settings.twitter}
              onChange={(e) => update('twitter', e.target.value)}
              placeholder="https://twitter.com/username"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('邮箱', 'Email')}</label>
            <input
              value={settings.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="hello@example.com"
              type="email"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('个人网站', 'Website')}</label>
            <input
              value={settings.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://mysite.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('微信', 'WeChat')}</label>
            <input
              value={settings.wechat}
              onChange={(e) => update('wechat', e.target.value)}
              placeholder={t('微信号，如：my_wechat_id', 'WeChat ID, e.g. my_wechat_id')}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>QQ</label>
            <input
              value={settings.qq}
              onChange={(e) => update('qq', e.target.value)}
              placeholder={t('QQ号', 'QQ number')}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Bilibili</label>
            <input
              value={settings.bilibili}
              onChange={(e) => update('bilibili', e.target.value)}
              placeholder="https://space.bilibili.com/xxxxx"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('微信群', 'WeChat Group')}</label>
            <input
              value={settings.wechatGroup}
              onChange={(e) => update('wechatGroup', e.target.value)}
              placeholder={t('微信群名称 / 入群方式', 'Group name / how to join')}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('QQ群', 'QQ Group')}</label>
            <input
              value={settings.qqGroup}
              onChange={(e) => update('qqGroup', e.target.value)}
              placeholder={t('QQ群号', 'QQ group number')}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('微信服务号', 'WeChat Service Account')}</label>
            <input
              value={settings.wechatMp}
              onChange={(e) => update('wechatMp', e.target.value)}
              placeholder={t('服务号名称 / 微信号', 'Service account name / WeChat ID')}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Display */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <Palette size={18} style={{ color: 'var(--accent)' }} />
          {t('显示设置', 'Display')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>{t('默认主题', 'Default theme')}</label>
            <select
              value={settings.defaultTheme}
              onChange={(e) => update('defaultTheme', e.target.value as BlogSettings['defaultTheme'])}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="system">{t('跟随系统', 'System')}</option>
              <option value="light">{t('浅色', 'Light')}</option>
              <option value="dark">{t('深色', 'Dark')}</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t('默认语言', 'Default language')}</label>
            <select
              value={settings.defaultLang}
              onChange={(e) => update('defaultLang', e.target.value as BlogSettings['defaultLang'])}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="zh">{t('中文', 'Chinese')}</option>
              <option value="en">{t('英文', 'English')}</option>
            </select>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          {t('修改默认设置后需点击「保存设置」（或按 Ctrl+S）才会生效。当前会话的主题和语言会立即切换。', 'Changes take effect after clicking "Save" (or pressing Ctrl+S). Current session theme and language switch immediately.')}
        </p>
      </div>

      {/* Background & Music */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <ImageIcon size={18} style={{ color: 'var(--accent)' }} />
          {t('背景与音乐', 'Background & Music')}
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -12, marginBottom: 16 }}>
          {t('本区块修改后立即生效。本地上传的文件存入浏览器（单个约 2.5MB 以内），较大的媒体建议使用链接。', 'This section applies immediately. Uploaded files are stored in your browser (~2.5MB each); use links for larger media.')}
        </p>
        {mediaMsg && (
          <p style={{ fontSize: 12, color: /失败|过大|failed|large/.test(mediaMsg) ? '#ef4444' : '#10b981', marginTop: -8, marginBottom: 12 }}>
            {mediaMsg}
          </p>
        )}

        {/* Background */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('背景类型', 'Background type')}</label>
          <select
            value={media.bgType}
            onChange={(e) => patchMedia({ bgType: e.target.value as SiteMedia['bgType'] })}
            style={{ ...inputStyle, width: 160, cursor: 'pointer' }}
          >
            <option value="default">{t('默认视频', 'Default video')}</option>
            <option value="image">{t('图片', 'Image')}</option>
            <option value="video">{t('视频', 'Video')}</option>
          </select>
          <label style={ghostBtnStyle}>
            <Upload size={14} />
            {media.bgType === 'video' ? t('上传视频', 'Upload video') : media.bgType === 'image' ? t('上传图片', 'Upload image') : t('上传图片/视频', 'Upload image/video')}
            <input
              type="file"
              accept={media.bgType === 'video' ? 'video/*' : media.bgType === 'image' ? 'image/*' : 'image/*,video/*'}
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadMedia(f, f.type.startsWith('video/') ? 'video' : 'image');
                e.target.value = '';
              }}
            />
          </label>
          {media.bgUrl && (
            <button
              onClick={() => {
                patchMedia({ bgType: 'default', bgUrl: '' });
                setBgUrlDraft('');
              }}
              style={ghostBtnStyle}
            >
              <Trash2 size={14} />
              {t('恢复默认', 'Reset')}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={bgUrlDraft}
            onChange={(e) => setBgUrlDraft(e.target.value)}
            placeholder="https://.../bg.jpg / bg.mp4"
            style={{ ...inputStyle, flex: 1, minWidth: 240 }}
          />
          <button
            onClick={() => {
              const v = bgUrlDraft.trim();
              if (!v) return;
              const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(v);
              patchMedia({ bgType: isVideo ? 'video' : 'image', bgUrl: v });
            }}
            style={solidBtnStyle}
          >
            {t('应用链接', 'Apply link')}
          </button>
          {media.bgType === 'image' && media.bgUrl && (
            <img src={media.bgUrl} alt="" style={{ width: 140, height: 88, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
          )}
          {media.bgType === 'video' && media.bgUrl && (
            <video src={media.bgUrl} muted style={{ width: 140, height: 88, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
          )}
        </div>

        {/* Musics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          <Music size={16} style={{ color: 'var(--accent)' }} />
          {t('音乐设置', 'Music')}
        </div>
        {audioRow(
          t('网站音乐（前台工具栏播放按钮）', 'Site music (frontend toolbar player)'),
          media.musicUrl,
          musicUrlDraft,
          setMusicUrlDraft,
          (v) => patchMedia({ musicUrl: v }),
          (f) => uploadMedia(f, 'music'),
          () => {
            patchMedia({ musicUrl: '' });
            setMusicUrlDraft('');
          },
        )}
        {audioRow(
          t('「嗨一下」音乐（嗨一下激活时播放30秒）', 'Hi-shake music (plays for 30s while active)'),
          media.hiMusicUrl,
          hiUrlDraft,
          setHiUrlDraft,
          (v) => patchMedia({ hiMusicUrl: v }),
          (f) => uploadMedia(f, 'hi'),
          () => {
            patchMedia({ hiMusicUrl: '' });
            setHiUrlDraft('');
          },
        )}
      </div>

      {/* Security */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <Shield size={18} style={{ color: 'var(--accent)' }} />
          {t('安全设置', 'Security')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>{t('修改管理密码', 'Change admin password')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setPwMsg(''); }}
                placeholder={t('输入新密码', 'Enter new password')}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => {
                  if (newPw.trim().length < 4) {
                    setPwMsg(t('密码至少 4 个字符', 'Password must be at least 4 characters'));
                    return;
                  }
                  localStorage.setItem('blog-admin-password', newPw.trim());
                  if (localStorage.getItem('blog-admin-auth') !== null) {
                    localStorage.setItem('blog-admin-auth', newPw.trim());
                  }
                  setNewPw('');
                  setPwMsg(t('密码已更新', 'Password updated'));
                  setTimeout(() => setPwMsg(''), 2000);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('更新', 'Update')}
              </button>
            </div>
            {pwMsg && (
              <p style={{ fontSize: 12, color: pwMsg.includes('已') || pwMsg.includes('updated') ? '#10b981' : '#ef4444', marginTop: 6 }}>
                {pwMsg}
              </p>
            )}
          </div>
          <div>
            <label style={labelStyle}>{t('删除文章密码', 'Article delete password')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                value={delPw}
                onChange={(e) => { setDelPw(e.target.value); setDelPwMsg(''); }}
                placeholder={t('输入删除密码（留空则沿用管理密码）', 'Delete password (empty = admin password)')}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => {
                  const v = delPw.trim();
                  if (v && v.length < 4) {
                    setDelPwMsg(t('密码至少 4 个字符', 'Password must be at least 4 characters'));
                    return;
                  }
                  setDeletePassword(v);
                  setDelPw('');
                  setDelPwMsg(v ? t('删除密码已设置', 'Delete password set') : t('已清除，沿用管理密码', 'Cleared, using admin password'));
                  setTimeout(() => setDelPwMsg(''), 2000);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('保存', 'Save')}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {t(
                `删除文章（含批量删除）时需输入此密码；当前${localStorage.getItem('blog-delete-password') ? '已单独设置' : '沿用管理登录密码'}。`,
                `Deleting articles (incl. batch) requires this password; currently ${localStorage.getItem('blog-delete-password') ? 'set separately' : 'the admin login password is reused'}.`
              )}
            </p>
            {delPwMsg && (
              <p style={{ fontSize: 12, color: delPwMsg.includes('已') ? '#10b981' : '#ef4444', marginTop: 6 }}>
                {delPwMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Data management */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
          {t('数据管理', 'Data')}
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const data = {
                settings: loadSettings(),
                articles: localStorage.getItem('blog-published-articles'),
                media: localStorage.getItem('blog-media-library'),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `blog-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 20px',
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              color: 'var(--text-secondary)',
            }}
          >
            {t('导出所有数据', 'Export all data')}
          </button>
          <button
            onClick={() => {
              if (confirm(t('确定要清除所有本地数据吗？此操作不可撤销。', 'Clear all local data? This cannot be undone.'))) {
                localStorage.removeItem('blog-published-articles');
                localStorage.removeItem('blog-media-library');
                localStorage.removeItem('blog-site-media');
                localStorage.removeItem(SETTINGS_KEY);
                window.location.reload();
              }
            }}
            style={{
              padding: '10px 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              color: '#ef4444',
              fontWeight: 600,
            }}
          >
            {t('清除所有本地数据', 'Clear all local data')}
          </button>
        </div>
      </div>

      {/* 未保存修改的悬浮保存条 */}
      {dirty && !saved && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 12px 10px 20px',
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--accent)',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            zIndex: 50,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {t('有未保存的修改', 'You have unsaved changes')}
          </span>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <Save size={14} />
            {t('保存设置', 'Save')} (Ctrl+S)
          </button>
        </div>
      )}
    </div>
  );
}

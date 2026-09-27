import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  BookOpen,
  Compass,
  Layers,
  Palette,
  Languages,
  Search,
  MessageSquare,
  ShieldAlert,
  Copyright,
  Cpu,
  ArrowUpRight,
  Info,
  Megaphone,
} from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { useDevice } from '../hooks/useDevice';
import { useAnnouncements } from '../data/announcements';
import { asset } from '../utils/asset';

const BANNER = asset('/images/site-info-banner.png');

const NOTICE_PARAGRAPHS = [
  {
    zh: '本网站创立于 2026 年 8 月 1 日，于 2026 年 9 月 26 日正式上线。',
    en: 'This site was founded on Aug 1, 2026, and officially launched on Sep 26, 2026.',
  },
  {
    zh: '网站资源均为作者整理网络资源与部分原创。若本站资源有所侵犯，可联系作者进行处理。',
    en: 'All resources are curated from the web by the author, with some original content. If anything here infringes your rights, please contact the author for handling.',
  },
  {
    zh: '图展、原创资源等可免费用于非商业使用；若用于商业使用，可联系作者。',
    en: 'The gallery, original resources and similar content may be used free of charge for non-commercial purposes; for commercial use, please contact the author.',
  },
  {
    zh: '注：若本站资源有问题，均与作者无关。',
    en: 'Note: any issues with resources on this site are not the author’s liability.',
  },
  {
    zh: '本站服务器为短期租用，如有不便，望谅解，其它问题可联系作者。感谢大家支持。',
    en: 'The server is rented on a short-term basis — please forgive any inconvenience. For other questions, contact the author. Thanks for your support!',
  },
];

interface Section {
  icon: ReactNode;
  titleZh: string;
  titleEn: string;
  body: { zh: string; en: string }[];
}

const SECTIONS: Section[] = [
  {
    icon: <Compass size={20} />,
    titleZh: '浏览指南',
    titleEn: 'Navigation',
    body: [
      {
        zh: '顶部导航栏包含六个板块：首页、作者志、技栈、图展、资源、留言。点击任意板块即可切换页面，页面间使用平滑的液态玻璃转场动画。',
        en: 'The top nav has six sections: Home, Journal, Stack, Gallery, Resources, Messages. Click any to switch pages with a smooth liquid-glass transition.',
      },
      {
        zh: '首页右侧是归档栏，可按年月快速定位历史文章；顶部搜索框支持全站标题检索。',
        en: 'The right sidebar on Home archives posts by year and month; the search bar at top matches titles across the site.',
      },
    ],
  },
  {
    icon: <Layers size={20} />,
    titleZh: '内容板块',
    titleEn: 'Content Sections',
    body: [
      {
        zh: '作者志：随想与随笔，记录生活与思考的碎片。',
        en: 'Journal: essays and musings — fragments of life and thought.',
      },
      {
        zh: '技栈：技术文章与开发工具，聚焦前端、动效与工程实践。',
        en: 'Stack: technical writing and dev tools — frontend, animation, engineering.',
      },
      {
        zh: '图展：摄影与视觉作品，偏爱安静的光线与季节的色彩。',
        en: 'Gallery: photography and visual work — quiet light and seasonal color.',
      },
      {
        zh: '资源：整理好的清单、链接与推荐。',
        en: 'Resources: curated lists, links and recommendations.',
      },
    ],
  },
  {
    icon: <Palette size={20} />,
    titleZh: '主题与外观',
    titleEn: 'Theme & Appearance',
    body: [
      {
        zh: '右上角的圆形按钮可切换浅色 / 深色模式，选择会被记住，下次访问自动应用。',
        en: 'The round button at the top right toggles light / dark mode. Your choice is remembered and applied on next visit.',
      },
      {
        zh: '整站采用液态玻璃（backdrop-filter 模糊 + 边框高光）设计语言，力求透明、有形、流动。',
        en: 'The site uses the Liquid Glass language (backdrop-filter blur + rim light) — transparent, tangible, flowing.',
      },
    ],
  },
  {
    icon: <Languages size={20} />,
    titleZh: '双语支持',
    titleEn: 'Bilingual',
    body: [
      {
        zh: '导航栏的中 / EN 按钮在中英文之间切换整站界面文案。文章正文提供中英双语内容。',
        en: 'The 中 / EN button in the nav switches the whole UI between Chinese and English. Articles provide bilingual content.',
      },
    ],
  },
  {
    icon: <Search size={20} />,
    titleZh: '搜索与归档',
    titleEn: 'Search & Archive',
    body: [
      {
        zh: '首页顶部搜索框输入关键词后回车，可跳转到主题页查看匹配结果。',
        en: 'Type a keyword in the Home search box and press Enter to jump to the topics page with matching results.',
      },
      {
        zh: '首页右侧归档栏按月份折叠展示所有文章，点击月份可展开 / 收起。',
        en: 'The Home archive lists all posts grouped by month — click a month to expand or collapse it.',
      },
    ],
  },
];

export default function SiteInfo() {
  const { t } = useApp();
  const { isMobile } = useDevice();
  const notices = useAnnouncements().filter((a) => a.kind === 'notice').slice(0, 5);

  return (
    <div
      style={{
        padding: isMobile ? '12px 14px 32px' : '12px 24px 40px 80px',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Hero banner */}
        <AnimateIn>
          <div className="glass" style={{ borderRadius: 20, overflow: 'hidden', padding: 0, marginBottom: 28 }}>
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 6',
                background: `url(${BANNER}) center/cover`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 65%)',
                }}
              />
              <div style={{ position: 'absolute', bottom: 24, left: 28 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  <Info size={14} />
                  {t('网站需知', 'Site Guide')}
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  {t('关于本站的一切', 'Everything about this site')}
                </h1>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Intro */}
        <AnimateIn delay={0.06}>
          <div className="glass" style={{ borderRadius: 18, padding: '24px 28px', marginBottom: 24 }}>
            {NOTICE_PARAGRAPHS.map((p, i) => (
              <p
                key={i}
                style={{
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  marginBottom: i === NOTICE_PARAGRAPHS.length - 1 ? 0 : 12,
                }}
              >
                {t(p.zh, p.en)}
              </p>
            ))}
          </div>
        </AnimateIn>

        {/* 最新须知（后台发布） */}
        {notices.length > 0 && (
          <AnimateIn delay={0.1}>
            <div className="glass" style={{ borderRadius: 18, padding: '24px 28px', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Megaphone size={18} />
                </span>
                {t('最新须知', 'Latest Notices')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notices.map((n) => (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }}>{n.date}</span>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>
                      {t(n.textZh, n.textEn)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
        )}

        {/* Sections */}
        {SECTIONS.map((sec, i) => (
          <AnimateIn key={i} delay={0.1 + i * 0.06}>
            <div className="glass" style={{ borderRadius: 18, padding: '24px 28px', marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--text-primary)',
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sec.icon}
                </span>
                {t(sec.titleZh, sec.titleEn)}
              </h2>
              {sec.body.map((p, j) => (
                <p
                  key={j}
                  style={{
                    fontSize: 14,
                    lineHeight: 1.85,
                    color: 'var(--text-secondary)',
                    marginBottom: j === sec.body.length - 1 ? 0 : 12,
                    paddingLeft: 14,
                    borderLeft: '2px solid var(--border-subtle)',
                  }}
                >
                  {t(p.zh, p.en)}
                </p>
              ))}
            </div>
          </AnimateIn>
        ))}

        {/*留言规则 + 版权 */}
        <AnimateIn delay={0.4}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="glass" style={{ borderRadius: 18, padding: '22px 24px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
                {t('留言规则', 'Message Rules')}
              </h2>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { zh: '友善交流，尊重他人观点。', en: 'Be kind and respect differing views.' },
                  { zh: '不发布广告、垃圾信息与人身攻击。', en: 'No spam, ads, or personal attacks.' },
                  { zh: '留言代表个人观点，与本站立场无关。', en: 'Messages reflect personal views, not the site.' },
                ].map((r, i) => (
                  <li key={i} style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    {t(r.zh, r.en)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass" style={{ borderRadius: 18, padding: '22px 24px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                <Copyright size={18} style={{ color: 'var(--accent)' }} />
                {t('版权与转载', 'Copyright')}
              </h2>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { zh: '原创内容采用 CC BY-NC-SA 4.0 许可。', en: 'Original content is licensed under CC BY-NC-SA 4.0.' },
                  { zh: '转载请注明出处并保留作者署名。', en: 'Reprint with attribution and author credit preserved.' },
                  { zh: '图片除标注外均为本站拍摄或生成。', en: 'Images are shot or generated by us unless noted.' },
                ].map((r, i) => (
                  <li key={i} style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    {t(r.zh, r.en)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnimateIn>

        {/* 技术栈说明 */}
        <AnimateIn delay={0.46}>
          <div className="glass" style={{ borderRadius: 18, padding: '22px 28px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <Cpu size={18} style={{ color: 'var(--accent)' }} />
              {t('技术说明', 'Under the Hood')}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              {t(
                '本站是一个纯前端应用：使用 React + TypeScript + Vite 构建，动效由 Framer Motion 驱动，界面通过 CSS 自定义属性实现主题切换。数据保存在浏览器本地，无需后端。',
                'This site is a pure frontend app: built with React + TypeScript + Vite, animated by Framer Motion, themed via CSS custom properties. Data lives in your browser — no backend required.'
              )}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['React', 'TypeScript', 'Vite', 'Framer Motion', 'CSS Variables', 'React Router'].map((tech) => (
                <span
                  key={tech}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 10,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* Quick links */}
        <AnimateIn delay={0.52}>
          <div className="glass" style={{ borderRadius: 18, padding: '22px 28px', marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <BookOpen size={18} style={{ color: 'var(--accent)' }} />
              {t('快速入口', 'Quick Links')}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { to: '/journal', zh: '作者志', en: 'Journal' },
                { to: '/tech', zh: '技栈', en: 'Stack' },
                { to: '/exhibition', zh: '图展', en: 'Gallery' },
                { to: '/resources', zh: '资源', en: 'Resources' },
                { to: '/announcements', zh: '公告栏', en: 'Announcements' },
                { to: '/message', zh: '留言', en: 'Messages' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {t(l.zh, l.en)}
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* Footer note */}
        <AnimateIn delay={0.58}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '16px 0 30px',
              color: 'var(--text-muted)',
            }}
          >
            <ShieldAlert size={15} />
            <p style={{ fontSize: 13, margin: 0 }}>
              {t('如有问题或建议，欢迎通过留言页联系我。', 'Questions or suggestions? Reach me via the message page.')}
            </p>
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}

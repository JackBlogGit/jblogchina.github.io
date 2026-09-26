import { motion } from 'framer-motion';
import { Feather, Code2, BookOpen, Camera, Coffee, MapPin, Mail, Heart } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { asset } from '../utils/asset';

const AVATAR = asset('/images/avatar.png');
const BANNER = asset('/images/about-banner.png');

export default function About() {
  const { t } = useApp();

  return (
    <div
      style={{
        padding: '12px 24px 40px 80px',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Hero banner */}
        <AnimateIn>
          <div className="glass" style={{ borderRadius: 20, overflow: 'hidden', padding: 0, marginBottom: 32 }}>
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
                  background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: 28,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <img
                  src={AVATAR}
                  alt="avatar"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.6)',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                    Jack
                  </h1>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, marginTop: 4 }}>
                    {t('孤独的旅行家 · 设计 / IT · 皮克工作室', 'The Lonely Traveler · Design / IT · Pike Studio')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Intro */}
        <AnimateIn delay={0.08}>
          <div className="glass" style={{ borderRadius: 18, padding: '28px 28px 24px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Feather size={18} style={{ color: 'var(--accent)' }} />
              {t('关于我', 'About Me')}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {[
                { k: t('作者', 'Author'), v: 'Jack' },
                { k: t('网名', 'Handle'), v: t('孤独的旅行家', 'The Lonely Traveler') },
                { k: t('生于', 'Born'), v: '2009' },
                { k: t('现状', 'Now'), v: t('现读高中', 'High school student') },
              ].map((it, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 10,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {it.k}：{it.v}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text-secondary)', marginBottom: 14 }}>
              {t(
                '从小接触设计与 IT 行业，曾为多家公司和机构做过设计海报与宣传图。',
                'I grew up around design and the IT industry, and have created posters and promotional artwork for a number of companies and organizations.'
              )}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text-secondary)', marginBottom: 14 }}>
              {t(
                '曾运营过多个 UP 主账号，但因学业原因最终以失败告终。',
                'I ran several bilibili creator accounts, but they eventually ended in failure because of my studies.'
              )}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text-secondary)' }}>
              {t(
                '2026 年 9 月 15 日开始筹划并创立皮克工作室，同年 9 月正式在 B 站建立皮克工作室。',
                'On Sep 15, 2026 I began planning and founding Pike Studio, which officially opened its bilibili presence in September 2026.'
              )}
            </p>
          </div>
        </AnimateIn>

        {/* What I do */}
        <AnimateIn delay={0.14}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              {
                icon: <Code2 size={20} />,
                titleZh: '开发',
                titleEn: 'Development',
                descZh: 'React / TypeScript / CSS 动画。关注性能与体验的平衡。',
                descEn: 'React / TypeScript / CSS Animation. Balancing performance and experience.',
              },
              {
                icon: <BookOpen size={20} />,
                titleZh: '写作',
                titleEn: 'Writing',
                descZh: '写技术也写生活。写作即思考，写着写着才想清楚。',
                descEn: 'Writing about tech and life. Writing is thinking — I figure things out as I write.',
              },
              {
                icon: <Camera size={20} />,
                titleZh: '摄影',
                titleEn: 'Photography',
                descZh: '偏爱秋天的京都、雨天的石板路、和安静的光线。',
                descEn: 'Autumn in Kyoto, rainy cobblestones, and quiet light.',
              },
              {
                icon: <Coffee size={20} />,
                titleZh: '日常',
                titleEn: 'Daily',
                descZh: '手冲咖啡、黑胶唱片、深夜散步。慢一点比较好。',
                descEn: 'Pour-over coffee, vinyl records, late-night walks. Slower is better.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass"
                style={{ borderRadius: 16, padding: '22px 20px' }}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <div style={{ color: 'var(--accent)', marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {t(item.titleZh, item.titleEn)}
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                  {t(item.descZh, item.descEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimateIn>

        {/* Tech stack highlight */}
        <AnimateIn delay={0.2}>
          <div className="glass" style={{ borderRadius: 18, padding: '24px 28px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Heart size={16} style={{ color: 'var(--accent)' }} />
              {t('常用工具', 'Toolkit')}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['React', 'TypeScript', 'Vite', 'Framer Motion', 'CSS', 'Tailwind', 'Node.js', 'Figma', 'VS Code', 'iTerm2', 'Obsidian'].map(
                (tech) => (
                  <span
                    key={tech}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>
        </AnimateIn>

        {/* Contact / social */}
        <AnimateIn delay={0.26}>
          <div className="glass" style={{ borderRadius: 18, padding: '24px 28px', marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} style={{ color: 'var(--accent)' }} />
              {t('找到我', 'Find Me')}
            </h2>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <MapPin size={16} />
                {t('中国', 'China')}
              </span>
              <a
                href="mailto:javamack@outlook.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Mail size={16} />
                javamack@outlook.com
              </a>
            </div>
          </div>
        </AnimateIn>

        {/* Footer quote */}
        <AnimateIn delay={0.32}>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', paddingBottom: 20 }}>
            {t(
              '"模糊让玻璃透明，边框让玻璃有形。"',
              '"Blur makes glass transparent; the border gives it form."'
            )}
          </p>
        </AnimateIn>
      </div>
    </div>
  );
}

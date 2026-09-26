import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Archive, Clock } from 'lucide-react';
import AnimateIn from '../components/AnimateIn';
import { useApp } from '../context/AppContext';
import { useArticles } from '../data/articles';

export default function Resources() {
  const { t } = useApp();
  const articles = useArticles();

  // group by year-month
  const groups: Record<string, typeof articles> = {};
  for (const a of articles) {
    const ym = a.date.slice(0, 7); // YYYY-MM
    (groups[ym] ??= []).push(a);
  }
  const keys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div style={{ padding: '12px 24px 40px 80px', height: '100%', overflowY: 'auto' }}>
      <AnimateIn>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Archive size={26} style={{ color: 'var(--accent)' }} />
          {t('归档', 'Archive')}
        </h1>
      </AnimateIn>
      <AnimateIn delay={0.08}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
          {t('按时间线浏览所有文章。', 'Browse all articles on a timeline.')}
        </p>
      </AnimateIn>

      <div style={{ position: 'relative', paddingLeft: 24 }}>
        {/* vertical line */}
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 8,
            bottom: 8,
            width: 2,
            background: 'linear-gradient(180deg, var(--accent), transparent)',
            opacity: 0.4,
          }}
        />

        {keys.map((ym, gi) => {
          const [y, m] = ym.split('-');
          return (
            <AnimateIn key={ym} delay={0.1 * gi} y={16}>
              <div style={{ marginBottom: 28, position: 'relative' }}>
                {/* dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: -23,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: '0 0 0 4px var(--accent-soft)',
                  }}
                />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {y} / {m}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {groups[ym].map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * gi + 0.05 * i }}
                    >
                      <Link to={`/article/${a.slug}`}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="glass"
                          style={{
                            padding: '12px 16px',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 32,
                              borderRadius: 8,
                              flexShrink: 0,
                              background: `url(${a.cover}) center/cover`,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{t(a.catZh, a.catEn)}</span>
                              <span>·</span>
                              <span>{a.date}</span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t(a.titleZh, a.titleEn)}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                            <Clock size={11} />
                            {a.readMin}{t('分', 'm')}
                          </span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>
    </div>
  );
}

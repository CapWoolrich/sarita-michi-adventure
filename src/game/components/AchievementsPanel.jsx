import { ACHIEVEMENTS } from '../achievements/achievements';

const TIER_COLORS = {
  bronze: { bg: 'linear-gradient(135deg,#e8a672,#c97746)', border: '#d2904f' },
  silver: { bg: 'linear-gradient(135deg,#e3e7ee,#a8b1c0)', border: '#9ba4b4' },
  gold: { bg: 'linear-gradient(135deg,#ffe79b,#e8b73a)', border: '#d8a83a' },
  platinum: { bg: 'linear-gradient(135deg,#d8c8ff,#a87fee)', border: '#9166e0' }
};

export default function AchievementsPanel({ isOpen, achievements, onClose }) {
  if (!isOpen) return null;
  const unlocked = achievements?.unlocked ?? {};
  const total = ACHIEVEMENTS.length;
  const earned = Object.keys(unlocked).length;
  const pct = Math.round((earned / total) * 100);

  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-collection-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <div>
            <h2>Logros</h2>
            <small>{earned} / {total} · {pct}%</small>
          </div>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>
        <div className="kw-collection-body">
          <div className="kw-ach-progress">
            <div className="kw-ach-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="kw-ach-grid">
            {ACHIEVEMENTS.map((a) => {
              const isUnlocked = !!unlocked[a.id];
              const tier = TIER_COLORS[a.tier] ?? TIER_COLORS.bronze;
              return (
                <div key={a.id} className={`kw-ach-card ${isUnlocked ? 'kw-ach-on' : 'kw-ach-off'}`}>
                  <div className="kw-ach-medal" style={{ background: tier.bg, borderColor: tier.border }}>
                    <span className="kw-ach-icon">{isUnlocked ? a.icon : '🔒'}</span>
                  </div>
                  <div className="kw-ach-meta">
                    <strong>{a.title}</strong>
                    <small>{a.desc}</small>
                    <span className={`kw-ach-tier kw-ach-tier-${a.tier}`}>{a.tier}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Toast que aparece cuando se desbloquea un logro */
export function AchievementToast({ achievement, onClose }) {
  if (!achievement) return null;
  const tier = TIER_COLORS[achievement.tier] ?? TIER_COLORS.bronze;
  return (
    <div className="kw-ach-toast" data-game-ui="true">
      <div className="kw-ach-toast-medal" style={{ background: tier.bg, borderColor: tier.border }}>
        <span>{achievement.icon}</span>
      </div>
      <div className="kw-ach-toast-meta">
        <small>¡Logro desbloqueado!</small>
        <strong>{achievement.title}</strong>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getTodayChallenge, isChallengeCompletedToday } from '../dailyChallenge';

export default function DailyChallengeBadge({ settings, onPlay }) {
  const [challenge, setChallenge] = useState(() => getTodayChallenge());
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const ms = tomorrow.getTime() - now.getTime();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setTimeUntilReset(`${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const completed = isChallengeCompletedToday(settings);

  return (
    <button
      className={`kw-daily-badge ${completed ? 'kw-daily-done' : ''}`}
      onClick={() => !completed && onPlay?.(challenge)}
      disabled={completed}
    >
      <div className="kw-daily-icon-wrap">
        <span className="kw-daily-icon">{challenge.rule.icon}</span>
        {completed && <span className="kw-daily-check">✓</span>}
      </div>
      <div className="kw-daily-meta">
        <span className="kw-daily-label">Reto del día</span>
        <strong>{challenge.rule.name}</strong>
        <small>{challenge.world.name} · +{challenge.rewardPoints} pts</small>
        <span className="kw-daily-timer">Próximo en {timeUntilReset}</span>
      </div>
    </button>
  );
}

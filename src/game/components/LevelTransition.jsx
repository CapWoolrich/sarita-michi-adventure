import { useEffect, useState } from 'react';

/**
 * Transición entre niveles:
 * 1. Card "¡Nivel Completado!" con stats (0..1.6s)
 * 2. Fade negro (1.6..2.2s)
 * 3. Pequeño delay con fly-through visual (2.2..3.0s)
 * 4. Llama onAdvance al final → carga el siguiente nivel
 */
export default function LevelTransition({ open, score, capturedCount, totalCats, targetScore, onAdvance }) {
  const [stage, setStage] = useState('hidden');

  useEffect(() => {
    if (!open) {
      setStage('hidden');
      return;
    }
    setStage('card');
    const t1 = setTimeout(() => setStage('fade'), 1600);
    const t2 = setTimeout(() => setStage('fly'), 2200);
    const t3 = setTimeout(() => {
      setStage('hidden');
      onAdvance?.();
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open, onAdvance]);

  if (stage === 'hidden') return null;

  const stars = score >= targetScore ? 3 : score >= targetScore * 0.75 ? 2 : 1;
  const allCaptured = capturedCount >= totalCats;

  return (
    <div className={`kw-level-transition kw-trans-${stage}`} data-game-ui="true">
      {(stage === 'card' || stage === 'fade') && (
        <div className="kw-trans-card">
          <div className="kw-trans-title">¡Nivel completado!</div>
          <div className="kw-trans-stars">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`kw-star ${s <= stars ? 'kw-star-on' : ''}`}>★</span>
            ))}
          </div>
          <div className="kw-trans-stats">
            <div className="kw-trans-stat">
              <span className="kw-trans-stat-icon">🐾</span>
              <span>{capturedCount}/{totalCats}</span>
              {allCaptured && <span className="kw-trans-perfect">PERFECTO</span>}
            </div>
            <div className="kw-trans-stat">
              <span className="kw-trans-stat-icon">⭐</span>
              <span>{score} pts</span>
            </div>
          </div>
          <div className="kw-trans-next">Preparando siguiente nivel…</div>
        </div>
      )}
      {(stage === 'fade' || stage === 'fly') && <div className="kw-trans-veil" />}
      {stage === 'fly' && (
        <div className="kw-trans-fly">
          <div className="kw-trans-fly-text">Avanzando…</div>
        </div>
      )}
    </div>
  );
}

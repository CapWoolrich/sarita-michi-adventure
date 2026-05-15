import { useEffect, useRef, useState } from 'react';

/**
 * Transición entre niveles estable y más corta.
 * Guardar onAdvance en ref evita que los timers se reinicien por renders del padre.
 */
export default function LevelTransition({ open, score, capturedCount, totalCats, targetScore, onAdvance }) {
  const [stage, setStage] = useState('hidden');
  const onAdvanceRef = useRef(onAdvance);

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    if (!open) {
      setStage('hidden');
      return undefined;
    }
    setStage('card');
    const t1 = setTimeout(() => setStage('fade'), 1200);
    const t2 = setTimeout(() => setStage('fly'), 1700);
    const t3 = setTimeout(() => {
      setStage('hidden');
      onAdvanceRef.current?.();
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open]);

  if (stage === 'hidden') return null;

  const stars = score >= targetScore ? 3 : score >= targetScore * 0.75 ? 2 : 1;
  const allCaptured = totalCats === 0 ? true : capturedCount >= totalCats;

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

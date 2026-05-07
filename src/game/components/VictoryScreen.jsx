import { useEffect } from 'react';

/**
 * Pantalla de victoria al completar el último mundo.
 * Opciones: Subir dificultad / Modo endless / Volver al inicio.
 */
export default function VictoryScreen({
  isOpen,
  totalScore,
  totalCats,
  goldenCats,
  achievementsEarned,
  currentDifficulty,
  onUpgradeDifficulty,
  onStartEndless,
  onHome
}) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const nextDifficulty = currentDifficulty === 'easy' ? 'medium' : currentDifficulty === 'medium' ? 'hard' : null;
  const nextDiffLabel = nextDifficulty === 'medium' ? 'Medio' : nextDifficulty === 'hard' ? 'Difícil' : null;
  const nextDiffIcon = nextDifficulty === 'medium' ? '🌟' : nextDifficulty === 'hard' ? '🔥' : null;

  return (
    <div className="kw-victory-overlay" data-game-ui="true">
      <div className="kw-victory-fireworks">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="kw-fw" style={{ '--i': i, '--delay': `${(i * 0.15) % 2}s` }}>
            {['✨', '🎉', '🌟', '🎊', '💫'][i % 5]}
          </span>
        ))}
      </div>
      <div className="kw-victory-card">
        <div className="kw-victory-trophy">🏆</div>
        <h1 className="kw-victory-title">¡Aventura Completa!</h1>
        <p className="kw-victory-subtitle">Rescataste a todos los michis del reino kawaii</p>

        <div className="kw-victory-stats">
          <div className="kw-victory-stat">
            <span className="kw-victory-stat-icon">⭐</span>
            <span className="kw-victory-stat-value">{totalScore.toLocaleString()}</span>
            <span className="kw-victory-stat-label">Puntos totales</span>
          </div>
          <div className="kw-victory-stat">
            <span className="kw-victory-stat-icon">🐾</span>
            <span className="kw-victory-stat-value">{totalCats}</span>
            <span className="kw-victory-stat-label">Michis rescatados</span>
          </div>
          <div className="kw-victory-stat">
            <span className="kw-victory-stat-icon">✨</span>
            <span className="kw-victory-stat-value">{goldenCats}</span>
            <span className="kw-victory-stat-label">Dorados</span>
          </div>
          <div className="kw-victory-stat">
            <span className="kw-victory-stat-icon">🏆</span>
            <span className="kw-victory-stat-value">{achievementsEarned}/11</span>
            <span className="kw-victory-stat-label">Logros</span>
          </div>
        </div>

        <div className="kw-victory-actions">
          {nextDifficulty && (
            <button className="kw-victory-primary" onClick={() => onUpgradeDifficulty(nextDifficulty)}>
              <span style={{ fontSize: 26 }}>{nextDiffIcon}</span>
              <span>
                <strong>Subir a {nextDiffLabel}</strong>
                <small>Reinicia con más reto</small>
              </span>
            </button>
          )}

          <button className="kw-victory-endless" onClick={onStartEndless}>
            <span style={{ fontSize: 26 }}>♾️</span>
            <span>
              <strong>Modo Endless</strong>
              <small>Mundos infinitos con dificultad creciente</small>
            </span>
          </button>

          <button className="kw-victory-home" onClick={onHome}>
            🏠 Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

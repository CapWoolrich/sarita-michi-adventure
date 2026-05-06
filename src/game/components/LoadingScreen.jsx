import { useEffect, useState } from 'react';

const TIPS = [
  '¿Sabías que los michis dorados valen 500 puntos? ¡Atrápalos!',
  'Mantén tu racha diaria activa entrando todos los días 🔥',
  'El mini-radar te muestra los michis más cercanos',
  'Los lobos te quitan vida, ¡cuidado en el bosque!',
  'Cada michi atrapado te recupera un corazón ❤️',
  'Atrapa a los michis dorados antes de que se escapen ✨',
  'Activa el modo rápido (⚡) para correr y dejar un rastro mágico',
  'Hay 11 mundos en total — el último es secreto 🌃',
  'Los búhos vuelan en la noche, esquívalos en el Jardín Lunar 🌙',
  'Cada mundo tiene su música única — ¡escucha con calma!'
];

export default function LoadingScreen({ isOpen, worldName, onComplete, duration = 2200 }) {
  const [progress, setProgress] = useState(0);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    if (!isOpen) return;
    setProgress(0);
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) {
        clearInterval(id);
        onComplete?.();
      }
    }, 50);
    return () => clearInterval(id);
  }, [isOpen, duration, onComplete]);

  if (!isOpen) return null;
  return (
    <div className="kw-loading-screen" data-game-ui="true">
      <div className="kw-loading-card">
        <div className="kw-loading-icon">🌸</div>
        <div className="kw-loading-world">{worldName}</div>
        <div className="kw-loading-tip">
          <span className="kw-loading-tip-label">¿Sabías que…</span>
          <span className="kw-loading-tip-text">{tip}</span>
        </div>
        <div className="kw-loading-bar">
          <div className="kw-loading-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

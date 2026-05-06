import { useEffect, useState } from 'react';

/**
 * Tarjeta que aparece al inicio de cada nivel mostrando "Mundo X de N · Nombre".
 * Se desvanece a los ~2.5s. Reaparece cuando cambia worldKey.
 */
export default function LevelIntroCard({ worldIndex, worldName, levelName, totalWorlds = 11, worldKey }) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState('in'); // in -> hold -> out -> done

  useEffect(() => {
    setVisible(true);
    setPhase('in');
    const t1 = setTimeout(() => setPhase('hold'), 350);
    const t2 = setTimeout(() => setPhase('out'), 2200);
    const t3 = setTimeout(() => { setPhase('done'); setVisible(false); }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [worldKey]);

  if (!visible) return null;

  return (
    <div className={`kw-level-intro kw-intro-${phase}`} data-game-ui="true">
      <div className="kw-intro-card">
        <div className="kw-intro-badge">Mundo {worldIndex} de {totalWorlds}</div>
        <div className="kw-intro-name">{worldName}</div>
        <div className="kw-intro-level">{levelName}</div>
      </div>
    </div>
  );
}

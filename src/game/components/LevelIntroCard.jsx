import { useEffect, useState } from 'react';

export default function LevelIntroCard({ worldIndex, worldName, levelName, totalWorlds = 11, worldKey, missionTitle, objectiveText }) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    setVisible(true);
    setPhase('in');
    const t1 = setTimeout(() => setPhase('hold'), 350);
    const t2 = setTimeout(() => setPhase('out'), 3000);
    const t3 = setTimeout(() => { setPhase('done'); setVisible(false); }, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [worldKey]);

  if (!visible) return null;

  return (
    <div className={`kw-level-intro kw-intro-${phase}`} data-game-ui="true">
      <div className="kw-intro-card">
        <div className="kw-intro-badge">Mundo {worldIndex} de {totalWorlds}</div>
        <div className="kw-intro-name">{worldName}</div>
        <div className="kw-intro-level">{levelName}</div>
        {missionTitle && <div className="kw-intro-level">{missionTitle}</div>}
        {objectiveText && <div className="kw-intro-level">{objectiveText}</div>}
      </div>
    </div>
  );
}

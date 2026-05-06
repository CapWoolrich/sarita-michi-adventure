import { useState } from 'react';

const STEPS = [
  {
    icon: '🕹️',
    title: 'Mueve a Sarita',
    body: 'Toca y arrastra en la mitad inferior izquierda de la pantalla para caminar. El joystick aparece donde toques.'
  },
  {
    icon: '🐾',
    title: 'Acércate a un michi',
    body: 'Cuando estás cerca, el botón "Atrapar" se ilumina y vibra. ¡Es momento de actuar!'
  },
  {
    icon: '⭐',
    title: '¡Atrápalo!',
    body: 'Toca el botón "Atrapar" para rescatar al michi. Atrápalos a todos antes de que se acabe el tiempo.'
  }
];

export default function TutorialOverlay({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  if (!isOpen) return null;
  const isLast = step === STEPS.length - 1;
  const cur = STEPS[step];
  return (
    <div className="kw-tutorial-overlay" data-game-ui="true">
      <div className="kw-tutorial-card">
        <div className="kw-tutorial-icon">{cur.icon}</div>
        <h3 className="kw-tutorial-title">{cur.title}</h3>
        <p className="kw-tutorial-body">{cur.body}</p>
        <div className="kw-tutorial-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`kw-tutorial-dot ${i === step ? 'kw-tutorial-dot-on' : ''}`} />
          ))}
        </div>
        <div className="kw-tutorial-actions">
          <button
            className="kw-pause-btn"
            onClick={() => onClose()}
          >
            Saltar
          </button>
          <button
            className="kw-splash-primary"
            style={{ padding: '12px 22px', fontSize: 14 }}
            onClick={() => {
              if (isLast) onClose();
              else setStep(step + 1);
            }}
          >
            {isLast ? '¡Empezar!' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}

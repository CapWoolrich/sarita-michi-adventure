export default function GameOverPanel({ isOpen, message = 'Intenta de nuevo', onRestart, onHome }) {
  if (!isOpen) return null;

  return (
    <div data-game-ui="true" className="kw-level-transition">
      <div className="kw-trans-veil" />
      <section className="kw-trans-card" style={{ zIndex: 2 }}>
        <div className="kw-trans-title">Misión pausada</div>
        <p style={{ margin: '10px 0 16px', color: '#5a4880', fontWeight: 700 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="kw-splash-btn" onClick={onRestart}>Intentar de nuevo</button>
          <button type="button" className="kw-splash-btn" onClick={onHome}>Inicio</button>
        </div>
      </section>
    </div>
  );
}

export default function GameHUD({ levelName, worldName, capturedCount, totalCats, score, timeLeft, isPaused, onPause, onHome, onAudio }) {
  return <header data-game-ui="true" style={{ position:'fixed', top:0, left:0, right:0, zIndex:60, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', color:'#1f2240', background:'rgba(255,255,255,.88)', backdropFilter:'blur(8px)' }}>
    <div><strong>{levelName}</strong> · <span>{worldName}</span><div>Michi: {capturedCount}/{totalCats} · Score: {score} · Tiempo: {timeLeft}s</div></div>
    <div style={{ display:'flex', gap:8 }}>
      <button onClick={onAudio}>Audio</button><button onClick={onPause}>{isPaused ? 'Reanudar' : 'Pausa'}</button><button onClick={onHome}>Inicio</button>
    </div>
  </header>;
}

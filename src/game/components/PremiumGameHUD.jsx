export default function PremiumGameHUD({ capturedCount, totalCats, score, timeLeft, worldIndex, worldName, levelName, isPaused, onPause, onHome, onAudio }) {
  return <header data-game-ui="true" style={{ position:'fixed', top:'max(8px,env(safe-area-inset-top))', left:10, right:10, zIndex:60 }}>
    <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:24,backdropFilter:'blur(14px)',background:'rgba(248,251,255,.45)',border:'1px solid rgba(255,255,255,.62)',boxShadow:'0 8px 30px rgba(35,48,92,.18)',fontSize:'clamp(11px,1.8vw,14px)'}}>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span>🐾 {capturedCount}/{totalCats}</span><span>⭐ {score}</span><span>⏱ {timeLeft}s</span></div>
      <div style={{textAlign:'center',lineHeight:1.2}}><strong>Mundo {worldIndex} de 10</strong><div style={{fontWeight:800}}>{worldName}</div><small>{levelName}</small></div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
        <button data-game-ui="true" className="hud-icon-btn" onClick={onAudio}>🔭</button><button data-game-ui="true" className="hud-icon-btn" onClick={onPause}>{isPaused ? '▶' : '⏸'}</button><button data-game-ui="true" className="hud-icon-btn" onClick={onHome}>🏠</button>
      </div>
    </div>
  </header>;
}

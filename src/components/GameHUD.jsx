const chip = {
  borderRadius: 999,
  padding: '6px 10px',
  background: 'rgba(255,255,255,.36)',
  border: '1px solid rgba(255,255,255,.4)',
  fontWeight: 700,
  fontSize: 12
};

export default function GameHUD({ levelName, worldName, capturedCount, totalCats, score, timeLeft, isPaused, onPause, onHome, onAudio }) {
  return <header data-game-ui="true" className="integrated-hud" style={{ position:'fixed', top:'max(8px,env(safe-area-inset-top))', left:10, right:10, zIndex:60, color:'#1e2240' }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'10px 12px', borderRadius:20, background:'linear-gradient(135deg, rgba(255,250,255,.72), rgba(230,246,255,.55))', border:'1px solid rgba(255,255,255,.48)', boxShadow:'0 8px 28px rgba(40,56,100,.18)', backdropFilter:'blur(14px)' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:4, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:800, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>✨ {levelName} · {worldName}</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <span style={chip}>🐾 {capturedCount}/{totalCats}</span><span style={chip}>⭐ {score}</span><span style={chip}>⏱ {timeLeft}s</span>
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button data-game-ui="true" className="hud-icon-btn" onClick={onAudio}>🔊</button>
        <button data-game-ui="true" className="hud-icon-btn" onClick={onPause}>{isPaused ? '▶️' : '⏸'}</button>
        <button data-game-ui="true" className="hud-icon-btn" onClick={onHome}>🏠</button>
      </div>
    </div>
  </header>;
}

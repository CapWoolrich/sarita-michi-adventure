export default function RewardToast({ reward, onClose }) {
  if (!reward) return null;

  return (
    <div data-game-ui="true" style={{
      position: 'fixed', left: '50%', top: '18%', transform: 'translateX(-50%)', zIndex: 120,
      minWidth: 260, maxWidth: 'min(420px, 86vw)', padding: '16px 18px', borderRadius: 24,
      background: 'linear-gradient(135deg, rgba(255,255,255,.94), rgba(255,239,252,.9))',
      boxShadow: '0 20px 60px rgba(75, 39, 120, .22)', border: '1px solid rgba(255,255,255,.8)',
      textAlign: 'center', color: '#4b2a72', backdropFilter: 'blur(16px)'
    }}>
      <div style={{ fontSize: 30, lineHeight: 1 }}>🎁</div>
      <strong style={{ display: 'block', fontSize: 20, marginTop: 4 }}>Recompensa ganada</strong>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10, fontWeight: 800 }}>
        {reward.coins > 0 && <span>🪙 +{reward.coins}</span>}
        {reward.chests > 0 && <span>🎁 +{reward.chests}</span>}
      </div>
      {reward.outfit && (
        <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 16, background: 'rgba(255,208,102,.25)', fontWeight: 800 }}>
          Nuevo outfit: {reward.outfit.icon} {reward.outfit.name}
        </div>
      )}
      <button type="button" onClick={onClose} style={{
        marginTop: 12, border: 0, borderRadius: 999, padding: '8px 14px', fontWeight: 900,
        color: '#fff', background: 'linear-gradient(135deg,#c084fc,#ec4899)', boxShadow: '0 10px 20px rgba(192,132,252,.25)'
      }}>Genial</button>
    </div>
  );
}

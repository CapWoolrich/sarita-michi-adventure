import { useEffect, useRef, useState } from 'react';

/**
 * Genera una imagen PNG con el progreso del jugador (canvas to dataURL).
 * Permite descargar o usar Web Share API si está disponible.
 */
export default function ShareProgressModal({ isOpen, settings, achievements, onClose }) {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1000;

    // Fondo gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#fff5fa');
    grad.addColorStop(0.5, '#ffe5f0');
    grad.addColorStop(1, '#fff0e5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = '#6e3f9a';
    ctx.font = 'bold 64px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Sarita y los michi perdidos', canvas.width / 2, 110);

    ctx.font = 'italic 28px Georgia';
    ctx.fillStyle = '#8b5fb8';
    ctx.fillText('Mi aventura kawaii', canvas.width / 2, 150);

    // Stats
    const goldenCats = settings?.goldenCatsCaught ?? 0;
    const streak = settings?.dailyStreak?.count ?? 0;
    const totalScore = Object.values(settings?.highScores ?? {}).reduce((s, v) => s + (v ?? 0), 0);
    const totalAch = Object.keys(achievements?.unlocked ?? {}).length;
    const totalCaught = achievements?.totalCaught ?? 0;

    const cards = [
      { icon: '🐾', label: 'Michis rescatados', value: totalCaught },
      { icon: '✨', label: 'Michis dorados', value: goldenCats },
      { icon: '🔥', label: 'Racha (días)', value: streak },
      { icon: '⭐', label: 'Puntos totales', value: totalScore.toLocaleString() },
      { icon: '🏆', label: 'Logros', value: `${totalAch}/11` }
    ];

    cards.forEach((card, i) => {
      const y = 230 + i * 130;
      // Card glass
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const cardX = 100;
      const cardW = 600;
      ctx.beginPath();
      ctx.roundRect(cardX, y, cardW, 100, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon
      ctx.font = '54px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(card.icon, cardX + 30, y + 70);

      // Label
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#5a4880';
      ctx.fillText(card.label, cardX + 110, y + 45);

      // Value
      ctx.font = 'bold 42px sans-serif';
      ctx.fillStyle = '#6e3f9a';
      ctx.textAlign = 'right';
      ctx.fillText(String(card.value), cardX + cardW - 30, y + 65);
    });

    // Footer
    ctx.font = 'italic 22px sans-serif';
    ctx.fillStyle = '#8b5fb8';
    ctx.textAlign = 'center';
    ctx.fillText('Creado por Bernard y Sarita 💜', canvas.width / 2, canvas.height - 50);

    setDataUrl(canvas.toDataURL('image/png'));
  }, [isOpen, settings, achievements]);

  const onDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `sarita-progreso-${new Date().toISOString().slice(0,10)}.png`;
    link.href = dataUrl;
    link.click();
  };

  const onShareNative = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'sarita-progreso.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Sarita y los michi perdidos',
          text: 'Mira mi progreso en este juego kawaii 💜'
        });
      } else {
        onDownload();
      }
    } catch {
      onDownload();
    }
  };

  if (!isOpen) return null;
  return (
    <div className="kw-collection-overlay" data-game-ui="true" onClick={onClose}>
      <div className="kw-share-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kw-collection-header">
          <h2>Compartir mi progreso</h2>
          <button className="kw-circle-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z"/></svg>
          </button>
        </div>
        <div className="kw-share-body">
          <canvas ref={canvasRef} className="kw-share-canvas" />
          <div className="kw-share-actions">
            <button className="kw-splash-primary" onClick={onShareNative}>
              <span aria-hidden>📤</span> Compartir
            </button>
            <button className="kw-pause-btn" onClick={onDownload}>
              <span aria-hidden>⬇️</span> Descargar PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

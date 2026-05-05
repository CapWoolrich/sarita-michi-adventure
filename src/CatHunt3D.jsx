 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/CatHunt3D.jsx b/src/CatHunt3D.jsx
index 7989ae404aabc063a29741932272ecb6f39a941d..c766933bb2f54a2c92cca5d09f7597de16b1879c 100644
--- a/src/CatHunt3D.jsx
+++ b/src/CatHunt3D.jsx
@@ -229,66 +229,65 @@ export default function CatHunt3D() {
     timerRef.current = setInterval(() => setTimeLeft((t) => (!paused && screen === 'playing' ? Math.max(0, t - 1) : t)), 1000);
   }, [isMobile, mute, paused, rescuedMichis.length, screen, settings, stopGame]);
 
   useEffect(() => {
     if (screen !== 'playing' || pendingLevelRef.current == null) return undefined;
 
     const targetIndex = pendingLevelRef.current;
     let raf1 = 0;
     let raf2 = 0;
 
     raf1 = requestAnimationFrame(() => {
       raf2 = requestAnimationFrame(() => {
         if (!mountRef.current || pendingLevelRef.current == null) return;
         setupLevel(targetIndex);
         pendingLevelRef.current = null;
       });
     });
 
     return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
   }, [screen, setupLevel]);
 
   useEffect(() => { if (timeLeft === 0 && screen === 'playing') { pendingLevelRef.current = null; setScreen('gameover'); stopGame(); } }, [timeLeft, screen, stopGame]);
   useEffect(() => { if (screen === 'playing' && found >= LEVELS[levelIndex].cats) { if (timeLeft > 30) unlockAchievement('fast', 'Rescatista veloz'); const total = score + timeLeft * 10; setScore(total); setBestScore((b) => Math.max(b, total)); setCompletedLevels((c) => [...new Set([...c, levelIndex])]); const next = Math.min(levelIndex + 1, LEVELS.length - 1); setMaxUnlockedLevel((m) => Math.max(m, next)); pendingLevelRef.current = null; stopGame(); setScreen(levelIndex === LEVELS.length - 1 ? 'complete' : 'levelComplete'); if (levelIndex === LEVELS.length - 1) unlockAchievement('legend', 'Leyenda estrellada'); } }, [found, levelIndex, score, screen, stopGame, timeLeft]);
 
   const startLevel = async (idx, reset = false) => {
-    await initAudio();
     const targetIndex = reset ? 0 : idx;
     pendingLevelRef.current = targetIndex;
     stopGame();
     setPaused(false);
     setHint('Busca a los michi perdidos...');
     setRescueToast('');
-    if (reset) { setScore(0); setLevelIndex(0); }
-    else setLevelIndex(targetIndex);
+    if (reset) setScore(0);
+    setLevelIndex(targetIndex);
     setScreen('playing');
+    await initAudio();
   };
 
   return <div style={styles.appShell}>
     <MagicBackdrop />
     {screen === 'menu' && <PremiumStartScreen onPlay={() => startLevel(0, true)} onContinue={() => startLevel(maxUnlockedLevel)} hasProgress={maxUnlockedLevel > 0 || score > 0} onOpenCollection={() => setScreen('collection')} onOpenHow={() => setScreen('how')} onOpenCredits={() => setScreen('credits')} onOpenAchievements={() => setScreen('achievements')} />}
-    {screen === 'story' && <Panel><SaritaMascot /><p>Una tarde mágica, los michis del jardín encantado se perdieron entre flores, árboles y estrellas. Sarita decidió salir a buscarlos uno por uno.</p><button onClick={() => startLevel(0, true)}>Comenzar</button><button onClick={() => startLevel(0, true)}>Saltar</button></Panel>}
     {screen === 'how' && <Panel title='Cómo jugar'><ul><li>📱 Joystick izquierdo: moverte</li><li>📱 Arrastra a la derecha: mirar</li><li>📱 Botón 🌈: rescatar</li><li>🖥️ WASD/Flechas: moverte</li><li>🖥️ Mouse: mirar</li><li>🖥️ Espacio o click: rescatar</li></ul><button onClick={() => setScreen('menu')}>Volver</button></Panel>}
     {screen === 'credits' && <Panel title='Créditos'><SaritaMascot /><p>{GAME_TITLE}</p><p>Creado por Bernard y Sarita</p><p>Una aventura familiar hecha con amor</p><button onClick={() => setScreen('menu')}>Volver</button></Panel>}
     {screen === 'collection' && <MichiCollection rescued={rescuedMichis} onBack={() => setScreen('menu')} />}
     {screen === 'achievements' && <Panel title='Logros'>{['Primer rescate','Rescatista veloz','Amiga de los michis','Leyenda estrellada'].map((t,i)=><div key={t}>{achievements[i]? '✅':'⬜'} {t}</div>)}<button onClick={() => setScreen('menu')}>Volver</button></Panel>}
 
     {screen === 'playing' && <>
       <div ref={mountRef} style={{ position: 'fixed', inset: 0 }} />
       <div style={{ position: 'fixed', top: 8, left: 8, right: 8, display: 'flex', gap: 8, flexWrap: 'wrap', zIndex: 20 }}><Badge> Nivel: {LEVELS[levelIndex].name}</Badge><Badge>Michis: {found}/{LEVELS[levelIndex].cats}</Badge><Badge>Tiempo: {timeLeft}s</Badge><Badge>Score: {score}</Badge><button onClick={() => setMute((m) => !m)}>{mute ? '🔇' : '🔊'}</button><button onClick={() => setPaused((p) => !p)}>{paused ? '▶️' : '⏸️'}</button><button onClick={() => { setScreen('menu'); stopGame(); }}>🏠</button></div>
       {isMobile && <MobileControls touchState={touchState} onCatch={() => gameRef.current?.tryCatchCat?.()} />}
       {!isMobile && <button onClick={() => gameRef.current?.tryCatchCat?.()} style={{ position: 'fixed', right: 14, bottom: 14, zIndex: 25 }}>🌈 Atrapar</button>}
       <div style={{ position: 'fixed', bottom: 16, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: 700, textShadow: '0 2px 6px #000' }}>{hint}</div>
       {rescueToast && <div style={{ position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)', zIndex: 22, background: 'rgba(255,105,173,.88)', color: '#fff', padding: '8px 12px', borderRadius: 999, pointerEvents: 'none', animation: 'fadeToast 1.4s ease forwards' }}>{rescueToast}</div>}
       {paused && <Panel title='Juego en pausa'><button onClick={() => setPaused(false)}>Continuar</button><button onClick={() => startLevel(levelIndex)}>Reiniciar nivel</button><button onClick={() => { setScreen('menu'); stopGame(); }}>Menú</button></Panel>}
     </>}
 
     {screen === 'levelComplete' && <Panel title='¡Nivel completado!'><SaritaMascot /><p>{LEVEL_STORY[Math.min(levelIndex + 1, LEVEL_STORY.length - 1)]}</p><p>Encontraste a:</p>{lastFoundProfiles.map((p) => <div key={p.id}>🐱 {p.name} — {p.personality}</div>)}<button onClick={() => startLevel(levelIndex + 1)}>Siguiente nivel</button></Panel>}
     {screen === 'complete' && <Panel title='Misión completa ✨'><SaritaMascot /><p>Puntuación final: {score}</p><button onClick={() => startLevel(0, true)}>Jugar de nuevo</button></Panel>}
     {screen === 'gameover' && <Panel title='Game Over'><button onClick={() => startLevel(levelIndex)}>Reintentar</button><button onClick={() => setScreen('menu')}>Menú</button></Panel>}
     {achievementToast && <div style={{ position: 'fixed', top: 70, right: 12, zIndex: 40, background: 'rgba(255,255,255,.92)', padding: '10px 12px', borderRadius: 12 }}>{achievementToast}</div>}
     <style>{cssSkin}</style>
   </div>;
 }
 
 function SaritaMascot() { return <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,#ffd0ea,#cfa6ff)', display: 'grid', placeItems: 'center', fontSize: 54 }}>🪄</div>; }
 
 
EOF
)

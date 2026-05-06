import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';
import Game3DCanvas from './game3d/Game3DCanvas';
import MobileGameInputLayer from './game3d/MobileGameInputLayer';

const GAME_TITLE = 'Sarita y los michi perdidos';
const SUBTITLE = 'Una aventura mágica para rescatar gatitos perdidos';
const LEVEL_STORY = [
  'Los primeros michis se escondieron en la pradera encantada.',
  'El bosque místico guarda sonidos suaves entre los árboles.',
  'El atardecer mágico ilumina las huellas de los michis.',
  'Bajo la noche estrellada, los últimos michis esperan ser encontrados.'
];
const LEVELS = [
  { name: 'Pradera Encantada', timeLimit: 80, cats: 4, sky: '#bfe9ff', fog: '#e8f8ff', ground: '#aeea9f', difficulty: 1 },
  { name: 'Bosque Místico', timeLimit: 75, cats: 5, sky: '#9fe4d7', fog: '#d0f5ea', ground: '#83d7ae', difficulty: 1.2 },
  { name: 'Atardecer Mágico', timeLimit: 70, cats: 6, sky: '#ffb7af', fog: '#ffdcd0', ground: '#f2bf98', difficulty: 1.4 },
  { name: 'Noche Estrellada', timeLimit: 65, cats: 7, sky: '#30377f', fog: '#5964a8', ground: '#536099', difficulty: 1.7 }
];

const CAT_VARIANTS = [
  { color: '#ffe7b8', spot: '#ffcda5', bow: true },
  { color: '#dcc8ff', spot: '#c4a8ff' },
  { color: '#c5f1e6', spot: '#9ee2cd' },
  { color: '#ffd6ba', spot: '#ffb99c' },
  { color: '#ffffff', spot: '#f3f1ff' },
  { color: '#ffcce0', spot: '#ffb2d2', chubby: true },
  { color: '#c5e4ff', spot: '#aad5ff' },
  { color: '#fff2ad', spot: '#ffe381' }
];

const LEVEL_DECOR = {
  'Pradera Encantada': { tree: ['#8edb8d', '#74cd83', '#9de89b'], flower: ['#ff9ec8', '#ffe184', '#d4b3ff'], bush: ['#84d296', '#9de2af'] },
  'Bosque Místico': { tree: ['#72c7a8', '#64bbab', '#88dbc5'], flower: ['#f9a7d9', '#b8f2ff', '#d2b0ff'], bush: ['#6bc4ab', '#7fd5be'] },
  'Atardecer Mágico': { tree: ['#ffa79b', '#ffbf94', '#f6a4c8'], flower: ['#ff8ca6', '#ffd096', '#c6b5ff'], bush: ['#f7ab8e', '#f7c2a1'] },
  'Noche Estrellada': { tree: ['#6575d1', '#5f66ba', '#7a79d8'], flower: ['#b8b9ff', '#ffb4df', '#99ccff'], bush: ['#5d70bf', '#6f7fca'] }
};

const createCat = (variant, detail = 'normal') => {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshToonMaterial({ color: variant.color });
  const spotMat = new THREE.MeshToonMaterial({ color: variant.spot });
  const cream = new THREE.MeshToonMaterial({ color: '#fff7ef' });
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#23233a' });
  const whiteMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const noseMat = new THREE.MeshBasicMaterial({ color: '#ff8db4' });
  const blushMat = new THREE.MeshBasicMaterial({ color: '#ffb2cf', transparent: true, opacity: 0.88 });
  const mouthMat = new THREE.MeshBasicMaterial({ color: '#94556f' });
  const earInnerMat = new THREE.MeshToonMaterial({ color: '#ffc7de' });
  const segments = detail === 'bonita' ? 16 : 12;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, segments, segments), bodyMat); head.position.set(0, 0.65, 0);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, segments, segments), bodyMat); body.position.set(-0.27, 0.4, 0); body.scale.set(1.15, variant.chubby ? 1.1 : 0.95, 1);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), cream); chest.position.set(-0.12, 0.34, 0);
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, variant.chubby ? 0.32 : 0.38, 3, 7), bodyMat); tail.position.set(-0.58, 0.48, 0); tail.rotation.z = -0.95;

  const legGeo = new THREE.CapsuleGeometry(0.07, 0.16, 3, 6);
  [[-0.08,0.18,0.16],[-0.08,0.18,-0.16],[-0.42,0.18,0.16],[-0.42,0.18,-0.16]].forEach((p)=>{const leg=new THREE.Mesh(legGeo, cream); leg.position.set(p[0], p[1], p[2]); group.add(leg);});

  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 10), bodyMat); earL.position.set(0.16, 1.02, 0.19); earL.rotation.z = 0.18;
  const earR = earL.clone(); earR.position.z = -0.19; earR.rotation.z = -0.18;
  const earInL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 10), earInnerMat); earInL.position.set(0.16, 1.02, 0.19);
  const earInR = earInL.clone(); earInR.position.z = -0.19;

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), cream); snout.position.set(0.34, 0.54, 0); snout.scale.set(1, 0.7, 0.95);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 10), eyeMat); eyeL.position.set(0.34, 0.69, 0.14);
  const eyeR = eyeL.clone(); eyeR.position.z = -0.14;
  const shineL = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 8), whiteMat); shineL.position.set(0.365, 0.72, 0.16);
  const shineR = shineL.clone(); shineR.position.z = -0.12;
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), noseMat); nose.position.set(0.45, 0.55, 0);
  const mouthL = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 10, Math.PI), mouthMat); mouthL.position.set(0.49, 0.51, 0.026); mouthL.rotation.set(Math.PI, Math.PI/2, 0.4);
  const mouthR = mouthL.clone(); mouthR.position.z = -0.026; mouthR.rotation.z = -0.4;
  const blushL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), blushMat); blushL.position.set(0.38, 0.55, 0.24);
  const blushR = blushL.clone(); blushR.position.z = -0.24;

  const whiskerGeo = new THREE.BoxGeometry(0.12, 0.003, 0.003);
  [-0.03,0.02].forEach((dy)=>{const wl = new THREE.Mesh(whiskerGeo, whiteMat); wl.position.set(0.43, 0.55+dy, 0.21); wl.rotation.y = 0.2; const wr = wl.clone(); wr.position.z = -0.21; wr.rotation.y = -0.2; group.add(wl, wr);});

  group.add(body, chest, head, tail, earL, earR, earInL, earInR, snout, eyeL, eyeR, shineL, shineR, nose, mouthL, mouthR, blushL, blushR);

  if (variant.bow) {
    const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), new THREE.MeshBasicMaterial({ color: '#ff63a9' }));
    const bowWing = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: '#ff8ec3' }));
    bowCenter.position.set(0.18, 0.88, 0.22); bowWing.position.set(0.22, 0.88, 0.25);
    const wing2 = bowWing.clone(); wing2.position.z = 0.19; group.add(bowCenter, bowWing, wing2);
  }

  if (Math.random() > 0.45) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), spotMat); spot.position.set(-0.18, 0.6, 0.17);
    const spot2 = spot.clone(); spot2.position.set(-0.33, 0.54, -0.14); group.add(spot, spot2);
  }
  group.rotation.y = Math.PI / 2;
  return group;
};
const MICHI_PROFILES = [
  { id: 'mochi', name: 'Mochi', color: '#ff8fa3', personality: 'Dulce y dormilón', phrase: 'Ama las flores mágicas', level: 1 },
  { id: 'luna', name: 'Luna', color: '#b8ccff', personality: 'Curiosa y brillante', phrase: 'Persigue destellos de luna', level: 1 },
  { id: 'kiki', name: 'Kiki', color: '#ffd36e', personality: 'Juguetona y feliz', phrase: 'Salta entre honguitos', level: 2 },
  { id: 'yuki', name: 'Yuki', color: '#ffffff', personality: 'Suave y tranquila', phrase: 'Le encanta la neblina', level: 2 },
  { id: 'sakura', name: 'Sakura', color: '#ffb8dc', personality: 'Cariñosa y elegante', phrase: 'Colecciona pétalos', level: 3 },
  { id: 'niko', name: 'Niko', color: '#bdf4d8', personality: 'Valiente y veloz', phrase: 'Explora senderos secretos', level: 3 },
  { id: 'tofu', name: 'Tofu', color: '#d9dce5', personality: 'Calmado y tierno', phrase: 'Duerme bajo las estrellas', level: 4 },
  { id: 'chispa', name: 'Chispa', color: '#ffa46b', personality: 'Traviesa y luminosa', phrase: 'Deja huellas brillantes', level: 4 }
];
const PLAYER_SPEED = 0.2;
const CATCH_DISTANCE = 4;
const safeRead = (k, f) => { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch { return f; } };
const getMovementVector = (yaw, fwd, right) => ({ x: fwd * -Math.sin(yaw) + right * Math.cos(yaw), z: fwd * -Math.cos(yaw) + right * -Math.sin(yaw) });
const DEBUG_CAMERA = false;
const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';

export default function CatHunt3D() {
  const [screen, setScreen] = useState('menu');
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => safeRead('bestScore', 0));
  const [mute, setMute] = useState(() => safeRead('mute', false));
  const [rescuedMichis, setRescuedMichis] = useState(() => safeRead('rescuedMichis', []));
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(() => safeRead('maxUnlockedLevel', 0));
  const [completedLevels, setCompletedLevels] = useState(() => safeRead('completedLevels', []));
  const [achievements, setAchievements] = useState(() => safeRead('achievements', []));
  const [achievementToast, setAchievementToast] = useState('');
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].timeLimit);
  const [found, setFound] = useState(0);
  const [hint, setHint] = useState('Busca a los michi perdidos...');
  const [rescueToast, setRescueToast] = useState('');
  const [playerPosition3D, setPlayerPosition3D] = useState({ x: 0, y: 0, z: 0 });
  const [nearestCatId, setNearestCatId] = useState(null);
  const [nearestCatDistance, setNearestCatDistance] = useState(Infinity);
  const [isCatInCaptureRange, setIsCatInCaptureRange] = useState(false);
  const [capturedCatIds3D, setCapturedCatIds3D] = useState([]);
  const [levelStartNonce, setLevelStartNonce] = useState(0);
  const [speedMode, setSpeedMode] = useState('normal');
  const [jumpNonce, setJumpNonce] = useState(0);
  const [starCount, setStarCount] = useState(0);
  const [lastCatchResult, setLastCatchResult] = useState(null);
  const [lastCapturedCatId, setLastCapturedCatId] = useState(null);
  const [levelCompleteQueued, setLevelCompleteQueued] = useState(false);
  const rescueToastTimeoutRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [lastFoundProfiles, setLastFoundProfiles] = useState([]);
  const [settings, setSettings] = useState(() => safeRead('settings', { look: 'media', quality: 'normal' }));
  const mountRef = useRef(null); const gameRef = useRef(null); const game3dRef = useRef(null); const timerRef = useRef(null); const pendingLevelRef = useRef(null);
  const touchState = useRef({ joystick: { active: false, x: 0, y: 0, magnitude: 0 }, joy: { active: false, x: 0, y: 0, magnitude: 0 }, look: { active: false, dx: 0, dy: 0 }, debug: { lookMoveCount: 0, yawChangeCount: 0 } });
  const audioRef = useRef({ started: false, sounds: {} });
  const isMobile = useMemo(() => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent), []);

  useEffect(() => localStorage.setItem('bestScore', JSON.stringify(bestScore)), [bestScore]);
  useEffect(() => { localStorage.setItem('mute', JSON.stringify(mute)); Tone.Destination.mute = mute; }, [mute]);
  useEffect(() => localStorage.setItem('rescuedMichis', JSON.stringify(rescuedMichis)), [rescuedMichis]);
  useEffect(() => localStorage.setItem('maxUnlockedLevel', JSON.stringify(maxUnlockedLevel)), [maxUnlockedLevel]);
  useEffect(() => localStorage.setItem('completedLevels', JSON.stringify(completedLevels)), [completedLevels]);
  useEffect(() => localStorage.setItem('achievements', JSON.stringify(achievements)), [achievements]);
  useEffect(() => localStorage.setItem('settings', JSON.stringify(settings)), [settings]);

  const unlockAchievement = (id, title) => { if (!achievements.includes(id)) { setAchievements((a) => [...a, id]); setAchievementToast(`🏆 Logro desbloqueado: ${title}`); } };
  useEffect(() => { if (!achievementToast) return; const t = setTimeout(() => setAchievementToast(''), 2200); return () => clearTimeout(t); }, [achievementToast]);

  const showRescueToast = (message) => {
    if (rescueToastTimeoutRef.current) clearTimeout(rescueToastTimeoutRef.current);
    setRescueToast(message);
    rescueToastTimeoutRef.current = setTimeout(() => setRescueToast(''), 1400);
  };


  const stopGame = useCallback(() => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; if (document.pointerLockElement) document.exitPointerLock?.(); const g = gameRef.current; if (!g) { if (mountRef.current) mountRef.current.innerHTML=''; return; } g.running = false; if (g.rafId) cancelAnimationFrame(g.rafId); window.removeEventListener('resize', g.onResize); window.removeEventListener('keydown', g.onKeyDown); window.removeEventListener('keyup', g.onKeyUp); window.removeEventListener('mousemove', g.onMouseMove); window.removeEventListener('click', g.onClick); window.removeEventListener('pointerlockchange', g.onPointerLockChange); g.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) Array.isArray(o.material) ? o.material.forEach((m) => m.dispose()) : o.material.dispose(); }); g.renderer.dispose(); g.renderer.domElement?.remove(); if (mountRef.current) mountRef.current.innerHTML=''; gameRef.current = null; }, []);
  useEffect(() => () => { if (rescueToastTimeoutRef.current) clearTimeout(rescueToastTimeoutRef.current); stopGame(); }, [stopGame]);

  const initAudio = useCallback(async () => {
    if (audioRef.current.started) return;
    try {
      await Tone.start();
      audioRef.current.sounds = {
        tap: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.12 } }).toDestination(),
        meowAppear: new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination(),
        meowCatch: new Tone.PolySynth(Tone.Synth).toDestination(),
        sparkle: new Tone.FMSynth().toDestination(),
        levelComplete: new Tone.PolySynth(Tone.Synth).toDestination(),
        nextLevel: new Tone.Synth({ oscillator: { type: 'sine' } }).toDestination()
      };
      audioRef.current.started = true;
    } catch {}
  }, []);
  const playSfx = useCallback((name) => {
    if (mute || !audioRef.current.started) return;
    const s = audioRef.current.sounds;
    if (name === 'tap') s.tap?.triggerAttackRelease('E6', '32n');
    if (name === 'meowAppear') s.meowAppear?.triggerAttackRelease('A4', '16n');
    if (name === 'meowCatch') s.meowCatch?.triggerAttackRelease(['C5', 'E5', 'A5'], '8n');
    if (name === 'sparkle') s.sparkle?.triggerAttackRelease('D6', '32n');
    if (name === 'levelComplete') s.levelComplete?.triggerAttackRelease(['C5', 'G5', 'C6'], '4n');
    if (name === 'nextLevel') s.nextLevel?.triggerAttackRelease('G5', '16n');
  }, [mute]);

  const setupLevel = useCallback((idx) => {
    const mount = mountRef.current; if (!mount) return; stopGame(); mount.innerHTML = '';
    const level = LEVELS[idx]; setTimeLeft(level.timeLimit); setFound(0); setLastFoundProfiles([]);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(level.sky); scene.fog = new THREE.Fog(level.fog, 8, 75);
    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.1, 200); camera.position.set(0, 1.7, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    const px = settings.quality === 'suave' ? 1 : settings.quality === 'bonita' ? 1.35 : 1.2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, px)); renderer.setSize(mount.clientWidth, mount.clientHeight); mount.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5)); scene.add(new THREE.HemisphereLight(0xcfe9ff, 0x7465b2, 0.8)); const sun = new THREE.DirectionalLight(0xfff0d8, 0.85); sun.position.set(8, 13, 6); scene.add(sun);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(55, 24), new THREE.MeshToonMaterial({ color: level.ground })); floor.rotation.x = -Math.PI / 2; scene.add(floor);

    const decorCount = settings.quality === 'suave' ? 70 : settings.quality === 'bonita' ? 170 : 120;
    const decorPalette = LEVEL_DECOR[level.name];
    const obstacles = []; const place = (m) => { scene.add(m); obstacles.push(m.position.clone()); };
    for (let i = 0; i < decorCount / 3; i += 1) { const t = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6), new THREE.MeshToonMaterial({ color: '#8d5a3b' })); trunk.position.y = .75; const top = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), new THREE.MeshToonMaterial({ color: decorPalette.tree[i % decorPalette.tree.length] })); top.position.y = 1.9; t.add(trunk, top); t.position.set((Math.random() - .5) * 80, 0, (Math.random() - .5) * 80); place(t); }
    for (let i = 0; i < decorCount / 4; i += 1) { const bush = new THREE.Mesh(new THREE.SphereGeometry(0.45 + Math.random() * .3, 8, 8), new THREE.MeshToonMaterial({ color: decorPalette.bush[i % decorPalette.bush.length] })); bush.position.set((Math.random() - .5) * 84, .35, (Math.random() - .5) * 84); place(bush); }
    for (let i = 0; i < decorCount; i += 1) { const f = new THREE.Group(); const stem = new THREE.Mesh(new THREE.CylinderGeometry(.015,.02,.2,5), new THREE.MeshToonMaterial({ color:'#72c97c' })); stem.position.y=.1; const petal = new THREE.Mesh(new THREE.SphereGeometry(.055,6,6), new THREE.MeshToonMaterial({ color: decorPalette.flower[i % decorPalette.flower.length] })); petal.position.y=.23; f.add(stem,petal); f.position.set((Math.random()-.5)*90,0,(Math.random()-.5)*90); scene.add(f); }
    for (let i = 0; i < decorCount / 5; i += 1) { const m = new THREE.Group(); const stem = new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,.14,6), new THREE.MeshToonMaterial({ color:'#f4d3b5' })); stem.position.y=.07; const cap = new THREE.Mesh(new THREE.SphereGeometry(.12,8,8), new THREE.MeshToonMaterial({ color: i%2?'#ff89b2':'#b58bff' })); cap.position.y=.16; m.add(stem,cap); m.position.set((Math.random()-.5)*86,0,(Math.random()-.5)*86); scene.add(m);} 

    const cats = Array.from({ length: level.cats }, (_, i) => {
      const profile = MICHI_PROFILES[(idx * 2 + i) % MICHI_PROFILES.length];
      const variant = CAT_VARIANTS[(idx * 3 + i) % CAT_VARIANTS.length];
      const g = createCat(variant, settings.quality);
      g.userData = { ...g.userData, profile, found: false, float: Math.random() * 10, idleOffset: Math.random() * 10, yaw: g.rotation.y };
      let x=0,z=0; for(let t=0;t<30;t+=1){x=(Math.random()-.5)*70;z=(Math.random()-.5)*70; if(obstacles.every((o)=>Math.hypot(o.x-x,o.z-z)>2.2)) break;} g.position.set(x,.4,z); scene.add(g); return g;
    });

    const keys = {}; const state = { yaw: 0, pitch: 0, pointerLocked: false };
    const collides = (x, z) => obstacles.some((p) => Math.hypot(p.x - x, p.z - z) < 1.2);
    const tryCatchCat = () => {
      let best=null, bestDist=Infinity; cats.forEach((c)=>{ if(c.userData.found) return; const d=camera.position.distanceTo(c.position); if(d<bestDist){bestDist=d; best=c;}});
      if (best && bestDist < CATCH_DISTANCE) {
        best.userData.found = true; const p = best.userData.profile; setRescuedMichis((r) => (r.includes(p.id) ? r : [...r, p.id])); setLastFoundProfiles((lf) => [...lf, p]);
        showRescueToast(`¡Rescataste a ${p.name}! · ${p.personality} 🌸`); setFound((f) => f + 1); setScore((s) => s + 120);
        unlockAchievement('first', 'Primer rescate'); if ((rescuedMichis.length + 1) >= 5) unlockAchievement('five', 'Amiga de los michis');
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.35,.03,8,24), new THREE.MeshBasicMaterial({ color:'#ff6b9d', transparent:true, opacity:.9 })); ring.position.copy(best.position); ring.rotation.x=Math.PI/2; scene.add(ring); best.userData.ring=ring; best.userData.ringBorn=performance.now();
        playSfx('meowCatch'); playSfx('sparkle');
      }
    };

    const onKeyDown = (e) => { keys[e.key.toLowerCase()] = true; if (e.code === 'Space') { e.preventDefault(); tryCatchCat(); } };
    const onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    const onMouseMove = (e) => { if (!state.pointerLocked || isMobile || paused) return; state.yaw -= e.movementX * 0.0023; state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch - e.movementY * 0.0023)); };
    const onClick = () => { if (!isMobile && document.pointerLockElement !== renderer.domElement) renderer.domElement.requestPointerLock(); else if (state.pointerLocked) tryCatchCat(); };
    const onPointerLockChange = () => { state.pointerLocked = document.pointerLockElement === renderer.domElement; };
    const onResize = () => { if (!mountRef.current) return; camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight); };
    window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('mousemove', onMouseMove); window.addEventListener('click', onClick); window.addEventListener('pointerlockchange', onPointerLockChange); window.addEventListener('resize', onResize);
    gameRef.current = { scene, camera, renderer, running: true, tryCatchCat, state, onResize, onKeyDown, onKeyUp, onMouseMove, onClick, onPointerLockChange };

    const animate = () => { if (!gameRef.current?.running) return; if (!paused) {
      const lookScale = settings.look === 'baja' ? 0.0028 : settings.look === 'alta' ? 0.0052 : 0.004;
      const joy = touchState.current.joy; const look = touchState.current.look;
      state.yaw -= look.dx * lookScale; state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch - look.dy * lookScale)); look.dx = 0; look.dy = 0;
      const forwardRaw = (keys.w || keys.arrowup ? 1 : 0) + (keys.s || keys.arrowdown ? -1 : 0) + joy.y;
      const rightRaw = (keys.d || keys.arrowright ? 1 : 0) + (keys.a || keys.arrowleft ? -1 : 0) + joy.x;
      const len = Math.hypot(forwardRaw, rightRaw) || 1; const move = getMovementVector(state.yaw, forwardRaw / Math.max(1,len), rightRaw / Math.max(1,len));
      const nx = camera.position.x + move.x * PLAYER_SPEED * (isMobile ? 0.96 : 1); const nz = camera.position.z + move.z * PLAYER_SPEED * (isMobile ? 0.96 : 1);
      if (!collides(nx, camera.position.z)) camera.position.x = nx; if (!collides(camera.position.x, nz)) camera.position.z = nz; camera.rotation.set(state.pitch, state.yaw, 0, 'YXZ'); camera.position.y = 1.7;
      const now = performance.now();
      let min=999; cats.forEach((c)=>{ if (!c.userData.found) {
        c.position.y = .4 + Math.sin(now*0.003+c.userData.float)*.06;
        const dist = camera.position.distanceTo(c.position); min=Math.min(min, dist);
        const targetYaw = dist < 6 ? Math.atan2(camera.position.x - c.position.x, camera.position.z - c.position.z) : c.userData.yaw + Math.sin(now * 0.0006 + c.userData.idleOffset) * 0.002;
        c.userData.yaw = THREE.MathUtils.lerp(c.userData.yaw, targetYaw, dist < 6 ? 0.06 : 0.01);
        c.rotation.y = c.userData.yaw;
      }
        if (c.userData.ring){const t=(now-c.userData.ringBorn)/900; c.userData.ring.scale.setScalar(1+t*2.4); c.userData.ring.material.opacity=Math.max(0,.9-t); if(t>1){scene.remove(c.userData.ring); c.userData.ring.geometry.dispose(); c.userData.ring.material.dispose(); c.userData.ring=null;}}
        if (c.userData.found && c.visible){ c.position.y += .04; c.scale.multiplyScalar(.975); if(c.scale.x<.1)c.visible=false; }
        if (c.userData.found && !c.userData.celebrate) c.userData.celebrate = performance.now();
      });
      setHint(min < 2.2 ? '¡Aquí mismo!' : min < 5.5 ? 'Muy cerca...' : min < 10 ? 'Escucho un maullido...' : 'Explora la zona');
      if (min < 7 && Math.random() < 0.014) playSfx('meowAppear');
    } renderer.render(scene, camera); gameRef.current.rafId = requestAnimationFrame(animate); };
    animate();
    timerRef.current = setInterval(() => setTimeLeft((t) => (!paused && screen === 'playing' ? Math.max(0, t - 1) : t)), 1000);
  }, [isMobile, paused, rescuedMichis.length, screen, settings, stopGame, playSfx]);

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
  useEffect(() => {
    if (screen !== 'playing' || levelCompleteQueued) return;
    const totalCats = LEVELS[levelIndex].cats;
    if (totalCats <= 0) return;
    if (capturedCatIds3D.length < totalCats) return;
    setLevelCompleteQueued(true);
    if (timeLeft > 30) unlockAchievement('fast', 'Rescatista veloz');
    const total = score + timeLeft * 10;
    setScore(total);
    setBestScore((b) => Math.max(b, total));
    setCompletedLevels((c) => [...new Set([...c, levelIndex])]);
    const next = Math.min(levelIndex + 1, LEVELS.length - 1);
    setMaxUnlockedLevel((m) => Math.max(m, next));
    pendingLevelRef.current = null;
    stopGame();
    playSfx('levelComplete');
    setScreen(levelIndex === LEVELS.length - 1 ? 'complete' : 'levelComplete');
    if (levelIndex === LEVELS.length - 1) unlockAchievement('legend', 'Leyenda estrellada');
  }, [capturedCatIds3D.length, levelCompleteQueued, levelIndex, playSfx, score, screen, stopGame, timeLeft]);


  const handle3DCatCaptured = useCallback((catId) => {
    if (catId == null) return false;
    const numericId = Number(catId);
    const profile = MICHI_PROFILES[(levelIndex * 2 + numericId) % MICHI_PROFILES.length];
    let capturedNow = false;
    setCapturedCatIds3D((prev) => {
      if (prev.includes(catId)) return prev;
      capturedNow = true;
      return [...prev, catId];
    });
    if (!capturedNow) return false;
    setLastCapturedCatId(catId);
    game3dRef.current?.triggerCatchAnimation?.(catId);
    setFound((f) => f + 1);
    setScore((sc) => sc + 120);
    setRescuedMichis((r) => (r.includes(profile.id) ? r : [...r, profile.id]));
    setLastFoundProfiles((lf) => (lf.some((p) => p.id === profile.id) ? lf : [...lf, profile]));
    showRescueToast(`¡Rescataste a ${profile.name}! · ${profile.personality} 🌸`);
    setHint('¡Michi rescatado!');
    playSfx('meowCatch');
    playSfx('sparkle');
    return true;
  }, [levelIndex, playSfx]);

  const handleJumpAction = useCallback(() => { setJumpNonce((n) => n + 1); game3dRef.current?.requestJump?.(); }, []);

  const handleCatchAction = useCallback(() => {
    playSfx('tap');
    const result = game3dRef.current?.attemptCatch?.();
    setLastCatchResult(result ?? null);
    if (!result?.success) {
      setHint('Acércate un poquito más');
      return;
    }
    handle3DCatCaptured(result.catId);
  }, [handle3DCatCaptured, playSfx]);
  const handleStarCollected = useCallback(() => {
    setStarCount((s) => s + 1);
    setScore((sc) => sc + 15);
    if (Math.random() < 0.45) setHint('✨ Estrellita encontrada, sigue las huellitas');
    playSfx('sparkle');
  }, [playSfx]);
  const startLevel = async (idx, reset = false) => {
    await initAudio();
    const targetIndex = reset ? 0 : idx;
    pendingLevelRef.current = targetIndex;
    stopGame();
    setPaused(false);
    setHint('Busca a los michi perdidos...');
    setRescueToast('');
    setCapturedCatIds3D([]);
    setNearestCatId(null);
    setNearestCatDistance(Infinity);
    setIsCatInCaptureRange(false);
    setPlayerPosition3D({ x: 0, y: 0, z: 0 });
    setLevelStartNonce((n) => n + 1);
    setSpeedMode('normal');
    setJumpNonce(0);
    setStarCount(0);
    setLastCatchResult(null);
    setLastCapturedCatId(null);
    setLevelCompleteQueued(false);
    if (reset) { setScore(0); setLevelIndex(0); }
    else setLevelIndex(targetIndex);
    setScreen('playing');
  };

  return <div style={styles.appShell}>
    <MagicBackdrop />
    {screen === 'menu' && <PremiumStartScreen onPlay={() => startLevel(0, true)} onContinue={() => startLevel(maxUnlockedLevel)} hasProgress={maxUnlockedLevel > 0 || score > 0} onOpenCollection={() => setScreen('collection')} onOpenHow={() => setScreen('how')} onOpenCredits={() => setScreen('credits')} onOpenAchievements={() => setScreen('achievements')} />}
    {screen === 'story' && <Panel><SaritaMascot /><p>Una tarde mágica, los michis del jardín encantado se perdieron entre flores, árboles y estrellas. Sarita decidió salir a buscarlos uno por uno.</p><button onClick={() => startLevel(0, true)}>Comenzar</button><button onClick={() => startLevel(0, true)}>Saltar</button></Panel>}
    {screen === 'how' && <Panel title='Cómo jugar'><ul><li>📱 Joystick izquierdo: moverte</li><li>📱 Arrastra a la derecha: mirar</li><li>📱 Botón 🌈: rescatar</li><li>🖥️ WASD/Flechas: moverte</li><li>🖥️ Mouse: mirar</li><li>🖥️ Espacio o click: rescatar</li></ul><button onClick={() => setScreen('menu')}>Volver</button></Panel>}
    {screen === 'credits' && <Panel title='Créditos'><SaritaMascot /><p>{GAME_TITLE}</p><p>Creado por Bernard y Sarita</p><p>Una aventura familiar hecha con amor</p><button onClick={() => setScreen('menu')}>Volver</button></Panel>}
    {screen === 'collection' && <MichiCollection rescued={rescuedMichis} onBack={() => setScreen('menu')} />}
    {screen === 'achievements' && <Panel title='Logros'>{['Primer rescate','Rescatista veloz','Amiga de los michis','Leyenda estrellada'].map((t,i)=><div key={t}>{achievements[i]? '✅':'⬜'} {t}</div>)}<button onClick={() => setScreen('menu')}>Volver</button></Panel>}

    {screen === 'playing' && <div className="gameplay-screen">
      <div ref={mountRef} style={{ position: 'fixed', inset: 0, opacity: 0, pointerEvents: 'none' }} />
      <Game3DCanvas key={`${levelIndex}-${levelStartNonce}`} ref={game3dRef} touchState={touchState} catCount={LEVELS[levelIndex].cats} captureRadius={2.2} isPaused={paused} isLevelComplete={screen === 'levelComplete'} capturedCatIds={capturedCatIds3D} speedMode={speedMode} jumpNonce={jumpNonce} levelIndex={levelIndex} onStarCollected={handleStarCollected} onPlayerPositionChange={setPlayerPosition3D} onNearestCatChange={(id, distance, inRange) => { setNearestCatId(id); setNearestCatDistance(distance); setIsCatInCaptureRange(inRange); if (distance < 6.5) setHint('🐾 Sigue el brillo... hay un michi cerca'); }} />
      <div className="level-world-backdrop" aria-hidden="true"><div className="floating-clouds"/><div className="sparkle-particles"/></div>
      <header className="integrated-hud" data-game-ui="true">
        <div className="hud-world">
          <span className="hud-kicker">Mundo</span>
          <strong>{LEVELS[levelIndex].name}</strong>
        </div>
        <div className="hud-stats" aria-label="estadísticas del nivel">
          <div className="hud-stat-chip"><span>🐱</span><b>{found}/{LEVELS[levelIndex].cats}</b></div>
          <div className="hud-stat-chip"><span>⏱️</span><b>{timeLeft}s</b></div>
          <div className="hud-stat-chip hud-score"><span>⭐</span><b>{score}</b></div>
          <div className="hud-stat-chip"><span>✨</span><b>{starCount}</b></div>
        </div>
        <div className="hud-actions" aria-label="acciones">
          <button data-game-ui="true" className="hud-icon-btn" aria-label={mute ? 'Activar audio' : 'Silenciar audio'} onClick={() => setMute((m) => !m)}>{mute ? '🔇' : '🔊'}</button>
          <button data-game-ui="true" className="hud-icon-btn" aria-label={paused ? 'Continuar juego' : 'Pausar juego'} onClick={() => setPaused((p) => !p)}>{paused ? '▶️' : '⏸️'}</button>
          <button data-game-ui="true" className="hud-icon-btn" aria-label="Volver al menú" onClick={() => { setScreen('menu'); stopGame(); }}>🏠</button>
        </div>
      </header>
      {isMobile && <MobileGameInputLayer touchState={touchState} isCatInCaptureRange={isCatInCaptureRange} onCatch={handleCatchAction} onJump={handleJumpAction} speedMode={speedMode} onToggleSpeed={() => setSpeedMode((m) => (m === 'fast' ? 'normal' : 'fast'))}  />}
      {!isMobile && <div data-game-ui="true" style={{ position: 'fixed', right: 14, bottom: 14, zIndex: 25, display:'flex', gap:8 }}>
        <button data-game-ui="true" className="catch-btn" onClick={() => setSpeedMode((m) => (m === 'fast' ? 'normal' : 'fast'))}>⚡ {speedMode === 'fast' ? 'Rápido' : 'Normal'}</button>
        <button data-game-ui="true" className="catch-btn" onClick={handleJumpAction}>⬆️ Saltar</button>
        <button data-game-ui="true" className={`catch-btn ${isCatInCaptureRange ? 'catch-btn-ready' : ''}`} onClick={handleCatchAction}>🐾 Atrapar gatito</button>
      </div>}
      <div style={{ position: 'fixed', bottom: 16, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: 700, textShadow: '0 2px 6px #000' }}>{hint}</div>
      {rescueToast && <div style={{ position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)', zIndex: 22, background: 'rgba(255,105,173,.88)', color: '#fff', padding: '8px 12px', borderRadius: 999, pointerEvents: 'none', animation: 'fadeToast 1.4s ease forwards' }}>{rescueToast}</div>}
      {paused && <Panel title='Juego en pausa'><button onClick={() => setPaused(false)}>Continuar</button><button onClick={() => startLevel(levelIndex)}>Reiniciar nivel</button><button onClick={() => { setScreen('menu'); stopGame(); }}>Menú</button></Panel>}
    </div>}

    {screen === 'levelComplete' && <div className="level-complete-shell"><div className="level-complete-card"><div className="lc-scroll"><div><h2>¡Nivel completado! ✨</h2><p>{LEVEL_STORY[Math.min(levelIndex + 1, LEVEL_STORY.length - 1)]}</p><p>Recolectaste {starCount} estrellitas mágicas.</p><p className="lc-world">🌎 {LEVELS[Math.min(levelIndex + 1, LEVELS.length - 1)].name}</p></div><div><h3>Gatitos encontrados</h3>{lastFoundProfiles.map((p) => <div key={p.id} className="lc-cat">🐱 {p.name} — {p.personality}</div>)}</div></div><div className="lc-footer"><button className="next-btn" onClick={() => { playSfx('nextLevel'); startLevel(levelIndex + 1); }}>Siguiente nivel</button></div></div></div>}
    {screen === 'complete' && <Panel title='Misión completa ✨'><SaritaMascot /><p>Puntuación final: {score}</p><button onClick={() => startLevel(0, true)}>Jugar de nuevo</button></Panel>}
    {screen === 'gameover' && <Panel title='Game Over'><button onClick={() => startLevel(levelIndex)}>Reintentar</button><button onClick={() => setScreen('menu')}>Menú</button></Panel>}
    {DEBUG_INPUT && screen === 'playing' && <div data-game-ui="true" style={{ position:'fixed', left:8, top:160, zIndex:95, background:'rgba(0,0,0,.75)', color:'#fff', padding:8, borderRadius:8, fontSize:11, fontFamily:'monospace' }}>
      <div>capturedCatIds: {JSON.stringify(capturedCatIds3D)}</div>
      <div>capturedCatIds.length: {capturedCatIds3D.length}</div>
      <div>totalCats: {LEVELS[levelIndex].cats}</div>
      <div>nearestCatId: {String(nearestCatId)}</div>
      <div>nearestCatDistance: {Number.isFinite(nearestCatDistance) ? nearestCatDistance.toFixed(2) : '∞'}</div>
      <div>visibleCats: {LEVELS[levelIndex].cats - capturedCatIds3D.length}</div>
      <div>isCatInCaptureRange: {String(isCatInCaptureRange)}</div>
      <div>lastCatchResult: {lastCatchResult ? JSON.stringify(lastCatchResult) : 'null'}</div>
      <div>lastCapturedCatId: {String(lastCapturedCatId)}</div>
      <div>levelCompleteQueued: {String(levelCompleteQueued)}</div>
      <div>currentLevelIndex: {levelIndex}</div>
      <div>speedMode: {speedMode}</div>
    </div>}
    {achievementToast && <div style={{ position: 'fixed', top: 70, right: 12, zIndex: 40, background: 'rgba(255,255,255,.92)', padding: '10px 12px', borderRadius: 12 }}>{achievementToast}</div>}
    <style>{cssSkin}</style>
  </div>;
}


function SaritaAvatar() {
  return <div className="sarita-avatar" aria-hidden="true">
    <span className="sarita-shadow"/>
    <span className="sarita-hair-back"/>
    <span className="sarita-leg leg-left"><i/></span>
    <span className="sarita-leg leg-right"><i/></span>
    <span className="sarita-body"/>
    <span className="sarita-arm arm-left"><i/></span>
    <span className="sarita-arm arm-right"><i/></span>
    <span className="sarita-head"><i className="eye eye-left"/><i className="eye eye-right"/><i className="mouth"/></span>
    <span className="sarita-bangs"/>
    <span className="sarita-hair-side left"/><span className="sarita-hair-side right"/>
    <span className="sarita-shoe shoe-left"/><span className="sarita-shoe shoe-right"/>
  </div>;
}

function SaritaMascot() { return <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,#ffd0ea,#cfa6ff)', display: 'grid', placeItems: 'center', fontSize: 54 }}>🪄</div>; }

function MagicBackdrop() {
  return <div className="magic-backdrop" aria-hidden="true"><span /><span /><span /><span /><span /></div>;
}

function PremiumStartScreen({ onPlay, onContinue, hasProgress, onOpenCollection, onOpenHow, onOpenCredits, onOpenAchievements }) {
  const actions = [
    ...(hasProgress ? [{ label: 'Continuar aventura', onClick: onContinue, Icon: BookIcon, tone: 'violet' }] : []),
    { label: 'Colección de michis', onClick: onOpenCollection, Icon: BasketCatIcon, tone: 'mint' },
    { label: 'Cómo jugar', onClick: onOpenHow, Icon: MapIcon, tone: 'peach' },
    { label: 'Créditos', onClick: onOpenCredits, Icon: QuillIcon, tone: 'blue' },
    { label: 'Logros', onClick: onOpenAchievements, Icon: TrophyIcon, tone: 'lilac' }
  ];

  return <section className="premium-start" aria-label="Pantalla de inicio">
    <div className="premium-card">
      <div className="copy-panel">
        <div className="tiny-badge"><SparkleIcon /> aventura kawaii premium</div>
        <h1>{GAME_TITLE}</h1>
        <p className="start-subtitle">{SUBTITLE}</p>
        <button className="start-cta" type="button" onClick={onPlay}><MagicWandIcon /> <span>Comenzar aventura</span></button>
        <div className="start-actions">
          {actions.map(({ label, onClick, Icon, tone }) => <button key={label} type="button" onClick={onClick} className={`start-action ${tone}`}><Icon /><span>{label}</span></button>)}
        </div>
      </div>
      <SaritaHeroIllustration />
      <div className="founders-badge"><PawStarIcon /> Creado por Bernard y <span className="name-sarita">Sarita</span></div>
    </div>
  </section>;
}

function SaritaHeroIllustration() {
  return <div className="hero-illustration" aria-hidden="true">
    <svg className="hero-svg" viewBox="0 0 560 520" role="img">
      <defs>
        <linearGradient id="castleGrad" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#efe9ff"/><stop offset="1" stopColor="#c5d7ff"/></linearGradient>
        <linearGradient id="robeGrad" x1="0" x2="1"><stop offset="0" stopColor="#9c63d8"/><stop offset="1" stopColor="#6d3eaa"/></linearGradient>
        <linearGradient id="cloudGrad" x1="0" x2="1"><stop offset="0" stopColor="#fff9ff"/><stop offset="1" stopColor="#e6edff"/></linearGradient>
        <radialGradient id="glow" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#fff8c7" stopOpacity="0.95"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></radialGradient>
      </defs>

      <circle cx="306" cy="218" r="204" fill="url(#glow)" />
      <path d="M88 154 C155 82 252 79 325 138 C384 185 439 171 491 124" fill="none" stroke="#ffe07e" strokeWidth="16" strokeLinecap="round" opacity="0.8"/>
      <path d="M82 186 C153 112 255 113 325 164 C389 211 438 198 496 151" fill="none" stroke="#ffabd5" strokeWidth="14" strokeLinecap="round" opacity="0.78"/>
      <path d="M78 216 C151 149 256 142 330 192 C395 237 441 229 502 183" fill="none" stroke="#a9d9ff" strokeWidth="13" strokeLinecap="round" opacity="0.76"/>

      <g opacity="0.58">
        <path d="M396 170h86v165h-86z" fill="url(#castleGrad)"/>
        <path d="M413 128l30-56 30 56zM365 190l26-48 26 48zM465 194l27-50 27 50z" fill="#b9a8ff"/>
        <rect x="367" y="190" width="50" height="145" rx="14" fill="#dce8ff"/>
        <rect x="466" y="194" width="54" height="141" rx="14" fill="#dce8ff"/>
        <rect x="423" y="226" width="30" height="52" rx="15" fill="#8d6aca" opacity="0.45"/>
      </g>

      <g className="star-field" fill="#fffbe9">
        <path d="M85 78l8 22 22 8-22 8-8 22-8-22-22-8 22-8z"/>
        <path d="M484 77l6 16 16 6-16 6-6 16-6-16-16-6 16-6z"/>
        <path d="M508 270l5 13 13 5-13 5-5 13-5-13-13-5 13-5z"/>
        <circle cx="118" cy="252" r="7"/><circle cx="448" cy="101" r="5"/><circle cx="72" cy="315" r="5"/>
      </g>

      <g className="sarita-character">
        <path d="M276 191c-56 7-90 56-83 121 9 74 66 112 134 96 63-15 95-70 82-133-13-62-68-91-133-84z" fill="#4d2a69" opacity="0.18"/>
        <path d="M230 214c-33 22-48 65-42 109 9 70 61 110 124 102 61-8 104-60 98-128-5-57-44-99-101-105-30-3-58 5-79 22z" fill="#3f254f"/>
        <path d="M223 324c19-51 54-80 93-80 42 0 79 30 99 82 12 32-18 74-98 76-82 3-107-44-94-78z" fill="url(#robeGrad)"/>
        <path d="M253 330c12 20 36 31 64 31s52-11 64-31" fill="none" stroke="#c9a7ff" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
        <circle cx="315" cy="219" r="70" fill="#ffcfbf"/>
        <path d="M236 206c14-48 57-72 103-62 34 7 60 31 71 66-42-9-73-32-91-63-16 38-44 57-83 59z" fill="#3d244b"/>
        <circle cx="288" cy="220" r="9" fill="#2f2340"/><circle cx="344" cy="220" r="9" fill="#2f2340"/>
        <circle cx="292" cy="216" r="3.5" fill="#fff"/><circle cx="348" cy="216" r="3.5" fill="#fff"/>
        <path d="M302 248c12 10 27 10 39 0" fill="none" stroke="#8e4961" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="270" cy="243" r="12" fill="#ff9cbd" opacity="0.62"/><circle cx="365" cy="243" r="12" fill="#ff9cbd" opacity="0.62"/>
        <path d="M259 164c22-24 67-28 101-8" fill="none" stroke="#ffb5df" strokeWidth="11" strokeLinecap="round"/>
        <circle cx="374" cy="159" r="12" fill="#ffd2ea"/><path d="M374 140l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="#fff6a5"/>
        <path d="M404 257l74-74" stroke="#ffd36e" strokeWidth="9" strokeLinecap="round"/>
        <path d="M485 149l10 25 27 8-24 14 1 28-22-18-27 10 10-26-18-22 28 2z" fill="#fff3a9" stroke="#ffb84d" strokeWidth="5"/>
      </g>

      <g className="clouds">
        <path d="M53 392c5-30 35-47 62-35 13-31 59-39 84-12 18-12 44-7 55 12 28-11 66 6 70 35 3 24-16 43-43 43H96c-29 0-47-19-43-43z" fill="url(#cloudGrad)"/>
        <path d="M316 392c6-31 38-49 67-35 18-35 69-40 94-5 35-5 66 13 70 43 3 25-18 44-47 44H360c-29 0-49-21-44-47z" fill="url(#cloudGrad)"/>
      </g>

      <StartCat className="cat-one" x="118" y="350" body="#ffb66f" spot="#ffe4bb" collar="#8e6bff" />
      <StartCat className="cat-two" x="247" y="363" body="#dce2ef" spot="#ffffff" collar="#6fb7ff" wink />
      <StartCat className="cat-three" x="392" y="354" body="#fffaf4" spot="#ffddea" collar="#ff80b8" />

      <g className="flowers">
        <circle cx="75" cy="438" r="8" fill="#ff9ccb"/><circle cx="93" cy="433" r="8" fill="#ff9ccb"/><circle cx="83" cy="421" r="8" fill="#ff9ccb"/><circle cx="86" cy="438" r="6" fill="#ffe47b"/>
        <circle cx="497" cy="432" r="7" fill="#c9a8ff"/><circle cx="514" cy="427" r="7" fill="#c9a8ff"/><circle cx="505" cy="414" r="7" fill="#c9a8ff"/><circle cx="506" cy="429" r="5" fill="#ffe47b"/>
      </g>
    </svg>
  </div>;
}

function StartCat({ x, y, body, spot, collar, wink = false, className = '' }) {
  return <g className={className} transform={`translate(${x} ${y})`}>
    <ellipse cx="0" cy="44" rx="50" ry="34" fill={body}/>
    <circle cx="17" cy="14" r="44" fill={body}/>
    <path d="M-15-18L-2-63 18-24zM43-17L72-54 69-6z" fill={body}/>
    <path d="M-5-23L1-45 11-26zM49-19L62-38 62-12z" fill="#ffc7d9" opacity="0.72"/>
    <ellipse cx="21" cy="25" rx="22" ry="16" fill={spot} opacity="0.82"/>
    {wink ? <path d="M-1 5c8 8 17 8 25 0" stroke="#2e2840" strokeWidth="5" strokeLinecap="round" fill="none"/> : <><circle cx="0" cy="5" r="7" fill="#2e2840"/><circle cx="35" cy="5" r="7" fill="#2e2840"/><circle cx="3" cy="2" r="2" fill="#fff"/><circle cx="38" cy="2" r="2" fill="#fff"/></>}
    <path d="M15 20c6 5 12 5 18 0" stroke="#8d4a62" strokeWidth="4" strokeLinecap="round" fill="none"/>
    <circle cx="-14" cy="23" r="8" fill="#ff9cbd" opacity="0.62"/><circle cx="49" cy="23" r="8" fill="#ff9cbd" opacity="0.62"/>
    <path d="M-21 38c21 13 57 13 78 0" stroke={collar} strokeWidth="8" strokeLinecap="round" fill="none"/>
    <circle cx="18" cy="50" r="7" fill="#fff6a1"/>
  </g>;
}

const IconShell = ({ children }) => <svg className="icon-svg" viewBox="0 0 64 64" aria-hidden="true">{children}</svg>;
function MagicWandIcon() { return <IconShell><path d="M42 8l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="currentColor"/><path d="M8 55L39 24" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/><path d="M15 48l7 7" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.85"/></IconShell>; }
function BookIcon() { return <IconShell><path d="M12 12h21c6 0 10 4 10 10v30H22c-6 0-10-4-10-10z" fill="none" stroke="currentColor" strokeWidth="5"/><path d="M43 12h9v40h-9zM21 24h14M21 34h12" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></IconShell>; }
function BasketCatIcon() { return <IconShell><path d="M14 30h36l-5 20H19z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/><path d="M22 30c2-13 18-13 20 0" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><circle cx="32" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M24 17l-4-8M40 17l4-8M28 25h.1M36 25h.1" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></IconShell>; }
function MapIcon() { return <IconShell><path d="M10 16l14-6 16 6 14-6v38l-14 6-16-6-14 6z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/><path d="M24 10v38M40 16v38" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></IconShell>; }
function QuillIcon() { return <IconShell><path d="M48 9c-18 2-31 15-35 36 13-2 29-14 35-36z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/><path d="M15 49l23-23M11 55h26" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></IconShell>; }
function TrophyIcon() { return <IconShell><path d="M22 12h20v13c0 11-5 18-10 18s-10-7-10-18z" fill="none" stroke="currentColor" strokeWidth="5"/><path d="M22 18H12c0 12 4 19 13 21M42 18h10c0 12-4 19-13 21M32 43v9M22 55h20" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><path d="M32 20l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor"/></IconShell>; }
function SparkleIcon() { return <IconShell><path d="M32 8l6 17 18 7-18 7-6 17-6-17-18-7 18-7z" fill="currentColor"/><circle cx="51" cy="14" r="4" fill="currentColor"/><circle cx="12" cy="48" r="3" fill="currentColor"/></IconShell>; }
function PawStarIcon() { return <IconShell><path d="M32 11l5 12 13 1-10 9 3 13-11-7-11 7 3-13-10-9 13-1z" fill="currentColor"/><circle cx="18" cy="15" r="5" fill="currentColor"/><circle cx="46" cy="15" r="5" fill="currentColor"/></IconShell>; }

const styles = {
  appShell: {
    minHeight: '100dvh',
    overflow: 'hidden',
    background: 'linear-gradient(135deg,#fdd8ea 0%,#d6c6ff 42%,#bde5ff 72%,#fff0d6 100%)',
    color: '#43204f',
    padding: 'max(10px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))'
  }
};

const cssSkin = `
@keyframes fadeToast{0%{opacity:0;transform:translate(-50%,-8px)}12%{opacity:1;transform:translate(-50%,0)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-6px)}}
@keyframes floatSoft{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(0,-12px,0) rotate(8deg)}}
@keyframes glowPulse{0%,100%{filter:drop-shadow(0 14px 30px rgba(255,124,213,.30))}50%{filter:drop-shadow(0 20px 42px rgba(255,124,213,.48))}}
.gameplay-screen,.mobile-game-input-layer{touch-action:none;overscroll-behavior:none;-webkit-user-select:none;user-select:none}
.magic-backdrop{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0;background:radial-gradient(circle at 18% 14%,rgba(255,255,255,.70),transparent 28%),radial-gradient(circle at 80% 20%,rgba(255,194,237,.58),transparent 30%),radial-gradient(circle at 72% 78%,rgba(168,214,255,.58),transparent 36%)}
.magic-backdrop span{position:absolute;width:clamp(16px,2vw,28px);aspect-ratio:1;background:rgba(255,255,255,.72);clip-path:polygon(50% 0,61% 35%,98% 50%,61% 65%,50% 100%,39% 65%,2% 50%,39% 35%);animation:floatSoft 5.8s ease-in-out infinite;box-shadow:0 0 34px rgba(255,255,255,.75)}
.magic-backdrop span:nth-child(1){left:9%;top:14%;animation-delay:-1s}.magic-backdrop span:nth-child(2){left:28%;top:78%;animation-delay:-3s}.magic-backdrop span:nth-child(3){left:68%;top:11%;animation-delay:-2s}.magic-backdrop span:nth-child(4){left:90%;top:54%;animation-delay:-4s}.magic-backdrop span:nth-child(5){left:52%;top:42%;animation-delay:-5s}
.premium-start{position:relative;z-index:1;min-height:calc(100dvh - 20px);display:grid;place-items:center;overflow:auto;padding:clamp(6px,1.4vw,16px)}
.premium-card{position:relative;width:min(1220px,98vw);min-height:min(86dvh,760px);display:grid;grid-template-columns:minmax(380px,1.02fr) minmax(330px,.98fr);align-items:center;gap:clamp(12px,2.2vw,28px);padding:clamp(18px,2.6vw,36px);border-radius:clamp(26px,4vw,46px);background:linear-gradient(145deg,rgba(255,255,255,.68),rgba(247,232,255,.72) 48%,rgba(255,226,239,.65));border:1px solid rgba(255,255,255,.72);box-shadow:0 30px 90px rgba(87,62,145,.28),inset 0 1px 0 rgba(255,255,255,.95);backdrop-filter:blur(18px)}
.premium-card::before{content:"";position:absolute;inset:12px;border-radius:calc(clamp(26px,4vw,46px) - 10px);border:1px solid rgba(255,255,255,.72);pointer-events:none}.premium-card::after{content:"";position:absolute;left:8%;right:8%;bottom:-18px;height:48px;border-radius:50%;background:rgba(91,70,139,.20);filter:blur(24px);z-index:-1}
.copy-panel{position:relative;z-index:2}.tiny-badge{width:max-content;max-width:100%;display:inline-flex;align-items:center;gap:7px;padding:7px 12px;margin-bottom:12px;border-radius:999px;background:rgba(255,255,255,.58);border:1px solid rgba(255,255,255,.8);font-size:clamp(.72rem,1.4vw,.9rem);letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#7b4bae;box-shadow:0 10px 24px rgba(118,69,171,.12)}
.tiny-badge .icon-svg{width:18px;height:18px}.copy-panel h1{margin:0;color:#6e2cb0;font-size:clamp(2.25rem,6vw,5.2rem);line-height:.92;font-weight:950;letter-spacing:-.06em;text-wrap:balance;text-shadow:0 3px 0 #fff,0 10px 24px rgba(151,88,224,.35)}
.start-subtitle{display:inline-block;margin:clamp(10px,1.8vh,18px) 0 0;padding:clamp(8px,1.4vw,12px) clamp(12px,1.8vw,18px);border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.74),rgba(244,215,255,.82));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 12px 24px rgba(126,75,175,.12);color:#6d3d86;font-weight:800;font-size:clamp(.94rem,1.8vw,1.16rem)}
.start-cta{margin-top:clamp(14px,2.1vh,22px);width:100%;min-height:clamp(56px,8.6vh,78px);border:0;border-radius:999px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:clamp(1.18rem,3vw,2.05rem);font-weight:950;color:#fff;background:linear-gradient(180deg,#ff91dd 0%,#e94fc6 48%,#b927a4 100%);box-shadow:0 18px 42px rgba(210,61,189,.38),inset 0 2px 0 rgba(255,255,255,.72),0 0 0 3px rgba(255,223,134,.28);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;animation:glowPulse 3.8s ease-in-out infinite}.start-cta:active,.start-action:active{transform:translateY(2px) scale(.99)}.start-cta:hover{box-shadow:0 22px 48px rgba(210,61,189,.48),inset 0 2px 0 rgba(255,255,255,.82),0 0 0 4px rgba(255,223,134,.34)}
.icon-svg{width:1.35em;height:1.35em;display:block;flex:0 0 auto}.start-cta .icon-svg{width:1.55em;height:1.55em;color:#fff7b9;filter:drop-shadow(0 0 10px rgba(255,255,255,.75))}
.start-actions{margin-top:clamp(10px,1.7vh,16px);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(8px,1.4vw,12px)}
.start-action{min-height:clamp(46px,7vh,58px);border:0;border-radius:999px;padding:10px clamp(10px,1.6vw,16px);display:flex;align-items:center;justify-content:center;gap:9px;font-size:clamp(.9rem,1.8vw,1.12rem);font-weight:900;color:#553069;box-shadow:0 10px 24px rgba(75,53,122,.13),inset 0 1px 0 rgba(255,255,255,.86);cursor:pointer;transition:transform .18s ease,filter .18s ease}.start-action:hover{filter:brightness(1.03)}.start-action.violet{background:linear-gradient(180deg,#efe6ff,#ccb7ff)}.start-action.mint{background:linear-gradient(180deg,#e6fff9,#baf2e8)}.start-action.peach{background:linear-gradient(180deg,#fff4df,#ffd2ac)}.start-action.blue{background:linear-gradient(180deg,#eaf4ff,#bdd9ff)}.start-action.lilac{background:linear-gradient(180deg,#f5e8ff,#d9bdff)}.start-action .icon-svg{color:#7446a7;width:1.25em;height:1.25em}
.hero-illustration{position:relative;z-index:1;border-radius:clamp(24px,3vw,36px);min-height:clamp(310px,58vh,590px);height:100%;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 56% 36%,rgba(255,255,255,.76),transparent 25%),linear-gradient(145deg,rgba(255,232,247,.72),rgba(197,212,255,.78) 58%,rgba(184,145,255,.72));box-shadow:inset 0 0 80px rgba(255,255,255,.56),0 22px 60px rgba(119,82,170,.16)}.hero-illustration::before{content:"";position:absolute;inset:10px;border-radius:28px;border:1px solid rgba(255,255,255,.62)}.hero-svg{width:min(100%,580px);height:100%;max-height:620px;overflow:visible}.star-field{filter:drop-shadow(0 0 12px rgba(255,255,255,.86))}.sarita-character{filter:drop-shadow(0 14px 20px rgba(85,46,109,.22))}.cat-one,.cat-two,.cat-three{filter:drop-shadow(0 12px 14px rgba(77,51,95,.18))}.founders-badge{position:absolute;z-index:5;left:50%;bottom:clamp(-16px,-1.7vh,-10px);transform:translateX(-50%);display:flex;align-items:center;gap:8px;white-space:nowrap;padding:9px 18px;border-radius:999px;background:linear-gradient(180deg,#fff8f0,#ffe9f4);border:1px solid rgba(255,255,255,.95);box-shadow:0 12px 30px rgba(105,72,131,.18);font-size:clamp(.86rem,1.5vw,1rem);font-weight:950;color:#7a4a75}.founders-badge .icon-svg{width:20px;height:20px;color:#f09aca}.founders-badge .name-sarita{color:#d4af37;text-shadow:0 1px 0 rgba(255,255,255,.45),0 0 8px rgba(212,175,55,.38)}
@media (orientation:landscape) and (max-height:500px){.premium-start{padding:2px}.premium-card{width:min(1180px,99vw);min-height:calc(100dvh - 18px);grid-template-columns:1.05fr .85fr;padding:clamp(10px,2.6vh,16px);gap:10px;border-radius:24px}.copy-panel h1{font-size:clamp(1.85rem,8.3vh,3.05rem);line-height:.9}.tiny-badge{display:none}.start-subtitle{font-size:.82rem;padding:6px 10px;margin-top:7px}.start-cta{min-height:46px;margin-top:9px;font-size:clamp(1rem,4.7vh,1.32rem)}.start-actions{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:8px}.start-action{min-height:38px;font-size:clamp(.72rem,3.4vh,.92rem);padding:7px 8px;gap:6px}.hero-illustration{min-height:calc(100dvh - 54px);border-radius:20px}.hero-svg{max-height:calc(100dvh - 34px)}.founders-badge{bottom:4px;font-size:.74rem;padding:6px 12px}.premium-card::before{inset:7px;border-radius:18px}}
@media (max-width:820px) and (orientation:portrait){.premium-start{align-items:start}.premium-card{grid-template-columns:1fr;min-height:auto;padding:18px 14px 42px}.hero-illustration{order:-1;min-height:260px}.copy-panel h1{font-size:clamp(2rem,12vw,3.5rem)}.start-actions{grid-template-columns:1fr}.founders-badge{bottom:10px}}
@media (max-width:560px){.start-actions{grid-template-columns:1fr}.start-action{justify-content:flex-start}.start-subtitle{border-radius:20px}.founders-badge{font-size:.76rem}}

.integrated-hud{position:fixed;left:50%;top:max(6px,env(safe-area-inset-top));transform:translateX(-50%);z-index:30;width:min(95vw,920px);display:grid;grid-template-columns:minmax(120px,1fr) auto auto;align-items:center;gap:clamp(6px,1.2vw,12px);padding:clamp(5px,1vw,10px) clamp(8px,1.4vw,14px);border-radius:18px;background:linear-gradient(160deg,rgba(91,62,144,.28),rgba(255,255,255,.22));backdrop-filter:blur(10px) saturate(120%);border:1px solid rgba(255,255,255,.42);box-shadow:0 10px 24px rgba(34,16,70,.2),inset 0 1px 0 rgba(255,255,255,.48);animation:hudReveal .45s ease both}
.hud-world{display:grid;gap:1px;min-width:0}.hud-world strong{font-size:clamp(.8rem,1.8vw,1rem);color:#fff6ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.01em}.hud-kicker{font-size:clamp(.56rem,1.2vw,.66rem);text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.7);font-weight:700}
.hud-stats{display:flex;align-items:center;gap:clamp(4px,.8vw,8px)}
.hud-stat-chip{display:inline-flex;align-items:center;gap:5px;padding:clamp(4px,.7vw,6px) clamp(7px,1.1vw,10px);border-radius:999px;background:rgba(255,255,255,.17);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:clamp(.72rem,1.6vw,.9rem);font-weight:800;box-shadow:inset 0 1px 0 rgba(255,255,255,.35)}
.hud-stat-chip span{font-size:.95em;filter:drop-shadow(0 1px 2px rgba(31,18,59,.4))}.hud-score b{color:#fff0be}
.hud-actions{display:flex;align-items:center;gap:6px;padding-left:2px;border-left:1px solid rgba(255,255,255,.3)}
.hud-icon-btn{width:clamp(31px,5.5vw,38px);height:clamp(31px,5.5vw,38px);display:grid;place-items:center;border:1px solid rgba(255,255,255,.3);border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,.15));color:#fff;font-size:clamp(.86rem,2vw,1rem);box-shadow:inset 0 1px 0 rgba(255,255,255,.5);transition:transform .14s ease,background .2s ease,box-shadow .2s ease}
.hud-icon-btn:hover{background:linear-gradient(180deg,rgba(255,255,255,.46),rgba(255,255,255,.2))}.hud-icon-btn:active{transform:translateY(1px) scale(.96);box-shadow:inset 0 1px 0 rgba(255,255,255,.32)}
@keyframes hudReveal{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}
.catch-btn{min-height:52px;min-width:132px;padding:10px 16px;border:0;border-radius:20px;background:linear-gradient(180deg,#ffbef1,#ff86d1 52%,#ef54bc);color:#fff;font-weight:900;box-shadow:0 10px 22px rgba(228,76,178,.34),0 0 0 2px rgba(255,255,255,.35) inset}
.catch-btn-ready{animation:catchPulse 1s ease-in-out infinite;box-shadow:0 10px 24px rgba(228,76,178,.48),0 0 0 3px rgba(255,247,166,.62) inset}
.catch-btn.mobile{min-width:116px;font-size:1rem}.catch-btn:active{transform:scale(.95)}
@keyframes catchPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.level-world-backdrop{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;background:radial-gradient(circle at 50% 8%,rgba(255,255,255,.14),transparent 38%)}
.floating-clouds,.sparkle-particles{position:absolute;inset:0;background-repeat:repeat;animation:panSky 70s linear infinite}.floating-clouds{opacity:.5}
.sparkle-particles{animation-duration:35s;background-image:radial-gradient(circle,rgba(255,255,255,.8) 0 2px,transparent 3px);background-size:180px 120px;opacity:.45}
@keyframes panSky{from{transform:translateX(0)}to{transform:translateX(-120px)}}
.sarita-avatar{position:fixed;left:50%;bottom:19%;width:138px;height:190px;transform:translateX(-50%);z-index:12;pointer-events:none;animation:avatarBounce .8s ease-in-out infinite}
.sarita-shadow{position:absolute;left:28px;bottom:8px;width:84px;height:18px;border-radius:50%;background:rgba(48,23,77,.28)}
.sarita-head{position:absolute;left:36px;top:20px;width:66px;height:64px;border-radius:32px;background:#ffd8c8;box-shadow:inset 0 -6px 0 rgba(0,0,0,.1)}
.sarita-bangs,.sarita-hair-back,.sarita-hair-side{position:absolute;background:linear-gradient(180deg,#6f3f47,#4f2a34)}
.sarita-hair-back{left:29px;top:17px;width:80px;height:85px;border-radius:40px 40px 32px 32px;z-index:-1;animation:hairSway .8s ease-in-out infinite}
.sarita-bangs{left:40px;top:22px;width:58px;height:20px;border-radius:20px 20px 10px 10px}
.sarita-hair-side.left{left:28px;top:44px;width:16px;height:34px;border-radius:20px}.sarita-hair-side.right{left:94px;top:44px;width:16px;height:34px;border-radius:20px}
.eye{position:absolute;top:24px;width:10px;height:14px;border-radius:10px;background:#2f2b40}.eye-left{left:16px}.eye-right{right:16px}.mouth{position:absolute;left:27px;bottom:12px;width:12px;height:6px;border-bottom:3px solid #9e5a6e;border-radius:0 0 10px 10px}
.sarita-body{position:absolute;left:34px;top:80px;width:72px;height:72px;border-radius:20px;background:linear-gradient(180deg,#9a7dff,#6a53de)}
.sarita-arm,.sarita-leg{position:absolute;background:#ffd8c8;border-radius:20px;transform-origin:top center}
.sarita-arm{top:86px;width:16px;height:46px}.arm-left{left:24px;animation:armRun .45s ease-in-out infinite}.arm-right{left:96px;animation:armRun .45s ease-in-out infinite reverse}
.sarita-leg{top:132px;width:18px;height:48px}.leg-left{left:48px;animation:legRun .45s ease-in-out infinite}.leg-right{left:76px;animation:legRun .45s ease-in-out infinite reverse}
.sarita-shoe{position:absolute;bottom:4px;width:28px;height:12px;border-radius:12px;background:#ffffff}.shoe-left{left:42px}.shoe-right{left:72px}
@keyframes legRun{0%,100%{transform:rotate(26deg)}50%{transform:rotate(-24deg)}}@keyframes armRun{0%,100%{transform:rotate(-22deg)}50%{transform:rotate(24deg)}}@keyframes avatarBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-5px)}}@keyframes hairSway{0%,100%{transform:rotate(0deg)}50%{transform:rotate(2deg)}}
.level-complete-shell{min-height:100dvh;display:grid;place-items:center;padding:clamp(10px,2vw,20px);padding-bottom:max(12px,env(safe-area-inset-bottom));}
.level-complete-card{width:min(940px,96vw);max-height:92svh;background:linear-gradient(160deg,rgba(255,255,255,.74),rgba(241,227,255,.75));backdrop-filter:blur(14px);border-radius:28px;border:1px solid rgba(255,255,255,.8);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 45px rgba(72,49,123,.2)}
.lc-scroll{padding:clamp(16px,2.3vw,24px);overflow:auto;display:grid;gap:12px}
.lc-footer{padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(255,255,255,.85);position:sticky;bottom:0}
.next-btn{width:100%;min-height:48px;border:0;border-radius:16px;background:linear-gradient(180deg,#8e7bff,#6c59e5);color:#fff;font-weight:800}
.lc-cat{padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.65);margin-bottom:8px}
@media (orientation: landscape) and (max-height: 520px){.level-complete-card{max-height:88svh}.lc-scroll{grid-template-columns:1fr 1fr;align-items:start;gap:16px}}
@media (max-width:760px){.integrated-hud{grid-template-columns:1fr auto;row-gap:6px}.hud-world{grid-column:1/2}.hud-stats{grid-column:1/3;justify-content:flex-start}.hud-actions{grid-column:2/3;grid-row:1/2;justify-self:end}.hud-stat-chip{padding:4px 8px}}
@media (orientation:landscape) and (max-height:520px){.integrated-hud{top:max(4px,env(safe-area-inset-top));padding:4px 8px;border-radius:14px}.hud-kicker{font-size:.52rem}.hud-world strong{font-size:.76rem}.hud-stat-chip{font-size:.7rem;padding:3px 7px}.hud-icon-btn{width:30px;height:30px}}
@media (prefers-reduced-motion: reduce){.catch-btn,.sarita-character .body,.floating-clouds,.sparkle-particles,.integrated-hud{animation:none !important}}
`;
function MichiCollection({ rescued, onBack }) { return <Panel title='Colección de michis'><SaritaMascot /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10 }}>{MICHI_PROFILES.map((p) => { const unlocked = rescued.includes(p.id); return <div key={p.id} style={{ borderRadius: 14, padding: 10, background: unlocked ? 'rgba(255,255,255,.8)' : 'rgba(60,60,90,.2)' }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: unlocked ? p.color : '#aaa' }} /> <b>{unlocked ? p.name : '???'}</b><div>{unlocked ? p.personality : 'Michi perdido'}</div><small>Nivel {p.level}</small><div>{unlocked ? p.phrase : 'Rescátalo para conocerlo'}</div></div>; })}</div><button onClick={onBack}>Volver</button></Panel>; }
function Panel({ title, children }) { return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><div style={{ width: 'min(700px,94vw)', borderRadius: 22, padding: 22, background: 'rgba(255,255,255,.65)', backdropFilter: 'blur(10px)' }}>{title && <h2>{title}</h2>}{children}</div></div>; }

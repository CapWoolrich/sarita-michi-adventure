import { Canvas, useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import WorldScene from './WorldScene';
import CharacterSarita3D from './CharacterSarita3D';
import CatEntity3D from './CatEntity3D';
import CaptureFX from './CaptureFX';
import useRobloxLikeControls from './useRobloxLikeControls';
import PostFX from './PostFX';
import SaritaTrail from './SaritaTrail';
import EnemyEntity from './enemies/EnemyEntity';
import RemotePlayer from './RemotePlayer';
import PowerUps from './PowerUps';
import BellEntity3D from './BellEntity3D';
import { getEnemyConfig } from './enemies/biomeEnemies';
import { GRAPHICS_PRESETS } from '../game/graphicsSettings';

const DEBUG_INPUT = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debugInput') === '1';
const DISABLE_FX = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('nofx') === '1';

const makeSnapshot = (player, cats, capturedCatIds, livePositions) => {
  const out = { player: player ? { x: player.x, z: player.z } : null, cats: [] };
  if (!player) return out;
  for (const cat of cats) {
    if (capturedCatIds.includes(cat.id)) continue;
    const live = livePositions[cat.id];
    out.cats.push({ id: cat.id, x: live?.x ?? cat.position[0], z: live?.z ?? cat.position[2], color: cat.color, golden: !!cat.golden });
  }
  return out;
};

function SceneRuntime({
  touchState,
  cats,
  capturedCatIds,
  captureStateRef,
  isPaused,
  isLevelComplete,
  onNearestCatChange,
  onDebugUpdate,
  speedMode,
  jumpRequestedRef,
  levelIndex,
  playerPositionRef,
  worldTheme,
  catLivePositionsRef,
  capturedFXList,
  removeFX,
  mapRadius,
  enemyConfigs,
  onEnemyHit,
  invulnUntilRef,
  outfitColor,
  hatColor,
  remotePlayers,
  onPowerUpCollect,
  graphicsProfile,
  bells = [],
  activatedBellIds = [],
  onBellActivate
}) {
  const characterRef = useRef();
  useRobloxLikeControls({ characterRef, touchState, isPaused, isLevelComplete, onDebugUpdate, speedMode, jumpRequestedRef });

  useFrame(() => {
    if (!characterRef.current) return;
    const p = characterRef.current.position;
    let nearestCat = null;
    let nearestDistance = Infinity;
    for (const cat of cats) {
      if (capturedCatIds.includes(cat.id)) continue;
      const live = catLivePositionsRef.current[cat.id];
      const cx = live?.x ?? cat.position[0];
      const cy = live?.y ?? cat.position[1];
      const cz = live?.z ?? cat.position[2];
      const distance = Math.hypot(cx - p.x, cy - p.y, cz - p.z);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestCat = { ...cat, livePosition: { x: cx, y: cy, z: cz } };
      }
    }
    captureStateRef.current = { player: { x: p.x, y: p.y, z: p.z }, nearestCat, nearestDistance };
    playerPositionRef.current = { x: p.x, y: p.y, z: p.z };
    onDebugUpdate?.({ player: { x: p.x.toFixed(2), y: p.y.toFixed(2), z: p.z.toFixed(2) }, nearestCatId: nearestCat?.id ?? null, nearestDistance: Number.isFinite(nearestDistance) ? Number(nearestDistance.toFixed(2)) : null, renderedCatIds: cats.filter((c) => !capturedCatIds.includes(c.id)).map((c) => c.id) });
    onNearestCatChange?.(nearestCat?.id ?? null, nearestDistance, nearestDistance <= 2.6);
  });

  const handleCatPosition = (id, pos) => {
    catLivePositionsRef.current[id] = { x: pos.x, y: pos.y, z: pos.z };
  };

  return (
    <>
      <WorldScene levelIndex={levelIndex} worldTheme={worldTheme} graphicsProfile={graphicsProfile} />
      {bells.map((bell) => (
        <BellEntity3D
          key={bell.id}
          bell={bell}
          activated={activatedBellIds.includes(bell.id)}
          playerPositionRef={playerPositionRef}
          onActivate={onBellActivate}
        />
      ))}
      {cats.map((cat) => {
        if (capturedCatIds.includes(cat.id)) return null;
        const player = playerPositionRef.current;
        const live = catLivePositionsRef.current[cat.id];
        const cx = live?.x ?? cat.position[0];
        const cz = live?.z ?? cat.position[2];
        const distance = player ? Math.hypot(cx - player.x, cz - player.z) : null;
        const highlight = captureStateRef.current?.nearestCat?.id === cat.id && (distance ?? Infinity) <= 2.6;
        return (
          <CatEntity3D
            key={cat.id}
            cat={cat}
            visible
            highlight={highlight}
            showDebugMarker={DEBUG_INPUT}
            distance={distance}
            mapRadius={mapRadius}
            onPositionUpdate={handleCatPosition}
          />
        );
      })}
      {capturedFXList.map((fx) => (
        <CaptureFX key={fx.id} position={[fx.x, fx.y, fx.z]} color={fx.color} onComplete={() => removeFX(fx.id)} />
      ))}
      <CharacterSarita3D characterRef={characterRef} animState="run" outfitColor={outfitColor} hatColor={hatColor} />
      <PowerUps count={graphicsProfile?.powerUpCount ?? 4} worldKey={`${worldTheme}-${levelIndex}`} playerPositionRef={playerPositionRef} onCollect={onPowerUpCollect} />
      {remotePlayers.map((rp) => (
        <RemotePlayer key={rp.id} peerId={rp.id} name={rp.name} color={rp.color} outfitColor={rp.outfitColor || rp.color} position={{ x: rp.x ?? 0, z: rp.z ?? 0 }} rotation={rp.ry ?? 0} />
      ))}
      <SaritaTrail characterRef={characterRef} active={speedMode === 'fast'} />
      {enemyConfigs.map((cfg, i) => (
        <EnemyEntity key={`enemy-${i}`} type={cfg.type} color={cfg.color} speed={cfg.speed} spawn={cfg.spawn} patrolRadius={cfg.patrolRadius} detectionRadius={cfg.detectionRadius} playerPositionRef={playerPositionRef} onHit={onEnemyHit} invulnUntilRef={invulnUntilRef} />
      ))}
    </>
  );
}

export default forwardRef(function Game3DCanvas(
  {
    touchState,
    cats,
    capturedCatIds,
    isPaused,
    isLevelComplete,
    speedMode,
    levelIndex,
    onNearestCatChange,
    worldTheme,
    mapRadius = 28,
    lowQuality = false,
    graphicsProfile,
    enemyCount = 1,
    onEnemyHit,
    invulnUntilRef,
    outfitColor,
    hatColor,
    remotePlayers = [],
    onPowerUpCollect,
    bells = [],
    activatedBellIds = [],
    onBellActivate,
    runtimeKey
  },
  ref
) {
  const localTouchState = useRef({ joystick: { x: 0, y: 0, magnitude: 0, active: false }, joy: { x: 0, y: 0, magnitude: 0 }, look: { dx: 0, dy: 0 } });
  const stateRef = touchState || localTouchState;
  const captureStateRef = useRef({});
  const jumpRequestedRef = useRef(false);
  const [debugState, setDebugState] = useState({});
  const playerPositionRef = useRef(null);
  const catLivePositionsRef = useRef({});
  const [capturedFXList, setCapturedFXList] = useState([]);
  const activeGraphics = graphicsProfile ?? (lowQuality ? GRAPHICS_PRESETS.low : GRAPHICS_PRESETS.high);

  useEffect(() => {
    catLivePositionsRef.current = {};
    captureStateRef.current = {};
    setCapturedFXList([]);
  }, [runtimeKey]);

  const removeFX = (id) => setCapturedFXList((prev) => prev.filter((fx) => fx.id !== id));
  const enemyConfigs = (() => {
    const base = getEnemyConfig(worldTheme);
    if (!base || enemyCount === 0) return [];
    return Array.from({ length: enemyCount }, (_, i) => {
      const a = (i / Math.max(1, enemyCount)) * Math.PI * 2 + 0.7;
      const r = 14 + i * 4;
      return { type: base.type, color: base.color, speed: base.speed, spawn: [Math.cos(a) * r, 0, Math.sin(a) * r], patrolRadius: 6, detectionRadius: 7 };
    });
  })();
  const spawnFX = (cat, pos) => {
    setCapturedFXList((prev) => [...prev, { id: `${cat.id}-${Date.now()}`, x: pos.x, y: pos.y, z: pos.z, color: cat.color }]);
  };

  useImperativeHandle(ref, () => ({
    requestJump: () => { jumpRequestedRef.current = true; },
    getRadarSnapshot: () => makeSnapshot(playerPositionRef.current, cats, capturedCatIds, catLivePositionsRef.current),
    isGolden: (catId) => cats.find((c) => c.id === catId)?.golden ?? false,
    getPlayerPosition: () => playerPositionRef.current,
    attemptCatch: () => {
      const { nearestCat, nearestDistance } = captureStateRef.current;
      if (!nearestCat) return { success: false, reason: 'no_cat' };
      if (nearestDistance > 2.6) return { success: false, reason: 'too_far', nearestCatId: nearestCat.id, distance: nearestDistance };
      const live = catLivePositionsRef.current[nearestCat.id] ?? { x: nearestCat.livePosition?.x ?? 0, y: nearestCat.livePosition?.y ?? 1, z: nearestCat.livePosition?.z ?? 0 };
      spawnFX(nearestCat, live);
      return { success: true, catId: nearestCat.id, distance: nearestDistance };
    }
  }), [cats, capturedCatIds]);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas shadows={activeGraphics.shadowQuality !== 'off' ? { type: THREE.PCFSoftShadowMap } : false} dpr={activeGraphics.dpr} gl={{ antialias: activeGraphics.antialias, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }} camera={{ fov: 55, near: 0.1, far: activeGraphics.cameraFar }} onCreated={({ gl }) => { gl.toneMappingExposure = 1.05; }}>
        <SceneRuntime
          touchState={stateRef}
          cats={cats}
          capturedCatIds={capturedCatIds}
          captureStateRef={captureStateRef}
          isPaused={isPaused}
          isLevelComplete={isLevelComplete}
          onNearestCatChange={onNearestCatChange}
          onDebugUpdate={DEBUG_INPUT ? setDebugState : undefined}
          speedMode={speedMode}
          jumpRequestedRef={jumpRequestedRef}
          levelIndex={levelIndex}
          playerPositionRef={playerPositionRef}
          worldTheme={worldTheme}
          catLivePositionsRef={catLivePositionsRef}
          capturedFXList={capturedFXList}
          removeFX={removeFX}
          mapRadius={mapRadius}
          enemyConfigs={enemyConfigs}
          onEnemyHit={onEnemyHit}
          invulnUntilRef={invulnUntilRef}
          outfitColor={outfitColor}
          hatColor={hatColor}
          remotePlayers={remotePlayers}
          onPowerUpCollect={onPowerUpCollect}
          graphicsProfile={activeGraphics}
          bells={bells}
          activatedBellIds={activatedBellIds}
          onBellActivate={onBellActivate}
        />
        {!DISABLE_FX && activeGraphics.postfxEnabled && <PostFX />}
      </Canvas>
      {DEBUG_INPUT && (
        <pre style={{ position: 'fixed', top: 88, right: 6, zIndex: 99, background: '#0009', color: '#fff', fontSize: 10 }}>
          {JSON.stringify(debugState, null, 2)}
        </pre>
      )}
    </div>
  );
});

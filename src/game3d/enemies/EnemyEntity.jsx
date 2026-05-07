import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { playEnemyAlert } from '../../game/audio/BiomeAudio';
import * as THREE from 'three';

function useToon() {
  return useMemo(() => {
    const data = new Uint8Array([60, 130, 200, 255]);
    const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

const RedEyes = ({ y = 0.55, x = 0.7, dz = 0.1 }) => (
  <>
    <mesh position={[x, y, dz]}><sphereGeometry args={[0.05, 8, 6]} /><meshBasicMaterial color="#ff3b3b" toneMapped={false} /></mesh>
    <mesh position={[x, y, -dz]}><sphereGeometry args={[0.05, 8, 6]} /><meshBasicMaterial color="#ff3b3b" toneMapped={false} /></mesh>
  </>
);

/* ---- LOBO (mystic-forest) ---- */
function WolfBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow><capsuleGeometry args={[0.34, 0.7, 6, 12]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.55, 0.55, 0]} castShadow><sphereGeometry args={[0.28, 14, 12]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.78, 0.5, 0]} castShadow rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.16, 0.3, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.45, 0.85, 0.14]} rotation={[0, 0, -0.3]} castShadow><coneGeometry args={[0.09, 0.2, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.45, 0.85, -0.14]} rotation={[0, 0, -0.3]} castShadow><coneGeometry args={[0.09, 0.2, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <RedEyes y={0.6} x={0.7} dz={0.1} />
      <mesh position={[-0.55, 0.45, 0]} rotation={[0, 0, -0.4]} castShadow><capsuleGeometry args={[0.06, 0.4, 4, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      {[[0.25, 0.2], [0.25, -0.2], [-0.25, 0.2], [-0.25, -0.2]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.05, p[1]]} castShadow><cylinderGeometry args={[0.07, 0.08, 0.3, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      ))}
    </group>
  );
}

/* ---- ZORRO (sakura-city) — naranja con orejas grandes ---- */
function FoxBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow><capsuleGeometry args={[0.28, 0.5, 6, 10]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.45, 0.5, 0]} castShadow><sphereGeometry args={[0.24, 14, 12]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.65, 0.46, 0]} castShadow rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.13, 0.26, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.4, 0.85, 0.14]} rotation={[0, 0, -0.2]} castShadow><coneGeometry args={[0.11, 0.34, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.4, 0.85, -0.14]} rotation={[0, 0, -0.2]} castShadow><coneGeometry args={[0.11, 0.34, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <RedEyes y={0.55} x={0.6} dz={0.09} />
      {/* Cola peluda blanca */}
      <mesh position={[-0.5, 0.45, 0]} rotation={[0, 0, 0.5]} castShadow><capsuleGeometry args={[0.12, 0.4, 6, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[-0.7, 0.55, 0]} castShadow><sphereGeometry args={[0.13, 12, 8]} /><meshToonMaterial color="#ffffff" gradientMap={gradientMap} /></mesh>
      {[[0.2, 0.18], [0.2, -0.18], [-0.2, 0.18], [-0.2, -0.18]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.05, p[1]]} castShadow><cylinderGeometry args={[0.06, 0.07, 0.25, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      ))}
    </group>
  );
}

/* ---- COCODRILO (crystal-lake) — verde, hocico largo, espalda con escamas ---- */
function CrocodileBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow><boxGeometry args={[1.0, 0.32, 0.5]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.7, 0.16, 0]} castShadow><boxGeometry args={[0.6, 0.22, 0.36]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.95, 0.2, 0]} castShadow><boxGeometry args={[0.18, 0.14, 0.28]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      {/* Ojos en el tope */}
      <mesh position={[0.55, 0.38, 0.12]}><sphereGeometry args={[0.08, 10, 8]} /><meshBasicMaterial color="#ffd066" toneMapped={false} /></mesh>
      <mesh position={[0.55, 0.38, -0.12]}><sphereGeometry args={[0.08, 10, 8]} /><meshBasicMaterial color="#ffd066" toneMapped={false} /></mesh>
      <mesh position={[0.55, 0.42, 0.12]}><sphereGeometry args={[0.04, 8, 6]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0.55, 0.42, -0.12]}><sphereGeometry args={[0.04, 8, 6]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      {/* Dientes */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.85 - i * 0.08, 0.13, 0.16]}><coneGeometry args={[0.025, 0.06, 4]} /><meshBasicMaterial color="#ffffff" /></mesh>
      ))}
      {/* Espinas dorsales */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`sp-${i}`} position={[-0.3 + i * 0.2, 0.4, 0]} castShadow><coneGeometry args={[0.06, 0.2, 4]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      ))}
      {/* Cola larga */}
      <mesh position={[-0.7, 0.16, 0]} rotation={[0, 0, 0.0]} castShadow><coneGeometry args={[0.18, 0.6, 6]} rotation={[0, 0, Math.PI / 2]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      {/* Patas cortas */}
      {[[0.3, 0.2], [0.3, -0.2], [-0.3, 0.2], [-0.3, -0.2]].map((p, i) => (
        <mesh key={`l-${i}`} position={[p[0], -0.02, p[1]]} castShadow><boxGeometry args={[0.16, 0.16, 0.16]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      ))}
    </group>
  );
}

/* ---- FANTASMA (mist-grove) — flota, semi-transparente ---- */
function GhostBody({ color }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.45, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Cola ondulante */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.45, 0.3, 0.25, 18]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Ojos vacíos negros */}
      <mesh position={[0.15, 0.55, 0.36]}><sphereGeometry args={[0.06, 10, 8]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[-0.15, 0.55, 0.36]}><sphereGeometry args={[0.06, 10, 8]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0, 0.4, 0.4]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.15, 0.04, 0.04]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <pointLight intensity={0.3} distance={3} color={color} />
    </group>
  );
}

/* ---- BÚHO (cloud-valley, moon-garden) ---- */
function OwlBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow><sphereGeometry args={[0.42, 14, 12]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0, 0.5, 0.32]}><circleGeometry args={[0.3, 16]} /><meshBasicMaterial color="#fff8e1" /></mesh>
      <mesh position={[-0.12, 0.55, 0.34]}><sphereGeometry args={[0.12, 12, 10]} /><meshBasicMaterial color="#ffd066" toneMapped={false} /></mesh>
      <mesh position={[0.12, 0.55, 0.34]}><sphereGeometry args={[0.12, 12, 10]} /><meshBasicMaterial color="#ffd066" toneMapped={false} /></mesh>
      <mesh position={[-0.12, 0.55, 0.42]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0.12, 0.55, 0.42]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0, 0.42, 0.42]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.06, 0.12, 4]} /><meshBasicMaterial color="#ffaa44" /></mesh>
      <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow><sphereGeometry args={[0.18, 8, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow><sphereGeometry args={[0.18, 8, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
    </group>
  );
}

/* ---- TIBURÓN (pastel-port) — solo aleta + sombra en agua ---- */
function SharkBody({ color }) {
  return (
    <group>
      {/* Cuerpo bajo agua (sombra) */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.6, 12, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* Aleta dorsal */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <coneGeometry args={[0.18, 0.5, 3]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Salpicadura */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.7, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---- DRAGÓN (cloud-valley alterno o moon) ---- */
function DragonBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow><sphereGeometry args={[0.4, 14, 12]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.5, 0.55, 0]} castShadow><sphereGeometry args={[0.32, 14, 12]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      {/* Cuernos */}
      <mesh position={[0.4, 0.85, 0.15]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.06, 0.25, 5]} /><meshStandardMaterial color="#ffe66b" /></mesh>
      <mesh position={[0.4, 0.85, -0.15]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.06, 0.25, 5]} /><meshStandardMaterial color="#ffe66b" /></mesh>
      {/* Ojos amenazantes */}
      <RedEyes y={0.6} x={0.66} dz={0.13} />
      {/* Alas */}
      <mesh position={[-0.1, 0.7, 0.5]} rotation={[0, -0.3, 0.4]} castShadow>
        <boxGeometry args={[0.1, 0.7, 1.0]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.1, 0.7, -0.5]} rotation={[0, 0.3, 0.4]} castShadow>
        <boxGeometry args={[0.1, 0.7, 1.0]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Cola con punta */}
      <mesh position={[-0.55, 0.45, 0]} rotation={[0, 0, -0.5]} castShadow><capsuleGeometry args={[0.1, 0.5, 6, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
    </group>
  );
}

/* ---- MURCIÉLAGO (moon-garden) ---- */
function BatBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow><sphereGeometry args={[0.22, 12, 10]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      {/* Orejas grandes puntiagudas */}
      <mesh position={[0.05, 0.65, 0.1]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.06, 0.22, 4]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.05, 0.65, -0.1]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.06, 0.22, 4]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      {/* Alas */}
      <mesh position={[0, 0.4, 0.4]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.05, 0.45, 0.7]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.4, -0.4]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.05, 0.45, 0.7]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>
      {/* Ojos brillantes */}
      <mesh position={[0.18, 0.42, 0.1]}><sphereGeometry args={[0.04, 8, 6]} /><meshBasicMaterial color="#ffd066" toneMapped={false} /></mesh>
      <mesh position={[0.18, 0.42, -0.1]}><sphereGeometry args={[0.04, 8, 6]} /><meshBasicMaterial color="#ffd066" toneMapped={false} /></mesh>
    </group>
  );
}

/* ---- CANGREJO (cotton-beach) ---- */
function CrabBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow><sphereGeometry args={[0.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[-0.12, 0.34, 0.22]}><cylinderGeometry args={[0.02, 0.02, 0.15, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.12, 0.34, 0.22]}><cylinderGeometry args={[0.02, 0.02, 0.15, 6]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[-0.12, 0.42, 0.22]}><sphereGeometry args={[0.06, 8, 6]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0.12, 0.42, 0.22]}><sphereGeometry args={[0.06, 8, 6]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[-0.45, 0.18, 0.25]} rotation={[0, 0, 0.3]} castShadow><boxGeometry args={[0.2, 0.18, 0.15]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.45, 0.18, 0.25]} rotation={[0, 0, -0.3]} castShadow><boxGeometry args={[0.2, 0.18, 0.15]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
    </group>
  );
}

/* ---- YETI (aurora-mountain) — peludo blanco gigante ---- */
function YetiBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow><sphereGeometry args={[0.55, 14, 12]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0, 1.45, 0]} castShadow><sphereGeometry args={[0.42, 14, 12]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      {/* Cara más oscura */}
      <mesh position={[0, 1.4, 0.32]}><sphereGeometry args={[0.28, 14, 10]} /><meshStandardMaterial color="#d8e0e8" /></mesh>
      {/* Ojos */}
      <mesh position={[-0.12, 1.5, 0.45]}><sphereGeometry args={[0.05, 8, 6]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0.12, 1.5, 0.45]}><sphereGeometry args={[0.05, 8, 6]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      {/* Brazos */}
      <mesh position={[-0.55, 0.85, 0]} castShadow><capsuleGeometry args={[0.18, 0.6, 6, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.55, 0.85, 0]} castShadow><capsuleGeometry args={[0.18, 0.6, 6, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      {/* Piernas */}
      <mesh position={[-0.22, 0.18, 0]} castShadow><capsuleGeometry args={[0.18, 0.45, 6, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
      <mesh position={[0.22, 0.18, 0]} castShadow><capsuleGeometry args={[0.18, 0.45, 6, 8]} /><meshToonMaterial color={color} gradientMap={gradientMap} /></mesh>
    </group>
  );
}

/* ---- ALIEN (stellar-village) — verde, antenas, OVNI ---- */
function AlienBody({ color }) {
  return (
    <group>
      {/* Cuerpo OVNI */}
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.4, 0.18, 16]} />
        <meshStandardMaterial color="#7d4ad6" metalness={0.7} roughness={0.3} emissive="#7d4ad6" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.32, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#a8e8ff" transparent opacity={0.6} metalness={0.4} />
      </mesh>
      {/* Alien adentro */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Luces */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.55, -0.05, Math.sin(a) * 0.55]}>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshBasicMaterial color="#ff66cc" toneMapped={false} />
          </mesh>
        );
      })}
      <pointLight intensity={1} distance={4} color="#a8e8ff" />
    </group>
  );
}

/* ---- CYBERBOT (neon-city) — robot futurista ---- */
function CyberBot({ color }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Cabeza */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.45, 0.4, 0.4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} emissive="#ff66cc" emissiveIntensity={0.2} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.05, 0.21]}>
        <boxGeometry args={[0.36, 0.12, 0.02]} />
        <meshBasicMaterial color="#00d4ff" toneMapped={false} />
      </mesh>
      {/* Antena */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
      </mesh>
      {/* Brazos */}
      <mesh position={[-0.45, 0.5, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.45, 0.5, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Piernas */}
      <mesh position={[-0.18, 0.0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 1.05, 0.4]} intensity={0.6} distance={3} color="#00d4ff" />
    </group>
  );
}

const BODIES = {
  wolf: WolfBody,
  fox: FoxBody,
  crocodile: CrocodileBody,
  ghost: GhostBody,
  owl: OwlBody,
  shark: SharkBody,
  dragon: DragonBody,
  bat: BatBody,
  crab: CrabBody,
  yeti: YetiBody,
  alien: AlienBody,
  cyberbot: CyberBot,
  drone: CyberBot
};

const FLYING_TYPES = new Set(['ghost', 'owl', 'dragon', 'bat', 'alien', 'drone']);
const FLOATING_TYPES = new Set(['shark']);

function pickPatrolTarget(center, radius) {
  const a = Math.random() * Math.PI * 2;
  const r = radius * 0.5 + Math.random() * radius * 0.5;
  return [center[0] + Math.cos(a) * r, 0, center[2] + Math.sin(a) * r];
}

export default function EnemyEntity({
  type = 'wolf',
  spawn = [0, 0, 0],
  patrolRadius = 10,
  detectionRadius = 9,
  speed = 1.4,
  color = '#5a4030',
  playerPositionRef,
  onHit,
  invulnUntilRef
}) {
  const groupRef = useRef();
  const breathRef = useRef();
  const gradientMap = useToon();
  const stateRef = useRef({ x: spawn[0], z: spawn[2], target: pickPatrolTarget(spawn, patrolRadius), wasChasing: false, lastAlertAt: 0 });
  const [alertVisible, setAlertVisible] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const player = playerPositionRef?.current;
    const s = stateRef.current;

    let mode = 'patrol';
    if (player) {
      const distToPlayer = Math.hypot(player.x - s.x, player.z - s.z);
      if (distToPlayer < detectionRadius) mode = 'chase';
    }

    const target = mode === 'chase' && player ? [player.x, 0, player.z] : s.target;
    const dx = target[0] - s.x;
    const dz = target[2] - s.z;
    const dist = Math.hypot(dx, dz);
    const stepSpeed = mode === 'chase' ? speed * 1.4 : speed * 0.6;

    if (dist < 0.3 && mode === 'patrol') {
      s.target = pickPatrolTarget(spawn, patrolRadius);
    } else if (dist > 0.05) {
      const nx = dx / dist;
      const nz = dz / dist;
      s.x += nx * stepSpeed * dt;
      s.z += nz * stepSpeed * dt;
      const targetRot = Math.atan2(nx, nz) - Math.PI / 2;
      let diff = targetRot - groupRef.current.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.18;
    }

    let yBase = 0;
    if (FLYING_TYPES.has(type)) yBase = 1.8 + Math.sin(Date.now() * 0.003) * 0.2;
    else if (FLOATING_TYPES.has(type)) yBase = 0.05 + Math.sin(Date.now() * 0.004) * 0.04;
    groupRef.current.position.set(s.x, yBase, s.z);

    // Animación idle: respiración (escala Y leve)
    if (breathRef.current) {
      const breathScale = 1 + Math.sin(Date.now() * 0.003) * 0.04;
      breathRef.current.scale.y = breathScale;
    }

    if (player) {
      const distToPlayer = Math.hypot(player.x - s.x, player.z - s.z);
      const now = Date.now();
      const invulnUntil = invulnUntilRef?.current ?? 0;

      // Detectar inicio de persecución → sonido de alerta + indicador visual
      const isChasing = distToPlayer < detectionRadius;
      if (isChasing && !s.wasChasing) {
        // Empezó a perseguir
        if (now - s.lastAlertAt > 2000) {
          playEnemyAlert?.(type).catch?.(() => {});
          s.lastAlertAt = now;
          setAlertVisible(true);
          setTimeout(() => setAlertVisible(false), 1500);
        }
      }
      s.wasChasing = isChasing;

      if (distToPlayer < 1.6 && now > invulnUntil) {
        onHit?.(now);
      }
    }
  });

  const Body = BODIES[type] ?? WolfBody;
  const scale = ENEMY_SCALES[type] ?? 1.5;
  return (
    <group ref={groupRef} position={spawn} scale={scale}>
      <group ref={breathRef}>
        <Body color={color} gradientMap={gradientMap} />
      </group>
      {/* Anillo de detección */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[detectionRadius / scale - 0.2, detectionRadius / scale, 48]} />
        <meshBasicMaterial color="#ff3b3b" transparent opacity={0.12} toneMapped={false} />
      </mesh>
      {/* Indicador de alerta — exclamación que aparece al perseguir */}
      {alertVisible && (
        <group position={[0, 2.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 12, 8]} />
            <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <coneGeometry args={[0.08, 0.2, 8]} />
            <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

const ENEMY_SCALES = {
  wolf: 1.7,
  fox: 1.4,
  crocodile: 1.8,
  ghost: 1.5,
  owl: 1.4,
  shark: 1.8,
  dragon: 1.9,
  bat: 1.3,
  crab: 1.5,
  yeti: 2.0,
  alien: 1.6,
  cyberbot: 1.7,
  drone: 1.5
};

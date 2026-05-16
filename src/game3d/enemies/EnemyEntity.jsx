import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { playEnemyAlert } from '../../game/audio/BiomeAudio';

/**
 * Enemigos REALISTAS ATERRADORES — diseñados como animales/criaturas reales
 * con anatomía detallada, no formas primitivas cute.
 */

function useToon() {
  return useMemo(() => {
    const data = new Uint8Array([40, 100, 170, 230]);
    const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

const RedEyes = ({ y, x, dz, size = 0.07 }) => (
  <>
    <mesh position={[x, y, dz]}>
      <sphereGeometry args={[size, 10, 8]} />
      <meshBasicMaterial color="#ff1010" toneMapped={false} />
    </mesh>
    <mesh position={[x, y, -dz]}>
      <sphereGeometry args={[size, 10, 8]} />
      <meshBasicMaterial color="#ff1010" toneMapped={false} />
    </mesh>
    <mesh position={[x + 0.02, y, dz]}>
      <sphereGeometry args={[size * 0.4, 6, 6]} />
      <meshBasicMaterial color="#1a0000" />
    </mesh>
    <mesh position={[x + 0.02, y, -dz]}>
      <sphereGeometry args={[size * 0.4, 6, 6]} />
      <meshBasicMaterial color="#1a0000" />
    </mesh>
  </>
);

/* ===================== LOBO TERRORÍFICO ===================== */
function WolfBody({ color, gradientMap }) {
  return (
    <group>
      {/* Cuerpo alargado peludo */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1.0, 8, 14]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Tufos de pelo en cuello */}
      {[-0.2, -0.1, 0, 0.1, 0.2].map((zo, i) => (
        <mesh key={`fur-${i}`} position={[0.35, 0.85, zo]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.08, 0.25, 5]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
      {/* Cabeza alargada lobo */}
      <mesh position={[0.7, 0.75, 0]} rotation={[0, 0, -0.1]} castShadow>
        <capsuleGeometry args={[0.28, 0.35, 6, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Hocico largo */}
      <mesh position={[1.05, 0.6, 0]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.17, 0.5, 8]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Nariz negra */}
      <mesh position={[1.22, 0.5, 0]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      {/* Boca abierta — colmillos */}
      <mesh position={[1.15, 0.4, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.2]} />
        <meshBasicMaterial color="#3a0000" />
      </mesh>
      {[-0.06, 0.06].map((zo, i) => (
        <mesh key={`fang-up-${i}`} position={[1.16, 0.42, zo]}>
          <coneGeometry args={[0.022, 0.1, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {[-0.06, 0.06].map((zo, i) => (
        <mesh key={`fang-dn-${i}`} position={[1.16, 0.35, zo]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.022, 0.1, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Saliva */}
      <mesh position={[1.18, 0.32, 0]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshBasicMaterial color="#ff5050" />
      </mesh>
      {/* Orejas puntiagudas */}
      <mesh position={[0.55, 1.05, 0.18]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.1, 0.32, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.55, 1.05, -0.18]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.1, 0.32, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <RedEyes y={0.85} x={0.92} dz={0.13} size={0.06} />
      <pointLight position={[1.0, 0.85, 0]} intensity={0.4} distance={2} color="#ff0000" />
      {/* Cola peluda */}
      <mesh position={[-0.7, 0.6, 0]} rotation={[0, 0, -0.6]} castShadow>
        <capsuleGeometry args={[0.1, 0.55, 6, 8]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.95, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* 4 patas largas */}
      {[[0.35, 0.22], [0.35, -0.22], [-0.3, 0.22], [-0.3, -0.22]].map((p, i) => (
        <group key={`leg-${i}`} position={[p[0], 0.25, p[1]]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.085, 0.075, 0.5, 8]} />
            <meshToonMaterial color={color} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.05, -0.25, 0]} castShadow>
            <boxGeometry args={[0.18, 0.12, 0.16]} />
            <meshToonMaterial color={color} gradientMap={gradientMap} />
          </mesh>
          {/* Garras */}
          {[-0.04, 0, 0.04].map((zo, j) => (
            <mesh key={`claw-${j}`} position={[0.13, -0.3, zo]}>
              <coneGeometry args={[0.012, 0.06, 4]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ===================== ZORRO TERRORÍFICO ===================== */
function FoxBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.7, 8, 12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Pecho blanco */}
      <mesh position={[0.25, 0.45, 0]}>
        <sphereGeometry args={[0.28, 14, 10]} />
        <meshToonMaterial color="#fff5e8" gradientMap={gradientMap} />
      </mesh>
      {/* Cabeza con hocico */}
      <mesh position={[0.55, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.28, 14, 12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.8, 0.55, 0]} rotation={[0, 0, -0.2]} castShadow>
        <coneGeometry args={[0.14, 0.3, 8]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.92, 0.5, 0]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* Boca abierta */}
      <mesh position={[0.85, 0.42, 0]}>
        <boxGeometry args={[0.13, 0.08, 0.18]} />
        <meshBasicMaterial color="#3a0a0a" />
      </mesh>
      {[-0.05, 0.05].map((zo, i) => (
        <mesh key={i} position={[0.86, 0.43, zo]}>
          <coneGeometry args={[0.016, 0.07, 4]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      ))}
      {/* Orejas grandes triangulares */}
      <mesh position={[0.4, 0.95, 0.15]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.12, 0.38, 5]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.4, 0.95, -0.15]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.12, 0.38, 5]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.42, 0.98, 0.15]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.06, 0.22, 5]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.42, 0.98, -0.15]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.06, 0.22, 5]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <RedEyes y={0.7} x={0.7} dz={0.11} size={0.05} />
      {/* Cola enorme blanca al final */}
      <mesh position={[-0.5, 0.55, 0]} rotation={[0, 0, 0.5]} castShadow>
        <capsuleGeometry args={[0.14, 0.5, 8, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.78, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.17, 14, 10]} />
        <meshToonMaterial color="#fff8f0" gradientMap={gradientMap} />
      </mesh>
      {[[0.22, 0.18], [0.22, -0.18], [-0.22, 0.18], [-0.22, -0.18]].map((p, i) => (
        <group key={i} position={[p[0], 0.25, p[1]]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.4, 8]} />
            <meshToonMaterial color={color} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, -0.21, 0]}>
            <boxGeometry args={[0.1, 0.08, 0.12]} />
            <meshToonMaterial color="#1a1a1a" gradientMap={gradientMap} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ===================== COCODRILO REALISTA ===================== */
function CrocodileBody({ color, gradientMap }) {
  return (
    <group>
      {/* Cuerpo largo bajo */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[1.6, 0.4, 0.7]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Espinas dorsales fila */}
      {[-0.6, -0.4, -0.2, 0, 0.2, 0.4].map((xo, i) => (
        <mesh key={`spine-${i}`} position={[xo, 0.48, 0]} castShadow>
          <coneGeometry args={[0.09 - i * 0.005, 0.22, 4]} />
          <meshToonMaterial color={'#3a5a3a'} gradientMap={gradientMap} />
        </mesh>
      ))}
      {/* Cabeza ancha + hocico larguísimo */}
      <mesh position={[0.85, 0.2, 0]} castShadow>
        <boxGeometry args={[0.55, 0.32, 0.6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[1.3, 0.18, 0]} castShadow>
        <boxGeometry args={[0.45, 0.22, 0.4]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[1.5, 0.18, 0]} castShadow>
        <boxGeometry args={[0.18, 0.16, 0.3]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Hocico arriba protuberante con ojos */}
      <mesh position={[0.8, 0.42, 0.14]}>
        <boxGeometry args={[0.16, 0.12, 0.12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.8, 0.42, -0.14]}>
        <boxGeometry args={[0.16, 0.12, 0.12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <RedEyes y={0.48} x={0.8} dz={0.14} size={0.06} />
      {/* Dientes superiores e inferiores en fila */}
      {[1.15, 1.25, 1.35, 1.45].map((xo, i) => (
        <mesh key={`tooth-u-${i}`} position={[xo, 0.12, 0.13]}>
          <coneGeometry args={[0.025, 0.08, 4]} />
          <meshBasicMaterial color="#fff5e0" />
        </mesh>
      ))}
      {[1.15, 1.25, 1.35, 1.45].map((xo, i) => (
        <mesh key={`tooth-u2-${i}`} position={[xo, 0.12, -0.13]}>
          <coneGeometry args={[0.025, 0.08, 4]} />
          <meshBasicMaterial color="#fff5e0" />
        </mesh>
      ))}
      {/* Cola larga puntiaguda */}
      <mesh position={[-1.0, 0.2, 0]} castShadow>
        <coneGeometry args={[0.22, 1.0, 4]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-1.55, 0.18, 0]} castShadow>
        <coneGeometry args={[0.1, 0.4, 4]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Espinas en cola */}
      {[-0.85, -1.05, -1.25].map((xo, i) => (
        <mesh key={`tail-spine-${i}`} position={[xo, 0.42, 0]} castShadow>
          <coneGeometry args={[0.06 - i * 0.012, 0.16, 4]} />
          <meshToonMaterial color="#3a5a3a" gradientMap={gradientMap} />
        </mesh>
      ))}
      {/* 4 patas cortas robustas */}
      {[[0.4, 0.3], [0.4, -0.3], [-0.4, 0.3], [-0.4, -0.3]].map((p, i) => (
        <group key={i} position={[p[0], 0.06, p[1]]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.18, 0.22]} />
            <meshToonMaterial color={color} gradientMap={gradientMap} />
          </mesh>
          {[-0.06, 0, 0.06].map((zo, j) => (
            <mesh key={j} position={[0.1, -0.08, zo]}>
              <coneGeometry args={[0.018, 0.07, 4]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ===================== FANTASMA ETÉREO ===================== */
function GhostBody({ color }) {
  return (
    <group>
      {/* Cuerpo de tela fluyendo */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.55, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      {/* Capas flotantes — múltiples cilindros decrecientes */}
      {[0, 1, 2].map((i) => (
        <mesh key={`drape-${i}`} position={[0, 0.4 - i * 0.18, 0]}>
          <coneGeometry args={[0.55 - i * 0.08, 0.22, 18, 1, true]} />
          <meshStandardMaterial color={color} transparent opacity={0.55 - i * 0.15} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* Cabeza */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.32, 16, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Ojos hundidos negros vacíos con glow rojo */}
      <mesh position={[0.12, 1.0, 0.26]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.12, 1.0, 0.26]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.12, 1.0, 0.31]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#ff0000" toneMapped={false} />
      </mesh>
      <mesh position={[-0.12, 1.0, 0.31]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#ff0000" toneMapped={false} />
      </mesh>
      {/* Boca alargada vacía */}
      <mesh position={[0, 0.85, 0.3]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.18, 0.05, 0.04]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <pointLight intensity={0.6} distance={4} color={color} />
    </group>
  );
}

/* ===================== TIBURÓN COMPLETO ===================== */
function SharkBody({ color }) {
  return (
    <group>
      {/* Cuerpo de tiburón completo */}
      <mesh position={[0, 0.0, 0]} rotation={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.35, 1.1, 8, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Vientre blanco */}
      <mesh position={[0, -0.18, 0]}>
        <capsuleGeometry args={[0.32, 1.0, 6, 10]} />
        <meshStandardMaterial color="#e8edf2" roughness={0.5} />
      </mesh>
      {/* Cabeza puntiaguda */}
      <mesh position={[0.7, 0.0, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.32, 0.5, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Aleta dorsal */}
      <mesh position={[0.1, 0.45, 0]} castShadow>
        <coneGeometry args={[0.22, 0.55, 3]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Aletas laterales */}
      <mesh position={[0.2, -0.1, 0.4]} rotation={[Math.PI / 2, 0, -0.5]} castShadow>
        <coneGeometry args={[0.15, 0.4, 3]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0.2, -0.1, -0.4]} rotation={[-Math.PI / 2, 0, -0.5]} castShadow>
        <coneGeometry args={[0.15, 0.4, 3]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Cola en V */}
      <mesh position={[-0.7, 0.2, 0]} castShadow>
        <coneGeometry args={[0.18, 0.4, 3]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[-0.7, -0.2, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.18, 0.4, 3]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Boca enorme con dientes */}
      <mesh position={[0.78, -0.1, 0]}>
        <boxGeometry args={[0.16, 0.12, 0.45]} />
        <meshBasicMaterial color="#1a0000" />
      </mesh>
      {[-0.18, -0.09, 0, 0.09, 0.18].map((zo, i) => (
        <mesh key={`stooth-u-${i}`} position={[0.85, -0.05, zo]}>
          <coneGeometry args={[0.024, 0.1, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {[-0.15, -0.05, 0.05, 0.15].map((zo, i) => (
        <mesh key={`stooth-d-${i}`} position={[0.85, -0.15, zo]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.024, 0.1, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Ojos */}
      <mesh position={[0.6, 0.1, 0.22]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.6, 0.1, -0.22]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.62, 0.12, 0.24]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshBasicMaterial color="#ff3030" toneMapped={false} />
      </mesh>
      <mesh position={[0.62, 0.12, -0.24]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshBasicMaterial color="#ff3030" toneMapped={false} />
      </mesh>
      {/* Branquias */}
      {[0.3, 0.2, 0.1].map((xo, i) => (
        <mesh key={`gill-${i}`} position={[xo, 0.05, 0.34]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.02, 0.18, 0.04]} />
          <meshBasicMaterial color="#3a0000" />
        </mesh>
      ))}
    </group>
  );
}

/* ===================== DRAGÓN COMPLETO ===================== */
function DragonBody({ color, gradientMap }) {
  return (
    <group>
      {/* Cuerpo grande */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.45, 0.9, 8, 14]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Cabeza con hocico */}
      <mesh position={[0.7, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.36, 16, 12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[1.05, 0.7, 0]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.22, 0.4, 8]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Cuernos dorados */}
      <mesh position={[0.55, 1.2, 0.2]} rotation={[0, 0, -0.6]} castShadow>
        <coneGeometry args={[0.08, 0.45, 6]} />
        <meshStandardMaterial color="#ffd066" emissive="#ffaa33" emissiveIntensity={0.3} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.55, 1.2, -0.2]} rotation={[0, 0, -0.6]} castShadow>
        <coneGeometry args={[0.08, 0.45, 6]} />
        <meshStandardMaterial color="#ffd066" emissive="#ffaa33" emissiveIntensity={0.3} metalness={0.6} roughness={0.3} />
      </mesh>
      <RedEyes y={0.95} x={0.85} dz={0.16} size={0.08} />
      <pointLight position={[0.95, 0.95, 0]} intensity={0.5} distance={2.5} color="#ff0000" />
      {/* Boca con dientes — vomitando fuego */}
      <mesh position={[1.18, 0.6, 0]}>
        <boxGeometry args={[0.16, 0.15, 0.32]} />
        <meshBasicMaterial color="#2a0000" />
      </mesh>
      {[-0.1, -0.04, 0.04, 0.1].map((zo, i) => (
        <mesh key={`dragon-tooth-${i}`} position={[1.2, 0.63, zo]}>
          <coneGeometry args={[0.022, 0.1, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Llamarada en boca */}
      <mesh position={[1.35, 0.55, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.12, 0.4, 8]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={[1.5, 0.5, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshBasicMaterial color="#ffe066" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <pointLight position={[1.4, 0.55, 0]} intensity={1.2} distance={3} color="#ff6600" />
      {/* Alas membranosas grandes */}
      <mesh position={[-0.1, 1.0, 0.6]} rotation={[0, -0.3, 0.5]} castShadow>
        <boxGeometry args={[0.08, 0.8, 1.2]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.92} />
      </mesh>
      <mesh position={[-0.1, 1.0, -0.6]} rotation={[0, 0.3, 0.5]} castShadow>
        <boxGeometry args={[0.08, 0.8, 1.2]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.92} />
      </mesh>
      {/* Espinas en espalda */}
      {[-0.4, -0.2, 0, 0.2].map((xo, i) => (
        <mesh key={`spine-${i}`} position={[xo, 1.0, 0]} castShadow>
          <coneGeometry args={[0.06, 0.2, 4]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
      {/* Cola con punta puntiaguda */}
      <mesh position={[-0.7, 0.55, 0]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.15, 0.8, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Patas */}
      {[[0.3, 0.3], [0.3, -0.3], [-0.3, 0.3], [-0.3, -0.3]].map((p, i) => (
        <group key={i} position={[p[0], 0.25, p[1]]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.45, 8]} />
            <meshToonMaterial color={color} gradientMap={gradientMap} />
          </mesh>
          {[-0.05, 0, 0.05].map((zo, j) => (
            <mesh key={j} position={[0.08, -0.2, zo]}>
              <coneGeometry args={[0.018, 0.08, 4]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ===================== MURCIÉLAGO VAMPIRO ===================== */
function BatBody({ color, gradientMap }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.28, 14, 12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Cabeza */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 12]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Hocico con colmillos */}
      <mesh position={[0, 0.65, 0.18]}>
        <boxGeometry args={[0.1, 0.06, 0.06]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.025, 0.6, 0.21]}>
        <coneGeometry args={[0.015, 0.06, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.025, 0.6, 0.21]}>
        <coneGeometry args={[0.015, 0.06, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Ojos rojos */}
      <mesh position={[-0.08, 0.78, 0.18]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#ff1010" toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 0.78, 0.18]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#ff1010" toneMapped={false} />
      </mesh>
      {/* Orejas puntiagudas grandes */}
      <mesh position={[-0.1, 1.0, 0]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.08, 0.3, 4]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.1, 1.0, 0]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.08, 0.3, 4]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Alas grandes membranosas con dedos */}
      <mesh position={[0, 0.5, 0.55]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.06, 0.5, 0.9]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.5, -0.55]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.06, 0.5, 0.9]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Dedos de las alas */}
      {[0.45, 0.65, 0.85].map((zo, i) => (
        <mesh key={`finger-${i}`} position={[0, 0.55, zo]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.012, 0.012, 0.5, 4]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {[0.45, 0.65, 0.85].map((zo, i) => (
        <mesh key={`fingerL-${i}`} position={[0, 0.55, -zo]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.012, 0.012, 0.5, 4]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

/* ===================== CANGREJO REALISTA ===================== */
function CrabBody({ color, gradientMap }) {
  return (
    <group>
      {/* Caparazón ovalado */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 0.25, 0]} scale={[1.05, 1, 0.8]}>
        <sphereGeometry args={[0.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Patrón en el caparazón */}
      {[-0.15, 0, 0.15].map((xo, i) => (
        <mesh key={`pattern-${i}`} position={[xo, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.08, 12]} />
          <meshBasicMaterial color="#3a0000" toneMapped={false} />
        </mesh>
      ))}
      {/* Ojos en pedúnculos */}
      <mesh position={[-0.15, 0.55, 0.25]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.15, 0.55, 0.25]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.15, 0.7, 0.25]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.15, 0.7, 0.25]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.15, 0.72, 0.32]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ff3030" toneMapped={false} />
      </mesh>
      <mesh position={[0.15, 0.72, 0.32]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ff3030" toneMapped={false} />
      </mesh>
      {/* Pinzas grandes a los lados */}
      <group position={[-0.55, 0.2, 0.2]} rotation={[0, 0, 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.12, 0.12]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.18, 0.04, 0]} castShadow>
          <boxGeometry args={[0.25, 0.16, 0.18]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.32, 0.1, 0.04]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.32, -0.04, 0.04]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      </group>
      <group position={[0.55, 0.2, 0.2]} rotation={[0, 0, -0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.12, 0.12]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.18, 0.04, 0]} castShadow>
          <boxGeometry args={[0.25, 0.16, 0.18]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.32, 0.1, 0.04]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.32, -0.04, 0.04]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      </group>
      {/* 6 patas (3 por lado) */}
      {[0.25, 0.05, -0.15].map((xo, i) => (
        <mesh key={`leg-L-${i}`} position={[xo, 0.15, 0.45]} rotation={[0.3, 0, 0.4]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
      {[0.25, 0.05, -0.15].map((xo, i) => (
        <mesh key={`leg-R-${i}`} position={[xo, 0.15, -0.45]} rotation={[-0.3, 0, 0.4]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
    </group>
  );
}

/* ===================== YETI BESTIAL ===================== */
function YetiBody({ color, gradientMap }) {
  return (
    <group>
      {/* Cuerpo masivo */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.7, 16, 14]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Cabeza masiva con cuernos */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.52, 16, 14]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Cara oscura */}
      <mesh position={[0, 1.8, 0.4]}>
        <sphereGeometry args={[0.35, 14, 10]} />
        <meshStandardMaterial color="#a8b0b8" roughness={0.9} />
      </mesh>
      {/* Cuernos curvados */}
      <mesh position={[-0.3, 2.3, 0.1]} rotation={[0, 0, 0.6]} castShadow>
        <coneGeometry args={[0.07, 0.4, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.3, 2.3, 0.1]} rotation={[0, 0, -0.6]} castShadow>
        <coneGeometry args={[0.07, 0.4, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Ojos rojos hundidos */}
      <mesh position={[-0.15, 1.92, 0.6]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshBasicMaterial color="#ff1010" toneMapped={false} />
      </mesh>
      <mesh position={[0.15, 1.92, 0.6]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshBasicMaterial color="#ff1010" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.92, 0.6]} intensity={0.6} distance={3} color="#ff0000" />
      {/* Boca abierta con dientes */}
      <mesh position={[0, 1.65, 0.55]}>
        <boxGeometry args={[0.25, 0.12, 0.12]} />
        <meshBasicMaterial color="#1a0000" />
      </mesh>
      {[-0.08, 0, 0.08].map((xo, i) => (
        <mesh key={`yeti-fang-${i}`} position={[xo, 1.66, 0.62]}>
          <coneGeometry args={[0.022, 0.1, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Pelaje en tufos */}
      {[-0.5, -0.2, 0.2, 0.5].map((xo, i) => (
        <mesh key={`fur-${i}`} position={[xo, 1.4, 0.55]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.1, 0.25, 5]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      ))}
      {/* Brazos enormes con garras */}
      <mesh position={[-0.85, 1.1, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.22, 0.8, 6, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.85, 1.1, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.22, 0.8, 6, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Manos con garras */}
      <mesh position={[-1.05, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[1.05, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {[-0.08, 0, 0.08].map((zo, i) => (
        <mesh key={`claw-L-${i}`} position={[-1.15, 0.55, zo]}>
          <coneGeometry args={[0.025, 0.12, 4]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {[-0.08, 0, 0.08].map((zo, i) => (
        <mesh key={`claw-R-${i}`} position={[1.15, 0.55, zo]}>
          <coneGeometry args={[0.025, 0.12, 4]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {/* Piernas */}
      <mesh position={[-0.3, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.55, 6, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.3, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.55, 6, 10]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

/* ===================== ALIEN GRIS HUMANOIDE ===================== */
function AlienBody({ color }) {
  return (
    <group>
      {/* Cuerpo larguirucho */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.7, 6, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Cabeza enorme alargada */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.42, 18, 14]} scale={[0.85, 1.2, 0.95]} />
        <meshStandardMaterial color={color} roughness={0.4} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      {/* Ojos enormes negros almendrados */}
      <mesh position={[-0.16, 1.55, 0.32]} rotation={[0, 0, 0.5]}>
        <sphereGeometry args={[0.14, 14, 10]} scale={[0.6, 1.4, 0.6]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.16, 1.55, 0.32]} rotation={[0, 0, -0.5]}>
        <sphereGeometry args={[0.14, 14, 10]} scale={[0.6, 1.4, 0.6]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.15, 1.5, 0.41]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#7cff7c" toneMapped={false} />
      </mesh>
      <mesh position={[0.15, 1.5, 0.41]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#7cff7c" toneMapped={false} />
      </mesh>
      {/* Boca pequeña fina */}
      <mesh position={[0, 1.32, 0.4]}>
        <boxGeometry args={[0.12, 0.02, 0.02]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* Brazos largos finos */}
      <mesh position={[-0.3, 0.95, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.06, 0.7, 6, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.3, 0.95, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.06, 0.7, 6, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Manos con 3 dedos largos */}
      <mesh position={[-0.4, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.4, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {[-0.04, 0, 0.04].map((zo, i) => (
        <mesh key={`finger-${i}`} position={[-0.4, 0.4, zo]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 5]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {[-0.04, 0, 0.04].map((zo, i) => (
        <mesh key={`finger-r-${i}`} position={[0.4, 0.4, zo]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 5]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {/* Piernas */}
      <mesh position={[-0.12, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.55, 6, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.12, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.55, 6, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Aura verde */}
      <pointLight intensity={0.5} distance={3} color="#7cff7c" />
    </group>
  );
}

/* ===================== CYBERBOT MECH ===================== */
function CyberBot({ color }) {
  return (
    <group>
      {/* Torso mech */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.85, 0.9, 0.55]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Placas pectorales */}
      <mesh position={[0, 0.85, 0.3]}>
        <boxGeometry args={[0.65, 0.55, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Núcleo brillante */}
      <mesh position={[0, 0.85, 0.36]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshBasicMaterial color="#ff3a8a" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.85, 0.36]} intensity={1.0} distance={3} color="#ff3a8a" />
      {/* Cabeza mech con un ojo cíclope */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.55, 0.42, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Visor laser horizontal */}
      <mesh position={[0, 1.42, 0.26]}>
        <boxGeometry args={[0.45, 0.12, 0.04]} />
        <meshBasicMaterial color="#ff0000" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.42, 0.3]} intensity={1.2} distance={3.5} color="#ff0000" />
      {/* Antenas */}
      <mesh position={[-0.18, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 6]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
      </mesh>
      <mesh position={[0.18, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 6]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
      </mesh>
      <mesh position={[-0.18, 1.88, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshBasicMaterial color="#ff3a8a" toneMapped={false} />
      </mesh>
      <mesh position={[0.18, 1.88, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshBasicMaterial color="#00d4ff" toneMapped={false} />
      </mesh>
      {/* Brazos con servos */}
      <mesh position={[-0.55, 0.85, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.55, 0.85, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[-0.55, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.85} />
      </mesh>
      <mesh position={[0.55, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.85} />
      </mesh>
      {/* Garras laser */}
      {[-0.08, 0, 0.08].map((zo, i) => (
        <mesh key={`claw-L-${i}`} position={[-0.55, 0.3, zo]}>
          <coneGeometry args={[0.025, 0.15, 4]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[-0.08, 0, 0.08].map((zo, i) => (
        <mesh key={`claw-R-${i}`} position={[0.55, 0.3, zo]}>
          <coneGeometry args={[0.025, 0.15, 4]} />
          <meshStandardMaterial color="#ff3a8a" emissive="#ff3a8a" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Piernas mech */}
      <mesh position={[-0.22, 0.22, 0]} castShadow>
        <boxGeometry args={[0.22, 0.5, 0.22]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.22, 0.22, 0]} castShadow>
        <boxGeometry args={[0.22, 0.5, 0.22]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Pies */}
      <mesh position={[-0.22, -0.05, 0.05]} castShadow>
        <boxGeometry args={[0.28, 0.1, 0.35]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.85} />
      </mesh>
      <mesh position={[0.22, -0.05, 0.05]} castShadow>
        <boxGeometry args={[0.28, 0.1, 0.35]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.85} />
      </mesh>
    </group>
  );
}

/* ===================== BÚHO DEPREDADOR ===================== */
function OwlBody({ color, gradientMap }) {
  return (
    <group>
      {/* Cuerpo grande con plumas */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.55, 16, 14]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Disco facial concéntrico */}
      <mesh position={[0, 0.75, 0.4]}>
        <circleGeometry args={[0.4, 18]} />
        <meshStandardMaterial color="#fff8e1" />
      </mesh>
      <mesh position={[0, 0.75, 0.41]}>
        <ringGeometry args={[0.2, 0.32, 20]} />
        <meshBasicMaterial color="#a0700a" />
      </mesh>
      {/* Ojos enormes amarillos amenazantes */}
      <mesh position={[-0.15, 0.78, 0.45]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshBasicMaterial color="#ffaa00" toneMapped={false} />
      </mesh>
      <mesh position={[0.15, 0.78, 0.45]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshBasicMaterial color="#ffaa00" toneMapped={false} />
      </mesh>
      <mesh position={[-0.15, 0.78, 0.52]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.15, 0.78, 0.52]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <pointLight position={[0, 0.78, 0.55]} intensity={0.4} distance={2.5} color="#ffaa00" />
      {/* Pico curvado afilado */}
      <mesh position={[0, 0.62, 0.5]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[0.08, 0.18, 4]} />
        <meshStandardMaterial color="#5a3a1a" metalness={0.4} />
      </mesh>
      {/* Plumas/tufos sobre los ojos */}
      <mesh position={[-0.25, 1.05, 0.3]} rotation={[0, 0, 0.4]} castShadow>
        <coneGeometry args={[0.06, 0.22, 5]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.25, 1.05, 0.3]} rotation={[0, 0, -0.4]} castShadow>
        <coneGeometry args={[0.06, 0.22, 5]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Alas extendidas */}
      <mesh position={[-0.5, 0.7, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.55]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.5, 0.7, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.55]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {/* Garras */}
      <mesh position={[-0.12, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.12, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {[-0.06, 0, 0.06].map((zo, i) => (
        <mesh key={`talon-L-${i}`} position={[-0.12, 0.05, zo]}>
          <coneGeometry args={[0.02, 0.1, 4]} />
          <meshBasicMaterial color="#fff5e0" />
        </mesh>
      ))}
      {[-0.06, 0, 0.06].map((zo, i) => (
        <mesh key={`talon-R-${i}`} position={[0.12, 0.05, zo]}>
          <coneGeometry args={[0.02, 0.1, 4]} />
          <meshBasicMaterial color="#fff5e0" />
        </mesh>
      ))}
    </group>
  );
}

const BODIES = {
  wolf: WolfBody, fox: FoxBody, crocodile: CrocodileBody, ghost: GhostBody,
  owl: OwlBody, shark: SharkBody, dragon: DragonBody, bat: BatBody,
  crab: CrabBody, yeti: YetiBody, alien: AlienBody, cyberbot: CyberBot, drone: CyberBot
};

const FLYING_TYPES = new Set(['ghost', 'owl', 'dragon', 'bat', 'alien', 'drone']);
const FLOATING_TYPES = new Set(['shark']);

const ENEMY_SCALES = {
  wolf: 1.4, fox: 1.3, crocodile: 1.5, ghost: 1.6, owl: 1.4,
  shark: 1.6, dragon: 1.7, bat: 1.3, crab: 1.4, yeti: 1.5,
  alien: 1.5, cyberbot: 1.5, drone: 1.5
};

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
    const stepSpeed = mode === 'chase' ? speed * 1.8 : speed * 0.7;

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

    if (breathRef.current) {
      const breathScale = 1 + Math.sin(Date.now() * 0.003) * 0.04;
      breathRef.current.scale.y = breathScale;
    }

    if (player) {
      const distToPlayer = Math.hypot(player.x - s.x, player.z - s.z);
      const now = Date.now();
      const invulnUntil = invulnUntilRef?.current ?? 0;
      const isChasing = distToPlayer < detectionRadius;
      if (isChasing && !s.wasChasing) {
        if (now - s.lastAlertAt > 2000) {
          playEnemyAlert?.(type).catch?.(() => {});
          s.lastAlertAt = now;
          setAlertVisible(true);
          setTimeout(() => setAlertVisible(false), 1500);
        }
      }
      s.wasChasing = isChasing;
      if (distToPlayer < 1.6 && now > invulnUntil) onHit?.(now);
    }
  });

  const Body = BODIES[type] ?? WolfBody;
  const scale = ENEMY_SCALES[type] ?? 1.4;
  return (
    <group ref={groupRef} position={spawn} scale={scale}>
      <group ref={breathRef}>
        <Body color={color} gradientMap={gradientMap} />
      </group>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[detectionRadius / scale - 0.2, detectionRadius / scale, 48]} />
        <meshBasicMaterial color="#ff3b3b" transparent opacity={0.12} toneMapped={false} />
      </mesh>
      {alertVisible && (
        <group position={[0, 2.6, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 12, 8]} />
            <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <coneGeometry args={[0.08, 0.2, 8]} />
            <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

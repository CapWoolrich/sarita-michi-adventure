import { useGLTF } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Carga modelos del Stylized Nature MegaKit y los expone como componentes
 * tipados. Los modelos se cachean automáticamente por drei.
 */

const MODEL_PATHS = {
  CommonTree1: '/models/nature/CommonTree_1.gltf',
  CommonTree3: '/models/nature/CommonTree_3.gltf',
  Pine1: '/models/nature/Pine_1.gltf',
  Pine3: '/models/nature/Pine_3.gltf',
  DeadTree1: '/models/nature/DeadTree_1.gltf',
  TwistedTree1: '/models/nature/TwistedTree_1.gltf',
  BushFlowers: '/models/nature/Bush_Common_Flowers.gltf',
  MushroomCommon: '/models/nature/Mushroom_Common.gltf',
  MushroomLaeti: '/models/nature/Mushroom_Laetiporus.gltf',
  Flower3Group: '/models/nature/Flower_3_Group.gltf',
  Flower4Group: '/models/nature/Flower_4_Group.gltf',
  RockMedium1: '/models/nature/Rock_Medium_1.gltf',
  RockMedium2: '/models/nature/Rock_Medium_2.gltf',
  GrassTall: '/models/nature/Grass_Common_Tall.gltf',
  Plant1: '/models/nature/Plant_1.gltf',
  PebbleRound: '/models/nature/Pebble_Round_2.gltf',
  Fern: '/models/nature/Fern_1.gltf'
};

// Pre-cargar todos los assets para que estén listos
Object.values(MODEL_PATHS).forEach((p) => useGLTF.preload(p));

function makeModel(path) {
  return function Model({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, tint }) {
    const { scene } = useGLTF(path);
    // Clonar para que múltiples instancias sean independientes
    const clone = useMemo(() => {
      const c = scene.clone(true);
      c.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (tint && child.material) {
            child.material = child.material.clone();
            child.material.color = new THREE.Color(tint);
          }
        }
      });
      return c;
    }, [scene, tint]);
    return <primitive object={clone} position={position} rotation={rotation} scale={scale} />;
  };
}

export const NatureCommonTree1 = makeModel(MODEL_PATHS.CommonTree1);
export const NatureCommonTree3 = makeModel(MODEL_PATHS.CommonTree3);
export const NaturePine1 = makeModel(MODEL_PATHS.Pine1);
export const NaturePine3 = makeModel(MODEL_PATHS.Pine3);
export const NatureDeadTree1 = makeModel(MODEL_PATHS.DeadTree1);
export const NatureTwistedTree1 = makeModel(MODEL_PATHS.TwistedTree1);
export const NatureBushFlowers = makeModel(MODEL_PATHS.BushFlowers);
export const NatureMushroomCommon = makeModel(MODEL_PATHS.MushroomCommon);
export const NatureMushroomLaeti = makeModel(MODEL_PATHS.MushroomLaeti);
export const NatureFlower3Group = makeModel(MODEL_PATHS.Flower3Group);
export const NatureFlower4Group = makeModel(MODEL_PATHS.Flower4Group);
export const NatureRockMedium1 = makeModel(MODEL_PATHS.RockMedium1);
export const NatureRockMedium2 = makeModel(MODEL_PATHS.RockMedium2);
export const NatureGrassTall = makeModel(MODEL_PATHS.GrassTall);
export const NaturePlant1 = makeModel(MODEL_PATHS.Plant1);
export const NaturePebbleRound = makeModel(MODEL_PATHS.PebbleRound);
export const NatureFern = makeModel(MODEL_PATHS.Fern);

/** Helper: <NatureModel kind="CommonTree1" position={...} /> */
const KINDS = {
  CommonTree1: NatureCommonTree1,
  CommonTree3: NatureCommonTree3,
  Pine1: NaturePine1,
  Pine3: NaturePine3,
  DeadTree1: NatureDeadTree1,
  TwistedTree1: NatureTwistedTree1,
  BushFlowers: NatureBushFlowers,
  MushroomCommon: NatureMushroomCommon,
  MushroomLaeti: NatureMushroomLaeti,
  Flower3Group: NatureFlower3Group,
  Flower4Group: NatureFlower4Group,
  RockMedium1: NatureRockMedium1,
  RockMedium2: NatureRockMedium2,
  GrassTall: NatureGrassTall,
  Plant1: NaturePlant1,
  PebbleRound: NaturePebbleRound,
  Fern: NatureFern
};

export default function NatureModel({ kind, ...props }) {
  const C = KINDS[kind];
  if (!C) return null;
  return (
    <Suspense fallback={null}>
      <C {...props} />
    </Suspense>
  );
}

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAnimations, useGLTF } from '@react-three/drei';

const pickAnimationName = (availableNames, requested) => {
  const normalized = (requested || 'idle').toLowerCase();
  return (
    availableNames.find((name) => name.toLowerCase() === normalized)
    || (normalized === 'run' && availableNames.find((name) => name.toLowerCase() === 'walk'))
    || ((normalized === 'catch' || normalized === 'celebrate') && availableNames.find((name) => name.toLowerCase() === 'idle'))
    || availableNames.find((name) => name.toLowerCase() === 'idle')
    || availableNames[0]
  );
};

export default function KawaiiDoll({ animation = 'idle', position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, url = '/models/kawaii_doll.glb', ...props }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    scene?.traverse?.((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of mats) {
        if (!mat) continue;
        const n = `${obj.name || ''} ${mat.name || ''}`.toLowerCase();
        if (n.includes('hair') || n.includes('bang')) {
          mat.side = THREE.FrontSide;
          mat.depthWrite = true;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!actions) return;
    const availableNames = (names && names.length > 0) ? names : Object.keys(actions);
    if (!availableNames.length) return;

    const actionName = pickAnimationName(availableNames, animation);
    const nextAction = actions[actionName];

    Object.values(actions).forEach((action) => {
      if (action && action !== nextAction) action.fadeOut(0.15);
    });

    nextAction?.reset().fadeIn(0.2).play();
    return () => nextAction?.fadeOut(0.15);
  }, [actions, animation, names]);

  return <group ref={group} position={position} rotation={rotation} scale={scale} {...props}>
    <primitive object={scene} />
  </group>;
}

useGLTF.preload('/models/kawaii_doll.glb');

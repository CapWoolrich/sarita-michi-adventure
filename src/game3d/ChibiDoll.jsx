import { useEffect, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function ChibiDoll({
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  url = '/models/chibi_doll.glb',
  ...props
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.side = THREE.FrontSide;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!actions) return;

    const availableNames = names || Object.keys(actions);
    const requested = String(animation || 'idle').toLowerCase();

    const actionName =
      availableNames.find((name) => name.toLowerCase() === requested)
      || availableNames.find((name) => (requested === 'run' || requested === 'moving') && name.toLowerCase() === 'walk')
      || availableNames.find((name) => (requested === 'catch' || requested === 'celebrate') && (name.toLowerCase() === 'idle' || name.toLowerCase() === 'walk'))
      || availableNames.find((name) => name.toLowerCase() === 'idle')
      || availableNames[0];

    Object.entries(actions).forEach(([name, action]) => {
      if (!action) return;
      if (name !== actionName) action.fadeOut(0.15);
    });

    const action = actions[actionName];

    if (action) {
      action.reset().fadeIn(0.2).play();
    }

    return () => {
      action?.fadeOut(0.15);
    };
  }, [animation, actions, names]);

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/chibi_doll.glb');

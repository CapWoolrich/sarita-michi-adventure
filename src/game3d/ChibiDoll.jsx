import { useEffect, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function ChibiDoll({
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  url = '/models/chibi_doll.glb',
  outfitColor = null,
  hatColor = null,
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

  // Aplicar tinte de outfit (si está presente) clonando materiales
  useEffect(() => {
    if (!outfitColor) return;
    const target = new THREE.Color(outfitColor);
    const hatTarget = hatColor ? new THREE.Color(hatColor) : target;
    scene.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        // Heuristic: tintar cualquier mesh que no sea piel/cabello/ojos
        const name = (child.name || '').toLowerCase();
        const isHair = name.includes('hair');
        const isSkin = name.includes('skin') || name.includes('face') || name.includes('head');
        const isEye = name.includes('eye');
        if (isHair || isSkin || isEye) return;
        // Clonar material para no mutar el global
        if (!child.userData._tintCloned) {
          child.material = child.material.clone();
          child.userData._tintCloned = true;
          child.userData._origColor = child.material.color.clone();
        }
        // Aplicar mezcla 60% tinte sobre color original
        const orig = child.userData._origColor;
        if (orig) {
          const blended = orig.clone().lerp(name.includes('hat') || name.includes('cap') ? hatTarget : target, 0.65);
          child.material.color.copy(blended);
        }
      }
    });
  }, [scene, outfitColor, hatColor]);

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

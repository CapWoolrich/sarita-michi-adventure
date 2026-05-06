// KawaiiDoll.jsx
// React Three Fiber component — drop-in for your game.
//
// Install deps:
//   npm install three @react-three/fiber @react-three/drei
//
// Place kawaii_doll.glb in your /public folder, then:
//
//   import { Canvas } from '@react-three/fiber'
//   import { KawaiiDoll } from './KawaiiDoll'
//
//   <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
//     <ambientLight intensity={0.6} />
//     <directionalLight position={[5, 10, 5]} intensity={1.2} />
//     <KawaiiDoll animation="walk" position={[0, 0, 0]} />
//   </Canvas>

import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function KawaiiDoll({
  animation = 'idle',     // 'idle' | 'walk'
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  url = '/kawaii_doll.glb',
  ...props
}) {
  const group = useRef()
  const { scene, animations } = useGLTF(url)
  const { actions, mixer } = useAnimations(animations, group)

  useEffect(() => {
    // Stop all and play the requested animation
    Object.values(actions).forEach((a) => a?.stop())
    const action = actions[animation]
    if (action) {
      action.reset().fadeIn(0.25).play()
    }
    return () => {
      action?.fadeOut(0.25)
    }
  }, [animation, actions])

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale} {...props}>
      <primitive object={scene} />
    </group>
  )
}

// Preload for snappier first render
useGLTF.preload('/kawaii_doll.glb')

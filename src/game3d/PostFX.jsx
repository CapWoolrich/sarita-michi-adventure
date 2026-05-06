import { EffectComposer, Bloom, Vignette, ChromaticAberration, BrightnessContrast, HueSaturation } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * Cinematic post-processing stack tuned for the kawaii pastel look.
 * Subtle on mobile, elevates the overall feel.
 */
export default function PostFX() {
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.6}
        mipmapBlur
        radius={0.7}
      />
      <ChromaticAberration
        offset={[0.0006, 0.0006]}
        radialModulation
        modulationOffset={0.4}
      />
      <HueSaturation saturation={0.12} />
      <BrightnessContrast brightness={0.02} contrast={0.06} />
      <Vignette eskil={false} offset={0.18} darkness={0.55} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}

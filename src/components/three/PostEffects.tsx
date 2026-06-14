import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, N8AO, Scanline, DepthOfField, LUT } from '@react-three/postprocessing';
import { BlendFunction, Resizer, KernelSize } from 'postprocessing';
import { Vector2 } from 'three';
import { useThree } from '@react-three/fiber';

export function PostEffects() {
  const { viewport } = useThree();

  return (
    <EffectComposer multisampling={0}>
      <N8AO
        aoRadius={0.8}
        intensity={2.5}
        distanceFalloff={1.0}
        screenSpaceRadius
        color='black'
      />

      <Bloom
        intensity={2.5}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.6}
        mipmapBlur
        radius={1.2}
      />

      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.002, 0.002)}
        radialModulation
        modulationOffset={0.5}
      />

      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.035}
      />

      <Scanline
        blendFunction={BlendFunction.OVERLAY}
        density={1.5}
        opacity={0.05}
      />

      <Vignette
        eskil={false}
        offset={0.1}
        darkness={1.0}
      />
    </EffectComposer>
  );
}
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, N8AO, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

export function PostEffects() {
  return (
    <EffectComposer multisampling={0}>
      <N8AO
        aoRadius={0.5}
        intensity={1.5}
        distanceFalloff={0.5}
        screenSpaceRadius
        color='black'
      />

      <DepthOfField
        focusDistance={0.01}
        focalLength={0.08}
        bokehScale={2}
        height={540}
      />

      <Bloom
        intensity={1.4}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.8}
      />

      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0005, 0.0005)}
        radialModulation
        modulationOffset={0.15}
      />

      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.02}
      />

      <Vignette
        eskil={false}
        offset={0.15}
        darkness={0.9}
      />
    </EffectComposer>
  );
}
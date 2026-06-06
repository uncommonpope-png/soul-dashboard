import { Canvas } from '@react-three/fiber';
import { OrbitControls, AdaptiveDpr } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { FloatingPlatform } from './FloatingPlatform';
import { ParticleField } from './ParticleField';
import { PostEffects } from './PostEffects';
import { PyramidCore } from './PyramidCore';
import { MatrixRain } from './MatrixRain';
import { RainSplash } from './RainSplash';
import { GridCellLayer } from './GridCell';
import { GridInteractionLayer, useGridInit } from './GridInteractionLayer';
import { CityBuilder } from '../city/CityBuilder';
import { useFrame } from '@react-three/fiber';
import { useGridStore } from '../../store/useGridStore';
import * as THREE from 'three';

function BackgroundScene() {
  const groupRef = useRef<THREE.Group>(null);
  const rainEnabled = useGridStore((s) => s.rainEnabled);

  useGridInit();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
    <group ref={groupRef}>
      <PyramidCore />
      <FloatingPlatform />
      <GridCellLayer />
      <CityBuilder />
      {rainEnabled && <MatrixRain />}
      {rainEnabled && <RainSplash />}
      <ParticleField />
      <GridInteractionLayer />
    </group>
  );
}

export function DashboardBackground() {
  return (
    <Canvas
      camera={{ position: [0, 6, 16], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <color attach='background' args={['#050508']} />
      <fog attach='fog' args={['#050508', 22, 60]} />

      <ambientLight intensity={0.12} />
      <pointLight position={[-10, 12, -10]} color='#00d4ff' intensity={1.2} />
      <pointLight position={[10, 6, 10]} color='#ffaa00' intensity={0.5} />
      <pointLight position={[0, -4, 0]} color='#00ff88' intensity={0.4} />
      <pointLight position={[5, 0, -5]} color='#ff3366' intensity={0.25} />

      <Suspense fallback={null}>
        <BackgroundScene />
      </Suspense>

      <PostEffects />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.25}
      />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}

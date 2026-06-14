import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLORS = [
  new THREE.Color('#00d4ff'),
  new THREE.Color('#00ff88'),
  new THREE.Color('#ffaa00'),
  new THREE.Color('#ff3366'),
  new THREE.Color('#8844ff'),
];

export function ParticleField() {
  const count = 2000;
  const ref = useRef<THREE.Points>(null);

  const [positions, speeds, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 20;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      spd[i] = 0.002 + Math.random() * 0.015;

      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = 0.02 + Math.random() * 0.15;
    }
    return [pos, spd, col, siz];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 10) {
        pos[i * 3 + 1] = -10;
        const theta = Math.random() * Math.PI * 2;
        const r = 2 + Math.random() * 20;
        pos[i * 3] = Math.cos(theta) * r;
        pos[i * 3 + 2] = Math.sin(theta) * r;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.5 + 0.2 * Math.sin(state.clock.elapsedTime * 0.3);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach='attributes-color'
          args={[colors, 3]}
          count={count}
        />
        <bufferAttribute
          attach='attributes-size'
          args={[sizes, 1]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        transparent
        opacity={0.6}
        sizeAttenuation
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
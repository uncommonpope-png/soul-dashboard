import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createRadialGridTexture, GridTextureParams } from '../../lib/gridTextureGenerator';

export function FloatingPlatform() {
  const groupRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const RINGS = 16;
  const SPOKES = 24;
  const RADIUS = 16;

  const textureParams: GridTextureParams = {
    size: 512,
    rings: RINGS,
    spokes: SPOKES,
    ringColor: '#00d4ff',
    spokeColor: '#00d4ff',
    glowColor: '#00d4ff',
    bgColor: 'rgba(5, 5, 8, 0.3)',
  };

  const gridTexture = useMemo(() => createRadialGridTexture(textureParams), []);

  const { linesGeo, insetGeo, nodePoints } = useMemo(() => {
    const lines: THREE.Vector3[] = [];
    const insetLines: THREE.Vector3[] = [];

    for (let r = 1; r <= RINGS; r++) {
      const ringRadius = (r / RINGS) * RADIUS;
      const segs = r === RINGS ? 96 : Math.max(8, r * 4);
      for (let i = 0; i < segs; i++) {
        const a1 = (i / segs) * Math.PI * 2;
        const a2 = ((i + 1) / segs) * Math.PI * 2;
        lines.push(
          new THREE.Vector3(Math.cos(a1) * ringRadius, 0, Math.sin(a1) * ringRadius),
          new THREE.Vector3(Math.cos(a2) * ringRadius, 0, Math.sin(a2) * ringRadius),
        );
        insetLines.push(
          new THREE.Vector3(Math.cos(a1) * ringRadius * 1.08, -0.03, Math.sin(a1) * ringRadius * 1.08),
          new THREE.Vector3(Math.cos(a2) * ringRadius * 1.08, -0.03, Math.sin(a2) * ringRadius * 1.08),
        );
      }
    }

    for (let i = 0; i < SPOKES; i++) {
      const angle = (i / SPOKES) * Math.PI * 2;
      lines.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS),
      );
      insetLines.push(
        new THREE.Vector3(0, -0.03, 0),
        new THREE.Vector3(Math.cos(angle) * RADIUS * 1.08, -0.03, Math.sin(angle) * RADIUS * 1.08),
      );
    }

    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < SPOKES; i++) {
      const angle = (i / SPOKES) * Math.PI * 2;
      nodes.push(new THREE.Vector3(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS));
    }
    const innerRing = Math.floor(RINGS * 0.8);
    const innerRadius = (innerRing / RINGS) * RADIUS;
    const innerNodes = 24;
    for (let i = 0; i < innerNodes; i++) {
      const angle = (i / innerNodes) * Math.PI * 2;
      nodes.push(new THREE.Vector3(Math.cos(angle) * innerRadius, 0, Math.sin(angle) * innerRadius));
    }

    return {
      linesGeo: new THREE.BufferGeometry().setFromPoints(lines),
      insetGeo: new THREE.BufferGeometry().setFromPoints(insetLines),
      nodePoints: nodes,
    };
  }, []);

  const radarArc = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segs = 48;
    const inner = 1;
    const outer = RADIUS - 0.5;
    const arcAngle = Math.PI * 0.35;
    for (let i = 0; i <= segs; i++) {
      const angle = (i / segs) * arcAngle;
      points.push(new THREE.Vector3(Math.cos(angle) * inner, 0, Math.sin(angle) * inner));
    }
    for (let i = segs; i >= 0; i--) {
      const angle = (i / segs) * arcAngle;
      points.push(new THREE.Vector3(Math.cos(angle) * outer, 0, Math.sin(angle) * outer));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) groupRef.current.rotation.y = t * 0.01;
    if (ringRef.current) ringRef.current.rotation.y = -t * 0.008;

    const pulseOpacity = 0.5 + 0.3 * Math.sin(t * 1.5);
    const gridMat = gridRef.current?.material as THREE.MeshBasicMaterial | undefined;
    if (gridMat) gridMat.opacity = pulseOpacity;

    const glow = 0.08 + 0.06 * Math.sin(t * 2);
    const outerRing = groupRef.current?.children[groupRef.current.children.length - 1] as THREE.Mesh | undefined;
    if (outerRing?.material) {
      (outerRing.material as THREE.MeshBasicMaterial).opacity = glow;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.8, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[RADIUS, 96]} />
        <meshBasicMaterial map={gridTexture} transparent opacity={0.6} depthWrite={false} />
      </mesh>

      <lineSegments>
        <primitive object={linesGeo} />
        <lineBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <lineSegments>
        <primitive object={insetGeo} />
        <lineBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.03}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {nodePoints.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color='#00d4ff'
            emissive='#00d4ff'
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={radarArc} />
        <meshBasicMaterial
          color='#00ff88'
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[RADIUS, 96]} />
        <meshBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.02}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[0, RADIUS, 96]} />
        <meshBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

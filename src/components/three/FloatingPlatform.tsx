import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function FloatingPlatform() {
  const groupRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.LineSegments>(null);
  const radarRef = useRef<THREE.Mesh>(null);

  const { gridGeometry, gridGeometryLarge, radialLines, nodePoints } = useMemo(() => {
    const lines: THREE.Vector3[] = [];
    const linesLarge: THREE.Vector3[] = [];

    const radius = 12;
    const rings = 8;
    for (let r = 1; r <= rings; r++) {
      const ringRadius = (r / rings) * radius;
      const segments = r === rings ? 64 : Math.max(6, r * 4);
      for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 1) / segments) * Math.PI * 2;
        lines.push(
          new THREE.Vector3(Math.cos(a1) * ringRadius, 0, Math.sin(a1) * ringRadius),
          new THREE.Vector3(Math.cos(a2) * ringRadius, 0, Math.sin(a2) * ringRadius)
        );
        linesLarge.push(
          new THREE.Vector3(Math.cos(a1) * ringRadius * 1.15, -0.05, Math.sin(a1) * ringRadius * 1.15),
          new THREE.Vector3(Math.cos(a2) * ringRadius * 1.15, -0.05, Math.sin(a2) * ringRadius * 1.15)
        );
      }
    }

    const spokes = 12;
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2;
      lines.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      );
      linesLarge.push(
        new THREE.Vector3(0, -0.05, 0),
        new THREE.Vector3(Math.cos(angle) * radius * 1.15, -0.05, Math.sin(angle) * radius * 1.15)
      );
    }

    const gridGeo = new THREE.BufferGeometry().setFromPoints(lines);
    const gridGeoLarge = new THREE.BufferGeometry().setFromPoints(linesLarge);

    const radialPoints: THREE.Vector3[] = [];
    const centerRing = 3;
    for (let r = 0; r < centerRing; r++) {
      const ringRadius = 0.3 + r * 0.4;
      const segs = 6 + r * 4;
      for (let i = 0; i < segs; i++) {
        const a1 = (i / segs) * Math.PI * 2;
        const a2 = ((i + 1) / segs) * Math.PI * 2;
        radialPoints.push(
          new THREE.Vector3(Math.cos(a1) * ringRadius, 0, Math.sin(a1) * ringRadius),
          new THREE.Vector3(Math.cos(a2) * ringRadius, 0, Math.sin(a2) * ringRadius)
        );
      }
    }
    const radialGeo = new THREE.BufferGeometry().setFromPoints(radialPoints);

    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2;
      nodes.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const nextRingRadius = ((rings - 1) / rings) * radius;
    const nextRingSegs = Math.max(6, (rings - 1) * 4);
    const nextRingNodes = 16;
    for (let i = 0; i < nextRingNodes; i++) {
      const angle = (i / nextRingNodes) * Math.PI * 2;
      nodes.push(new THREE.Vector3(Math.cos(angle) * nextRingRadius, 0, Math.sin(angle) * nextRingRadius));
    }

    return {
      gridGeometry: gridGeo,
      gridGeometryLarge: gridGeoLarge,
      radialLines: radialGeo,
      nodePoints: nodes,
    };
  }, []);

  const radarArc = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const arcSegments = 32;
    const innerRadius = 0.8;
    const outerRadius = 11;
    const arcAngle = Math.PI * 0.4;
    for (let i = 0; i <= arcSegments; i++) {
      const angle = (i / arcSegments) * arcAngle;
      points.push(new THREE.Vector3(Math.cos(angle) * innerRadius, 0, Math.sin(angle) * innerRadius));
    }
    for (let i = arcSegments; i >= 0; i--) {
      const angle = (i / arcSegments) * arcAngle;
      points.push(new THREE.Vector3(Math.cos(angle) * outerRadius, 0, Math.sin(angle) * outerRadius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!gridRef.current || !groupRef.current) return;
    groupRef.current.rotation.y = t * 0.015;
    gridRef.current.rotation.y = -t * 0.01;
    if (radarRef.current) {
      radarRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.8, 0]}>
      <lineSegments ref={gridRef}>
        <primitive object={gridGeometry} />
        <lineBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <lineSegments>
        <primitive object={gridGeometryLarge} />
        <lineBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <lineSegments>
        <primitive object={radialLines} />
        <lineBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {nodePoints.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color='#00d4ff'
            emissive='#00d4ff'
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      <mesh ref={radarRef} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={radarArc} />
        <meshBasicMaterial
          color='#00ff88'
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.03}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[10, 64]} />
        <meshBasicMaterial
          color='#0a1628'
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[0, 10, 64]} />
        <meshBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
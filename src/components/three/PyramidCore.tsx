import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PyramidCore() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);
  const innerLight2Ref = useRef<THREE.PointLight>(null);
  const glowDiscRef = useRef<THREE.Mesh>(null);

  const bottomGroupRef = useRef<THREE.Group>(null);
  const bottomBodyRef = useRef<THREE.Mesh>(null);
  const bottomEdgesRef = useRef<THREE.LineSegments>(null);

  const beamRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const { pyramidGeo, edgesGeo, bottomPyramidGeo, bottomEdgesGeo } = useMemo(() => {
    const geo = new THREE.ConeGeometry(2.2, 3.5, 4, 1);
    const edges = new THREE.EdgesGeometry(geo);
    const bottomGeo = new THREE.ConeGeometry(2.2 * 0.6, 3.5 * 0.6, 4, 1);
    const bottomEdges = new THREE.EdgesGeometry(bottomGeo);
    return { pyramidGeo: geo, edgesGeo: edges, bottomPyramidGeo: bottomGeo, bottomEdgesGeo: bottomEdges };
  }, []);

  const glowDiscGeo = useMemo(() => new THREE.CircleGeometry(2.6, 64), []);
  const glowDiscGeoInner = useMemo(() => new THREE.RingGeometry(0.2, 2.6, 64), []);

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(30 * 3);
    const radii = [2.8, 3.2, 3.6];
    const heights = [-1.2, 0, 1.2, 2.0, 2.8];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const r = radii[i % radii.length];
      const h = heights[i % heights.length];
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = h;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }
    return positions;
  }, []);

  const beamGeo = useMemo(() => {
    const topApex = new THREE.Vector3(0, 1.75, 0);
    const bottomApex = new THREE.Vector3(0, -2.8 - (3.5 * 0.6) / 2, 0);
    const direction = new THREE.Vector3().subVectors(bottomApex, topApex);
    const length = direction.length();
    const geo = new THREE.CylinderGeometry(0.04, 0.04, length, 8);
    geo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, length / 2, 0));
    geo.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2));
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    geo.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));
    geo.applyMatrix4(new THREE.Matrix4().makeTranslation(topApex.x, topApex.y + length / 2, topApex.z));
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!groupRef.current || !bodyRef.current || !edgesRef.current) return;

    const slowBob = Math.sin(t * 0.5) * 0.1;
    groupRef.current.rotation.y = Math.PI / 4 + Math.sin(t * 0.15) * 0.03;
    groupRef.current.position.y = 0.5 + slowBob;

    const pulse = 0.5 + 0.5 * Math.sin(t * 1.2);
    const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
    const edgeMat = edgesRef.current.material as THREE.LineBasicMaterial;

    const edgePulse = 0.3 + 0.3 * Math.sin(t * 2.5);
    mat.emissiveIntensity = 0.06 + pulse * 0.1;
    edgeMat.opacity = 0.5 + edgePulse;

    if (innerLightRef.current) {
      innerLightRef.current.intensity = 0.9 + pulse * 0.7;
    }
    if (innerLight2Ref.current) {
      innerLight2Ref.current.intensity = 0.3 + pulse * 0.3;
    }

    if (glowDiscRef.current) {
      const discMat = glowDiscRef.current.material as THREE.MeshBasicMaterial;
      discMat.opacity = 0.04 + pulse * 0.04;
    }

    if (bottomGroupRef.current) {
      bottomGroupRef.current.rotation.y = Math.PI / 4 - Math.sin(t * 0.15) * 0.03;
    }
    if (bottomEdgesRef.current) {
      const bottomEdgeMat = bottomEdgesRef.current.material as THREE.LineBasicMaterial;
      bottomEdgeMat.opacity = 0.6 + pulse * 0.3;
    }
    if (bottomBodyRef.current) {
      const bottomMat = bottomBodyRef.current.material as THREE.MeshStandardMaterial;
      bottomMat.emissiveIntensity = 0.04 + pulse * 0.08;
    }

    if (beamRef.current) {
      const beamMat = beamRef.current.material as THREE.MeshBasicMaterial;
      beamMat.opacity = 0.4 + 0.35 * Math.sin(t * 3) + pulse * 0.2;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.4;
      const particleMat = particlesRef.current.material as THREE.PointsMaterial;
      particleMat.opacity = 0.6 + 0.3 * Math.sin(t * 4);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <mesh ref={bodyRef} geometry={pyramidGeo} castShadow>
        <meshStandardMaterial
          color='#0a1a2e'
          emissive='#00d4ff'
          emissiveIntensity={0.1}
          metalness={0.92}
          roughness={0.08}
          transparent
          opacity={0.85}
        />
      </mesh>

      <lineSegments ref={edgesRef} geometry={edgesGeo}>
        <lineBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <pointLight
        ref={innerLightRef}
        color='#00d4ff'
        intensity={1.2}
        distance={7}
        decay={2}
        position={[0, 0.5, 0]}
      />
      <pointLight
        ref={innerLight2Ref}
        color='#00ff88'
        intensity={0.5}
        distance={4}
        decay={2}
        position={[0, -0.5, 0]}
      />

      <mesh
        ref={glowDiscRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.6, 0]}
        geometry={glowDiscGeo}
      >
        <meshBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} geometry={glowDiscGeoInner}>
        <meshBasicMaterial
          color='#00d4ff'
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={bottomGroupRef} position={[0, -2.8, 0]}>
        <mesh ref={bottomBodyRef} geometry={bottomPyramidGeo} rotation={[Math.PI, 0, 0]} castShadow>
          <meshStandardMaterial
            color='#0a1a2e'
            emissive='#00d4ff'
            emissiveIntensity={0.08}
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.9}
          />
        </mesh>

        <lineSegments ref={bottomEdgesRef} geometry={bottomEdgesGeo} rotation={[Math.PI, 0, 0]}>
          <lineBasicMaterial
            color='#00d4ff'
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      <mesh ref={beamRef} position={[0, 0.5, 0]} geometry={beamGeo}>
        <meshBasicMaterial
          color='#00ffff'
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points ref={particlesRef} position={[0, 0.5, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color='#00ffff'
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
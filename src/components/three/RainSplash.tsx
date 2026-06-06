import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SPLASH_COUNT = 200;
const PARTICLE_LIFE = 0.8;
const GRAVITY = -2.5;

interface SplashParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

export function RainSplash() {
  const count = SPLASH_COUNT;
  const positions = useRef(new Float32Array(count * 3));
  const alphas = useRef(new Float32Array(count));
  const sizes = useRef(new Float32Array(count));
  const particles = useRef<SplashParticle[]>([]);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const alpha = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = -100;
      pos[i * 3 + 2] = 0;
      alpha[i] = 0;
      size[i] = 0.02 + Math.random() * 0.04;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
    return geo;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#00ff41') },
    },
    vertexShader: `
      attribute float alpha;
      attribute float size;
      varying float vAlpha;
      void main() {
        vAlpha = alpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      uniform vec3 uColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = 1.0 - smoothstep(0.0, 0.5, d);
        gl_FragColor = vec4(uColor, a * vAlpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  const pool = useMemo(() => {
    const p: SplashParticle[] = [];
    for (let i = 0; i < count; i++) {
      p.push({
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(0, 0, 0),
        life: 0,
        maxLife: PARTICLE_LIFE,
        active: false,
      });
    }
    particles.current = p;
    return p;
  }, []);

  let emitIndex = 0;

  function emitSplash(x: number, z: number) {
    const pCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < pCount; i++) {
      const p = pool[emitIndex % count];
      emitIndex++;
      p.active = true;
      p.pos.set(x, 0, z);
      p.life = 0;
      p.maxLife = 0.3 + Math.random() * 0.5;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      p.vel.set(
        Math.cos(angle) * speed,
        1.5 + Math.random() * 3,
        Math.sin(angle) * speed,
      );
    }
  }

  useFrame((_, delta) => {
    const pos = geometry.attributes.position.array as Float32Array;
    const alpha = geometry.attributes.alpha.array as Float32Array;
    const needsUpdate = { value: false };

    for (let i = 0; i < count; i++) {
      const p = pool[i];
      if (!p.active) {
        pos[i * 3 + 1] = -100;
        alpha[i] = 0;
        continue;
      }
      p.life += delta;
      if (p.life >= p.maxLife) {
        p.active = false;
        pos[i * 3 + 1] = -100;
        alpha[i] = 0;
        needsUpdate.value = true;
        continue;
      }
      const t = p.life / p.maxLife;
      p.vel.y += GRAVITY * delta;
      p.pos.x += p.vel.x * delta;
      p.pos.y += p.vel.y * delta;
      p.pos.z += p.vel.z * delta;
      pos[i * 3] = p.pos.x;
      pos[i * 3 + 1] = p.pos.y;
      pos[i * 3 + 2] = p.pos.z;
      alpha[i] = 1.0 - t;
      needsUpdate.value = true;
    }

    if (needsUpdate.value) {
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.alpha.needsUpdate = true;
    }

    (window as any).__emitSplash = emitSplash;
  });

  return (
    <points>
      <primitive object={geometry} />
      <primitive object={material} />
    </points>
  );
}

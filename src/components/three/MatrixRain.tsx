import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CHAR_SET = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#!$^&*()-=+';
const COLUMNS = 30;
const CHARS_PER_COL = 14;
const COL_WIDTH = 0.5;
const CHAR_HEIGHT = 0.35;
const FALL_SPEED_MIN = 0.6;
const FALL_SPEED_MAX = 1.5;

function createGlyphTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cols = 4;
  const rows = Math.ceil(CHAR_SET.length / cols);
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  for (let i = 0; i < CHAR_SET.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.fillStyle = '#0f0';
    ctx.fillText(CHAR_SET[i], col * cellW + cellW / 2, row * cellH + cellH / 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

const vertShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uGlyphTex;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uOffset;
  uniform vec3 uColor;
  uniform float uBrightness;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float chars = 14.0;
    float idx = floor(vUv.y * chars);
    float cell = idx / chars;
    float wave = uOffset + uTime * uSpeed;
    float phase = (idx + vUv.y * 0.2) / chars;
    float bright = 1.0 - fract(phase * 3.0 + wave);
    bright = clamp(bright * 2.5, 0.0, 1.0);
    bright = pow(bright, 1.8);

    float peak = exp(-abs(bright - 1.0) * 8.0);
    bright = mix(bright * 0.5, 1.0, peak);

    float selX = mod(cell * 4.0, 1.0);
    float selY = 1.0 - floor(cell * 4.0) / 4.0;
    vec3 g = texture2D(uGlyphTex, vec2(selX + 0.125, selY - 0.125)).rgb;
    float glyph = g.g;

    float alpha = glyph * bright * uBrightness;
    vec3 col = mix(uColor, vec3(1.0, 1.0, 1.0), peak * 0.3);
    col *= 0.2 + bright * 0.8;

    gl_FragColor = vec4(col, alpha);
  }
`;

interface ColumnState {
  speed: number;
  offset: number;
  x: number;
  z: number;
}

export function MatrixRain() {
  const glyphTex = useMemo(() => createGlyphTexture(), []);
  const timeRef = useRef(0);

  const columns = useMemo(() => {
    const data: ColumnState[] = [];
    const radius = 9;
    for (let i = 0; i < COLUMNS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      data.push({
        speed: FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
        offset: Math.random() * 1000,
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
      });
    }
    return data;
  }, []);

  const materials = useMemo(() =>
    columns.map((col) => new THREE.ShaderMaterial({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        uGlyphTex: { value: glyphTex },
        uTime: { value: 0 },
        uSpeed: { value: col.speed },
        uOffset: { value: col.offset },
        uColor: { value: new THREE.Color('#00ff41') },
        uBrightness: { value: 0.8 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })),
    [columns, glyphTex],
  );

  useFrame((_, delta) => {
    timeRef.current += delta;
    materials.forEach((mat) => {
      mat.uniforms.uTime.value = timeRef.current;
    });
  });

  const geo = useMemo(() => new THREE.PlaneGeometry(COL_WIDTH, CHARS_PER_COL * CHAR_HEIGHT), []);

  return (
    <group position={[0, 2.5, 0]}>
      {columns.map((col, i) => (
        <mesh
          key={i}
          geometry={geo}
          material={materials[i]}
          position={[col.x, 2, col.z]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
        />
      ))}
    </group>
  );
}

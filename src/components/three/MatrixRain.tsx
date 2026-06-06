import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CHAR_SET = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const WIDTH = 256;
const HEIGHT = 256;
const COLUMNS = 20;
const ROWS = 14;

export function MatrixRain() {
  const { canvas, texture, ctx, columnData } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = WIDTH;
    c.height = HEIGHT;
    const cx = c.getContext('2d')!;
    cx.font = '12px monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const cols: { x: number; y: number; speed: number; chars: number[] }[] = [];
    for (let i = 0; i < COLUMNS; i++) {
      const chars: number[] = [];
      for (let j = 0; j < ROWS; j++) chars.push(Math.floor(Math.random() * CHAR_SET.length));
      cols.push({
        x: (i / COLUMNS) * WIDTH,
        y: Math.random() * HEIGHT,
        speed: 20 + Math.random() * 40,
        chars,
      });
    }

    return { canvas: c, texture: tex, ctx: cx, columnData: cols };
  }, []);

  useFrame((_, delta) => {
    ctx.fillStyle = 'rgba(5, 5, 8, 0.15)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    columnData.forEach((col) => {
      col.y += col.speed * delta;
      if (col.y > HEIGHT + ROWS * 14) {
        col.y = -ROWS * 14;
        col.chars = col.chars.map(() => Math.floor(Math.random() * CHAR_SET.length));
      }

      const cellH = 14;
      for (let i = 0; i < ROWS; i++) {
        const yPos = col.y - i * cellH;
        if (yPos < -cellH || yPos > HEIGHT + cellH) continue;

        const distFromWave = Math.abs(yPos - HEIGHT * 0.3);
        const bright = Math.max(0, 1 - distFromWave / (HEIGHT * 0.4));
        const alpha = bright * 0.8;

        ctx.globalAlpha = alpha;
        const idx = col.chars[i % ROWS];
        const ch = CHAR_SET[idx];
        ctx.fillStyle = bright > 0.8 ? '#ccffcc' : bright > 0.4 ? '#00ff41' : '#004400';
        ctx.fillText(ch, col.x, yPos);
      }
    });

    ctx.globalAlpha = 1;
    texture.needsUpdate = true;
  });

  const geo = useMemo(() => new THREE.PlaneGeometry(14, 14), []);

  return (
    <mesh geometry={geo} position={[0, 3, -5]} rotation={[0, 0, 0]}>
      <meshBasicMaterial map={texture} transparent opacity={0.7} depthWrite={false} />
    </mesh>
  );
}

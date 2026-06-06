import * as THREE from 'three';

export interface GridTextureParams {
  size: number;
  rings: number;
  spokes: number;
  ringColor: string;
  spokeColor: string;
  glowColor: string;
  bgColor: string;
  glowIntensity: number;
}

export function createRadialGridTexture(params: GridTextureParams): THREE.CanvasTexture {
  const { size, rings, spokes, ringColor, spokeColor, glowColor, bgColor, glowIntensity } = params;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 8;

  function drawGlowLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowIntensity;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * maxR;
    for (let i = 0; i < 64; i++) {
      const a1 = (i / 64) * Math.PI * 2;
      const a2 = ((i + 1) / 64) * Math.PI * 2;
      const alpha = r === rings ? 0.8 : 0.15 + (r / rings) * 0.3;
      ctx.globalAlpha = alpha;
      drawGlowLine(
        cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius,
        cx + Math.cos(a2) * radius, cy + Math.sin(a2) * radius,
        ringColor,
      );
    }
  }

  for (let s = 0; s < spokes; s++) {
    const angle = (s / spokes) * Math.PI * 2;
    const alpha = 0.1 + (s % 4 === 0 ? 0.4 : 0.15);
    ctx.globalAlpha = alpha;
    drawGlowLine(cx, cy, cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR, spokeColor);
  }

  ctx.globalAlpha = 0.6;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = glowIntensity * 2;
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  return tex;
}

export function createCellTexture(size: number = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0, 212, 255, 0.05)';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(1, 1, size - 2, size - 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

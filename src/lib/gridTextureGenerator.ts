import * as THREE from 'three';

export interface GridTextureParams {
  size: number;
  rings: number;
  spokes: number;
  ringColor: string;
  spokeColor: string;
  glowColor: string;
  bgColor: string;
}

export function createRadialGridTexture(params: GridTextureParams): THREE.CanvasTexture {
  const { size, rings, spokes, ringColor, spokeColor, glowColor, bgColor } = params;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 8;

  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * maxR;
    const alpha = r === rings ? 0.7 : 0.1 + (r / rings) * 0.25;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = r === rings ? 1.5 : 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let s = 0; s < spokes; s++) {
    const angle = (s / spokes) * Math.PI * 2;
    const alpha = s % 4 === 0 ? 0.35 : 0.12;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = spokeColor;
    ctx.lineWidth = s % 4 === 0 ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.08;
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.98, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 2;
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

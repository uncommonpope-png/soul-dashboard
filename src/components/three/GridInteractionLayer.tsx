import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGridStore } from '../../store/useGridStore';

export function useGridInit() {
  const initCells = useGridStore((s) => s.initCells);

  useEffect(() => {
    const RINGS = 16;
    const SPOKES = 24;
    const RADIUS = 16;
    const cells: Parameters<typeof initCells>[0] = [];

    for (let r = 3; r <= RINGS; r++) {
      const ringRadius = (r / RINGS) * RADIUS;
      const spokeCount = r === RINGS ? SPOKES : Math.max(8, r * 2);
      for (let s = 0; s < spokeCount; s++) {
        const angle = (s / spokeCount) * Math.PI * 2;
        const x = Math.cos(angle) * ringRadius;
        const z = Math.sin(angle) * ringRadius;
        const id = `r${r}s${s}`;
        cells.push({
          id,
          ring: r,
          spoke: s,
          worldX: x,
          worldZ: z,
          building: null,
          label: null,
          selected: false,
          hovered: false,
        });
      }
    }

    initCells(cells);
  }, [initCells]);
}

export function GridInteractionLayer() {
  const selectedCellId = useGridStore((s) => s.selectedCellId);
  const getCell = useGridStore((s) => s.cells.get.bind(s.cells));
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (selectedCellId) {
      const cell = getCell(selectedCellId);
      if (cell) {
        const y = cell.building ? cell.building.height / 2 : 0;
        targetPos.current.set(cell.worldX, y, cell.worldZ);
        isAnimating.current = true;
      }
    }
  }, [selectedCellId, getCell]);

  useFrame((_, delta) => {
    if (isAnimating.current) {
      currentPos.current.lerp(targetPos.current, 1 - Math.exp(-3 * delta));
      if (currentPos.current.distanceTo(targetPos.current) < 0.05) {
        isAnimating.current = false;
      }
    }
  });

  return null;
}

import { useMemo } from 'react';
import * as THREE from 'three';
import { useGridStore } from '../../store/useGridStore';

export function CityBuilder() {
  const cells = useGridStore((s) => s.cells);
  const theme = useGridStore((s) => s.theme);

  const themeColors: Record<string, { core: string; commercial: string; residential: string }> = {
    cyberpunk: { core: '#00d4ff', commercial: '#4488ff', residential: '#00ff88' },
    neon: { core: '#ff00ff', commercial: '#00ffff', residential: '#ff6600' },
    mars: { core: '#ff4400', commercial: '#ff8800', residential: '#ffcc00' },
  };

  const colors = themeColors[theme] || themeColors.cyberpunk;

  const buildings = useMemo(() => {
    const list: {
      x: number; z: number; w: number; h: number; d: number; color: string; type: string;
    }[] = [];
    cells.forEach((cell) => {
      if (!cell.building) return;
      const type = cell.building.type || 'residential';
      const col = type === 'core' ? colors.core
        : type === 'commercial' ? colors.commercial
        : colors.residential;
      list.push({
        x: cell.worldX,
        z: cell.worldZ,
        w: 0.6,
        h: cell.building.height,
        d: 0.6,
        color: col,
        type,
      });
    });
    return list;
  }, [cells, colors]);

  const buildingInstances = useMemo(() => {
    if (buildings.length === 0) return null;
    const count = buildings.length;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      metalness: 0.4,
      roughness: 0.3,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    const colorAttr = new Float32Array(count * 3);

    buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const c = new THREE.Color(b.color);
      colorAttr[i * 3] = c.r;
      colorAttr[i * 3 + 1] = c.g;
      colorAttr[i * 3 + 2] = c.b;
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.setColorAt(0, new THREE.Color(0)); // placeholder
    const colorGeo = new THREE.InstancedMesh(geo, mat, count);
    colorGeo.instanceMatrix.copy(mesh.instanceMatrix);
    colorGeo.instanceColor = new THREE.InstancedBufferAttribute(colorAttr, 3);
    colorGeo.instanceColor.needsUpdate = true;

    return colorGeo;
  }, [buildings]);

  if (!buildingInstances) return null;

  // Wrap in a group — use primitive for the instanced mesh
  return (
    <group>
      <primitive object={buildingInstances} />
    </group>
  );
}

import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useGridStore, GridCellState } from '../../store/useGridStore';

interface GridCellViewProps {
  cell: GridCellState;
  spacing: number;
  onClick: (id: string) => void;
  onContextMenu: (id: string, x: number, y: number) => void;
}

function GridCellView({ cell, spacing, onClick, onContextMenu }: GridCellViewProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={[cell.worldX, 0.02, cell.worldZ]}
      onClick={(e) => { e.stopPropagation(); onClick(cell.id); }}
      onContextMenu={(e) => {
        e.nativeEvent.preventDefault();
        e.stopPropagation();
        onContextMenu(cell.id, e.nativeEvent.clientX, e.nativeEvent.clientY);
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[spacing * 0.7, spacing * 0.7]} />
      <meshBasicMaterial
        color={cell.selected ? '#00d4ff' : '#ffffff'}
        transparent
        opacity={cell.selected ? 0.25 : hovered ? 0.12 : 0.02}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function GridCellLayer() {
  const { cells, selectCell, hoverCell } = useGridStore();
  const [contextMenu, setContextMenu] = useState<{
    cellId: string; x: number; y: number;
  } | null>(null);

  const handleClick = (id: string) => {
    selectCell(id);
    setContextMenu(null);
  };

  const handleContextMenu = (id: string, x: number, y: number) => {
    selectCell(id);
    setContextMenu({ cellId: id, x, y });
  };

  const handleCloseMenu = () => setContextMenu(null);

  const cellArray = useMemo(() => Array.from(cells.values()), [cells]);

  return (
    <>
      {cellArray.map((cell) => (
        <GridCellView
          key={cell.id}
          cell={cell}
          spacing={1.5}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        />
      ))}
      {contextMenu && (
        <GridContextMenu
          cellId={contextMenu.cellId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseMenu}
        />
      )}
    </>
  );
}

function GridContextMenu({ cellId, x, y, onClose }: {
  cellId: string; x: number; y: number; onClose: () => void;
}) {
  const cell = useGridStore((s) => s.cells.get(cellId));
  const { placeBuilding, removeBuilding, setLabel } = useGridStore();

  const items = [
    { label: '🏢 Place Core', action: () => placeBuilding(cellId, 'core') },
    { label: '🏬 Place Commercial', action: () => placeBuilding(cellId, 'commercial') },
    { label: '🏠 Place Residential', action: () => placeBuilding(cellId, 'residential') },
    { label: '🗑 Remove Building', action: () => removeBuilding(cellId) },
    { label: '✏️ Set Label', action: () => {
      const lbl = prompt('Label:', cell?.label || '');
      if (lbl !== null) setLabel(cellId, lbl);
    }},
  ];

  return (
    <div
      style={{
        position: 'fixed', left: x, top: y, zIndex: 10000,
        background: 'rgba(10, 14, 25, 0.95)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: 8, padding: 4, minWidth: 180,
        backdropFilter: 'blur(12px)',
        fontFamily: '"JetBrains Mono", monospace', fontSize: 13,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ padding: '4px 12px', color: '#5a7a9a', fontSize: 11, borderBottom: '1px solid rgba(0,212,255,0.1)', marginBottom: 2 }}>
        CELL {cellId}
      </div>
      {items.map((item) => (
        <div
          key={item.label}
          onClick={() => { item.action(); onClose(); }}
          style={{
            padding: '6px 12px', cursor: 'pointer', borderRadius: 4,
            color: '#ccc',
          }}
          onPointerOver={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.12)'; }}
          onPointerOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

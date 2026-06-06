import { useGridStore, GridTheme } from '../../store/useGridStore';

const themes: { value: GridTheme; label: string }[] = [
  { value: 'cyberpunk', label: 'CYBERPUNK' },
  { value: 'neon', label: 'NEON' },
  { value: 'mars', label: 'MARS' },
];

export function GridControlPanel() {
  const theme = useGridStore((s) => s.theme);
  const setTheme = useGridStore((s) => s.setTheme);
  const rainEnabled = useGridStore((s) => s.rainEnabled);
  const setRainEnabled = useGridStore((s) => s.setRainEnabled);
  const cells = useGridStore((s) => s.cells);
  const selectedCellId = useGridStore((s) => s.selectedCellId);
  const getSelectedCell = useGridStore((s) => s.getSelectedCell);

  const cellCount = cells.size;
  const buildingCount = Array.from(cells.values()).filter((c) => c.building).length;
  const selected = selectedCellId ? getSelectedCell() : null;

  return (
    <div style={{
      position: 'absolute', bottom: 20, right: 20,
      background: 'rgba(10, 14, 25, 0.92)',
      border: '1px solid rgba(0, 212, 255, 0.2)',
      borderRadius: 12, padding: 16, minWidth: 220,
      backdropFilter: 'blur(12px)',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 12,
      color: '#e8f4ff', zIndex: 100,
    }}>
      <div style={{ color: '#00d4ff', fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>
        GRID CONTROL
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#5a7a9a', fontSize: 10, marginBottom: 2 }}>CELLS: {cellCount}</div>
        <div style={{ color: '#5a7a9a', fontSize: 10 }}>BUILDINGS: {buildingCount}</div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#5a7a9a', fontSize: 10, marginBottom: 4 }}>THEME</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              style={{
                padding: '4px 8px', borderRadius: 4, border: '1px solid',
                borderColor: theme === t.value ? '#00d4ff' : 'rgba(255,255,255,0.1)',
                background: theme === t.value ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: '#e8f4ff', fontSize: 10, cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type='checkbox'
            checked={rainEnabled}
            onChange={(e) => setRainEnabled(e.target.checked)}
            style={{ accentColor: '#00d4ff' }}
          />
          <span style={{ color: '#5a7a9a', fontSize: 10 }}>MATRIX RAIN</span>
        </label>
      </div>

      {selected && (
        <div style={{
          padding: 8, borderRadius: 6,
          background: 'rgba(0, 212, 255, 0.06)',
          border: '1px solid rgba(0, 212, 255, 0.15)',
        }}>
          <div style={{ color: '#00d4ff', fontSize: 10 }}>SELECTED: {selected.id}</div>
          <div style={{ color: '#5a7a9a', fontSize: 10 }}>
            {selected.building ? `🏢 ${selected.building.type}` : 'Empty'}
          </div>
          {selected.label && (
            <div style={{ color: '#5a7a9a', fontSize: 10 }}>📌 {selected.label}</div>
          )}
        </div>
      )}
    </div>
  );
}

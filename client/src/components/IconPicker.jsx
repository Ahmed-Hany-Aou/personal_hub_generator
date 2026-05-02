import { useState, useMemo } from 'react';
import { ICON_CATEGORIES, ALL_ICONS } from '../lib/iconLibrary.js';
import styles from './IconPicker.module.css';

function SvgIcon({ path, size = 20, color = 'currentColor' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path.split(' M ').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : 'M ' + segment} />
      ))}
    </svg>
  );
}

const DEFAULT_SIZE = 32;
const DEFAULT_COLOR = '#ffffff';

export default function IconPicker({ onAdd, onClose, accentColor }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [color, setColor] = useState(accentColor || DEFAULT_COLOR);

  const categoryKeys = ['all', ...Object.keys(ICON_CATEGORIES)];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return Object.entries(ALL_ICONS).filter(([name, meta]) => {
      const catMatch = category === 'all' || meta.category === category;
      const queryMatch = !q || name.includes(q) || meta.category.includes(q);
      return catMatch && queryMatch;
    });
  }, [query, category]);

  const handleAdd = () => {
    if (!selected) return;
    onAdd({ iconKey: selected, size, color });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Icon Library</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.searchRow}>
          <input
            className={styles.search}
            type="text"
            placeholder="Search icons…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.catTabs}>
          {categoryKeys.map(k => (
            <button
              key={k}
              className={`${styles.catTab} ${category === k ? styles.catTabActive : ''}`}
              onClick={() => setCategory(k)}
            >
              {k === 'all' ? 'All' : ICON_CATEGORIES[k]?.label || k}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.length === 0 && (
            <div className={styles.empty}>No icons found for "{query}"</div>
          )}
          {filtered.map(([name, meta]) => (
            <button
              key={name}
              className={`${styles.iconBtn} ${selected === name ? styles.iconBtnSelected : ''}`}
              onClick={() => setSelected(name)}
              title={name}
            >
              <SvgIcon path={meta.path} size={22} color={selected === name ? accentColor || '#22d3ee' : 'currentColor'} />
              <span className={styles.iconLabel}>{name}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className={styles.controls}>
            <div className={styles.controlRow}>
              <span className={styles.controlLabel}>Preview</span>
              <div className={styles.preview} style={{ color }}>
                <SvgIcon path={ALL_ICONS[selected].path} size={size} color={color} />
              </div>
            </div>
            <div className={styles.controlRow}>
              <span className={styles.controlLabel}>Color</span>
              <div className={styles.colorRow}>
                <input
                  type="color"
                  className={styles.colorSwatch}
                  value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#ffffff'}
                  onChange={e => setColor(e.target.value)}
                />
                <input
                  type="text"
                  className={styles.colorText}
                  value={color}
                  maxLength={7}
                  onChange={e => setColor(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.controlRow}>
              <span className={styles.controlLabel}>Size — {size}px</span>
              <input
                type="range"
                className={styles.slider}
                min={16}
                max={80}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.addBtn}
            onClick={handleAdd}
            disabled={!selected}
            style={selected ? { background: accentColor || '#22d3ee' } : {}}
          >
            Add to Card
          </button>
        </div>
      </div>
    </div>
  );
}

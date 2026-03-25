import { useEffect, useRef } from 'react';
import styles from './StyleToolbar.module.css';

const FONTS = [
  { label: 'Inter',    value: 'Inter, sans-serif' },
  { label: 'Poppins',  value: 'Poppins, sans-serif' },
  { label: 'Raleway',  value: 'Raleway, sans-serif' },
  { label: 'Roboto',   value: 'Roboto, sans-serif' },
  { label: 'Georgia',  value: 'Georgia, serif' },
  { label: 'Courier',  value: "'Courier New', monospace" },
];

/**
 * Floating toolbar that appears when an element is selected.
 *
 * Props:
 *  anchor       – { x, y } viewport pixel where to place the toolbar
 *  nodeId       – id of the currently selected node
 *  nodeStyles   – current style overrides from layoutState for the node
 *  onStyleChange(nodeId, patch) – callback to update layoutState
 *  bgColor      – current card/page background color
 *  onBgChange(color) – callback to override the background
 *  onClose()    – closes the toolbar (e.g. clicking away)
 */
export default function StyleToolbar({
  anchor,
  nodeId,
  nodeStyles = {},
  onStyleChange,
  bgColor,
  onBgChange,
  onClose,
}) {
  const ref = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Position the toolbar so it doesn't go off-screen
  const toolbarStyle = {};
  if (anchor) {
    const vw = window.innerWidth;
    const TOOLBAR_W = 440;
    let left = anchor.x;
    if (left + TOOLBAR_W > vw - 8) left = vw - TOOLBAR_W - 8;
    toolbarStyle.left = `${left}px`;
    toolbarStyle.top  = `${anchor.y - 70}px`; // appear above the element
  }

  const patch = (key, val) => onStyleChange?.(nodeId, { ...nodeStyles, [key]: val });

  if (!nodeId) return null;

  return (
    <div
      ref={ref}
      className={styles.toolbar}
      style={toolbarStyle}
      onPointerDown={(e) => e.stopPropagation()} // prevent canvas deselect
    >
      {/* ── Font Family ───────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.label}>Font</span>
        <select
          className={styles.select}
          value={nodeStyles.fontFamily || ''}
          onChange={(e) => patch('fontFamily', e.target.value)}
        >
          <option value="">Default</option>
          {FONTS.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* ── Font Size ─────────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.label}>Size</span>
        <input
          type="range"
          className={styles.slider}
          min={8}
          max={120}
          step={1}
          value={nodeStyles.fontSize ?? 16}
          onChange={(e) => patch('fontSize', Number(e.target.value))}
        />
        <input
          type="number"
          className={styles.numInput}
          min={8}
          max={120}
          value={nodeStyles.fontSize ?? 16}
          onChange={(e) => patch('fontSize', Number(e.target.value))}
        />
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* ── Text Color ────────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.label}>Color</span>
        <div className={styles.swatchWrap}>
          <input
            type="color"
            className={styles.colorPicker}
            value={nodeStyles.color || '#ffffff'}
            onChange={(e) => patch('color', e.target.value)}
            title="Text / element color"
          />
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* ── Card / Page Background ────────────────────── */}
      <div className={styles.group}>
        <span className={styles.label}>BG</span>
        <div className={styles.swatchWrap}>
          <input
            type="color"
            className={styles.colorPicker}
            value={bgColor || '#0a0f16'}
            onChange={(e) => onBgChange?.(e.target.value)}
            title="Card / page background color"
          />
        </div>
      </div>

      {/* Close button */}
      <button className={styles.closeBtn} onClick={onClose} title="Close (Esc)">✕</button>
    </div>
  );
}

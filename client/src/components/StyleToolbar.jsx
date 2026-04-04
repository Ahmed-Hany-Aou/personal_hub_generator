import { useEffect, useRef, useState } from 'react';
import styles from './StyleToolbar.module.css';

const FONTS = [
  { label: 'Default',  value: '' },
  { label: 'Inter',    value: 'Inter, sans-serif' },
  { label: 'Poppins',  value: 'Poppins, sans-serif' },
  { label: 'Raleway',  value: 'Raleway, sans-serif' },
  { label: 'Roboto',   value: 'Roboto, sans-serif' },
  { label: 'Georgia',  value: 'Georgia, serif' },
  { label: 'Courier',  value: "'Courier New', monospace" },
];

/** Sync a hex text input with a color picker, and call onChange(#RRGGBB) */
function HexColorPair({ value, onChange, label, title }) {
  const [hex, setHex] = useState((value || '#ffffff').replace('#', ''));

  useEffect(() => {
    setHex((value || '#ffffff').replace('#', ''));
  }, [value]);

  const tryApply = (raw) => {
    const cleaned = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setHex(cleaned);
    if (cleaned.length === 6) onChange(`#${cleaned}`);
  };

  return (
    <div className={styles.hexPair} title={title}>
      <span className={styles.pairLabel}>{label}</span>
      <input
        type="color"
        className={styles.colorPicker}
        value={value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#ffffff'}
        onChange={e => { onChange(e.target.value); setHex(e.target.value.replace('#', '')); }}
      />
      <span className={styles.hashSymbol}>#</span>
      <input
        type="text"
        className={styles.hexInput}
        value={hex}
        maxLength={6}
        placeholder="22d3ee"
        onChange={e => tryApply(e.target.value)}
        onBlur={e => tryApply(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && tryApply(e.target.value)}
      />
    </div>
  );
}

export default function StyleToolbar({
  nodeId,
  nodeStyles = {},
  onStyleChange,
  bgColor,
  onBgChange,
  onClose,
  position,
  onPositionChange,
}) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      // Find the preview area bounding box to keep the toolbar within it if possible
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      onPositionChange?.({ x, y });
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, dragOffset, onPositionChange]);

  const patch = (key, val) => onStyleChange?.(nodeId, { ...nodeStyles, [key]: val });
  const toggle = (key, on, off) => patch(key, nodeStyles[key] === on ? off : on);

  const startDrag = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  if (!nodeId) return null;

  const style = position ? {
    position: 'fixed',
    left: position.x,
    top: position.y,
    transform: 'none',
    bottom: 'auto',
    '--toolbar-anim': 'none',
  } : {};

  return (
    <div
      ref={ref}
      style={style}
      className={`${styles.toolbar} ${isDragging ? styles.dragging : ''}`}
      onPointerDown={e => e.stopPropagation()}
    >
      {/* ── Drag Handle + Node label ──────────────────────────────────── */}
      <div className={styles.dragHandle} onPointerDown={startDrag} title="Drag to move">
        <span style={{ fontSize: '0.8rem', marginRight: 4, opacity: 0.5 }}>⠿</span>
        <span className={styles.nodeLabel}>{nodeId.replace(/-/g,' ')}</span>
      </div>
      <span className={styles.sep} />

      {/* ── Font family ─────────────────────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Font</span>
        <select
          className={styles.select}
          value={nodeStyles.fontFamily || ''}
          onChange={e => patch('fontFamily', e.target.value)}
        >
          {FONTS.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value || 'inherit' }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <span className={styles.sep} />

      {/* ── Font size ───────────────────────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Size</span>
        <input
          type="range"
          className={styles.slider}
          min={8} max={120} step={1}
          value={nodeStyles.fontSize ?? 16}
          onChange={e => patch('fontSize', Number(e.target.value))}
        />
        <input
          type="number"
          className={styles.numInput}
          min={8} max={120}
          value={nodeStyles.fontSize ?? 16}
          onChange={e => patch('fontSize', Number(e.target.value))}
        />
      </div>

      <span className={styles.sep} />

      {/* ── Format buttons ──────────────────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Format</span>
        <button
          className={`${styles.fmtBtn} ${nodeStyles.fontWeight === 'bold' ? styles.fmtActive : ''}`}
          onClick={() => toggle('fontWeight', 'bold', 'normal')}
          title="Bold"
        ><b>B</b></button>
        <button
          className={`${styles.fmtBtn} ${nodeStyles.fontStyle === 'italic' ? styles.fmtActive : ''}`}
          onClick={() => toggle('fontStyle', 'italic', 'normal')}
          title="Italic"
        ><i>I</i></button>
        <button
          className={`${styles.fmtBtn} ${nodeStyles.textDecoration === 'underline' ? styles.fmtActive : ''}`}
          onClick={() => toggle('textDecoration', 'underline', 'none')}
          title="Underline"
        ><u>U</u></button>
      </div>

      <span className={styles.sep} />

      {/* ── Text align ──────────────────────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Align</span>
        {['left','center','right'].map(a => (
          <button
            key={a}
            className={`${styles.fmtBtn} ${nodeStyles.textAlign === a ? styles.fmtActive : ''}`}
            onClick={() => patch('textAlign', a)}
            title={`Align ${a}`}
          >{a === 'left' ? '⬅' : a === 'center' ? '☰' : '➡'}</button>
        ))}
      </div>

      <span className={styles.sep} />

      {/* ── Text color + hex ────────────────────────────────────────── */}
      <HexColorPair
        label="Text"
        title="Text / element color"
        value={nodeStyles.color || '#ffffff'}
        onChange={v => patch('color', v)}
      />

      <span className={styles.sep} />

      {/* ── Background / page color + hex ───────────────────────────── */}
      <HexColorPair
        label="BG"
        title="Card / page background"
        value={bgColor || '#0a0f16'}
        onChange={v => onBgChange?.(v)}
      />

      <span className={styles.sep} />

      {/* ── Opacity ─────────────────────────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Opacity</span>
        <input
          type="range"
          className={styles.slider}
          min={0} max={1} step={0.05}
          value={nodeStyles.opacity ?? 1}
          onChange={e => patch('opacity', Number(e.target.value))}
        />
        <span className={styles.numDisplay}>{Math.round((nodeStyles.opacity ?? 1) * 100)}%</span>
      </div>

      <span className={styles.sep} />

      {/* ── Letter spacing ──────────────────────────────────────────── */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Spacing</span>
        <input
          type="range"
          className={styles.slider}
          min={-2} max={20} step={0.5}
          value={nodeStyles.letterSpacing ?? 0}
          onChange={e => patch('letterSpacing', Number(e.target.value))}
        />
        <span className={styles.numDisplay}>{nodeStyles.letterSpacing ?? 0}px</span>
      </div>

      {/* ── Close ───────────────────────────────────────────────────── */}
      <button className={styles.closeBtn} onClick={onClose} title="Close (Esc)">✕</button>
    </div>
  );
}

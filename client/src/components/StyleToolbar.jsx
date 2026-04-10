import { useState, useEffect } from 'react';
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
}) {
  const patch = (key, val) => onStyleChange?.(nodeId, { ...nodeStyles, [key]: val });
  const toggle = (key, on, off) => patch(key, nodeStyles[key] === on ? off : on);

  if (!nodeId) return <div className={styles.emptyState}>Select an element on the canvas to edit its styles.</div>;

  return (
    <div className={styles.toolbar}>
      <div className={styles.nodeIdentifier}>
        Editing element: <span className={styles.nodeLabel}>{nodeId.replace(/-/g,' ')}</span>
      </div>

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

      <div className={styles.group}>
        <span className={styles.groupLabel}>Format</span>
        <div style={{display:'flex', gap:'4px'}}>
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
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Align</span>
        <div style={{display:'flex', gap:'4px'}}>
          {['left','center','right'].map(a => (
            <button
              key={a}
              className={`${styles.fmtBtn} ${nodeStyles.textAlign === a ? styles.fmtActive : ''}`}
              onClick={() => patch('textAlign', a)}
              title={`Align ${a}`}
            >{a === 'left' ? '⬅' : a === 'center' ? '☰' : '➡'}</button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <HexColorPair
          label="Text"
          title="Text / element color"
          value={nodeStyles.color || '#ffffff'}
          onChange={v => patch('color', v)}
        />
        <HexColorPair
          label="BG"
          title="Card / page background"
          value={bgColor || '#0a0f16'}
          onChange={v => onBgChange?.(v)}
        />
      </div>

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
    </div>
  );
}

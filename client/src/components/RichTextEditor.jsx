import { useRef, useCallback, useEffect } from 'react';
import styles from './RichTextEditor.module.css';

const FONTS = ['Inter', 'Poppins', 'Raleway', 'Roboto', 'Georgia', 'Courier New'];
const SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

function exec(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write something…' }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []); // only on mount

  const handleInput = useCallback(() => {
    onChange?.(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const btn = (cmd, val = null, title = '') => (
    <button
      type="button"
      className={styles.toolBtn}
      title={title || cmd}
      onMouseDown={(e) => {
        e.preventDefault();
        exec(cmd, val);
        editorRef.current?.focus();
        handleInput();
      }}
    />
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        {/* Undo / Redo */}
        <button type="button" className={styles.toolBtn} title="Undo (Ctrl+Z)"
          onMouseDown={e => { e.preventDefault(); exec('undo'); }}>↩</button>
        <button type="button" className={styles.toolBtn} title="Redo (Ctrl+Y)"
          onMouseDown={e => { e.preventDefault(); exec('redo'); }}>↪</button>

        <span className={styles.sep} />

        {/* Font family */}
        <select className={styles.toolSelect} title="Font"
          onChange={e => { exec('fontName', e.target.value); editorRef.current?.focus(); handleInput(); }}>
          <option value="">Font</option>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Font size */}
        <select className={styles.toolSelect} title="Size"
          onChange={e => { exec('fontSize', e.target.value); editorRef.current?.focus(); handleInput(); }}>
          <option value="">Size</option>
          {[1,2,3,4,5,6,7].map((s, i) => (
            <option key={s} value={s}>{SIZES[i] || s}</option>
          ))}
        </select>

        <span className={styles.sep} />

        {/* Format */}
        <button type="button" className={`${styles.toolBtn} ${styles.bold}`} title="Bold (Ctrl+B)"
          onMouseDown={e => { e.preventDefault(); exec('bold'); handleInput(); }}>B</button>
        <button type="button" className={`${styles.toolBtn} ${styles.italic}`} title="Italic (Ctrl+I)"
          onMouseDown={e => { e.preventDefault(); exec('italic'); handleInput(); }}>I</button>
        <button type="button" className={`${styles.toolBtn} ${styles.underline}`} title="Underline (Ctrl+U)"
          onMouseDown={e => { e.preventDefault(); exec('underline'); handleInput(); }}>U</button>
        <button type="button" className={`${styles.toolBtn} ${styles.strike}`} title="Strikethrough"
          onMouseDown={e => { e.preventDefault(); exec('strikeThrough'); handleInput(); }}>S̶</button>

        <span className={styles.sep} />

        {/* Alignment */}
        <button type="button" className={styles.toolBtn} title="Align Left"
          onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); handleInput(); }}>⬅</button>
        <button type="button" className={styles.toolBtn} title="Align Center"
          onMouseDown={e => { e.preventDefault(); exec('justifyCenter'); handleInput(); }}>☰</button>
        <button type="button" className={styles.toolBtn} title="Align Right"
          onMouseDown={e => { e.preventDefault(); exec('justifyRight'); handleInput(); }}>➡</button>
        <button type="button" className={styles.toolBtn} title="Justify"
          onMouseDown={e => { e.preventDefault(); exec('justifyFull'); handleInput(); }}>≡</button>

        <span className={styles.sep} />

        {/* Lists */}
        <button type="button" className={styles.toolBtn} title="Bullet list"
          onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); handleInput(); }}>• —</button>
        <button type="button" className={styles.toolBtn} title="Numbered list"
          onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); handleInput(); }}>1.</button>

        <span className={styles.sep} />

        {/* Colors */}
        <ColorPicker label="A" title="Text Color" cmd="foreColor" onPick={(c) => { exec('foreColor', c); handleInput(); }} />
        <ColorPicker label="▭" title="Highlight" cmd="hiliteColor" onPick={(c) => { exec('hiliteColor', c); handleInput(); }} />

        <span className={styles.sep} />

        {/* Link */}
        <button type="button" className={styles.toolBtn} title="Insert Link"
          onMouseDown={e => {
            e.preventDefault();
            const url = prompt('Enter URL:', 'https://');
            if (url) exec('createLink', url);
            handleInput();
          }}>🔗</button>

        {/* Clear format */}
        <button type="button" className={styles.toolBtn} title="Clear Formatting"
          onMouseDown={e => { e.preventDefault(); exec('removeFormat'); handleInput(); }}>✕A</button>
      </div>

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
      />
    </div>
  );
}

function ColorPicker({ label, title, onPick }) {
  const inputRef = useRef(null);
  const hexRef = useRef(null);

  const apply = (val) => {
    const hex = val.startsWith('#') ? val : `#${val}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) onPick(hex);
  };

  return (
    <div className={styles.colorGroup} title={title}>
      <span className={styles.colorLabel}>{label}</span>
      <input
        ref={inputRef}
        type="color"
        className={styles.colorSwatch}
        defaultValue="#22d3ee"
        onChange={e => {
          if (hexRef.current) hexRef.current.value = e.target.value.replace('#', '');
          apply(e.target.value);
        }}
      />
      <span className={styles.hexPrefix}>#</span>
      <input
        ref={hexRef}
        type="text"
        className={styles.hexInput}
        maxLength={6}
        placeholder="22d3ee"
        onBlur={e => {
          apply(`#${e.target.value}`);
          if (inputRef.current) inputRef.current.value = `#${e.target.value}`;
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            apply(`#${e.target.value}`);
            if (inputRef.current) inputRef.current.value = `#${e.target.value}`;
          }
        }}
      />
    </div>
  );
}

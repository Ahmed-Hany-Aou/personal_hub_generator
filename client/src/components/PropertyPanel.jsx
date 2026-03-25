import { useState } from 'react';
import styles from './PropertyPanel.module.css';
import RichTextEditor from './RichTextEditor.jsx';

const FIELD_LABELS = {
  userName: 'Full Name',
  userTitle: 'Job Title',
  companyName: 'Company',
  userEmail: 'Email',
  userPhone: 'Phone',
  githubHandle: 'GitHub Username',
  linkedinHandle: 'LinkedIn Username',
  xHandle: 'X / Twitter Username',
  instagramHandle: 'Instagram Username',
  facebookHandle: 'Facebook Username',
  snapchatHandle: 'Snapchat Username',
  threadsHandle: 'Threads Username',
  youtubeHandle: 'YouTube URL/Channel',
  profileUrl: 'Profile URL',
  avatarInitials: 'Custom Avatar Initials',
  companyLogo: 'Company Logo URL',
  userAvatar: 'Profile Picture URL',
};

const FIELD_ICONS = {
  userName: '👤',
  userTitle: '💼',
  companyName: '🏢',
  userEmail: '✉',
  userPhone: '☎',
  githubHandle: '⌥',
  linkedinHandle: '🔗',
  xHandle: '𝕏',
  instagramHandle: '📸',
  facebookHandle: '📘',
  snapchatHandle: '👻',
  threadsHandle: '🧵',
  youtubeHandle: '▶️',
  profileUrl: '🌐',
  avatarInitials: '🔤',
  companyLogo: '🖼️',
  userAvatar: '🙎',
};

/** Small hex + color-picker pair used in theme section */
function HexColorField({ label, value, onChange }) {
  const safe = value && /^#[0-9a-fA-F]{3,6}$/.test(value) ? value : '#ffffff';
  const [hex, setHex] = useState(safe.replace('#', ''));

  const tryApply = (raw) => {
    const cleaned = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setHex(cleaned);
    if (cleaned.length === 6) onChange(`#${cleaned}`);
  };

  return (
    <div className={styles.hexField}>
      <span className={styles.hexFieldLabel}>{label}</span>
      <input
        type="color"
        className={styles.colorSwatch}
        value={safe}
        onChange={e => { onChange(e.target.value); setHex(e.target.value.replace('#', '')); }}
      />
      <span className={styles.hashSign}>#</span>
      <input
        type="text"
        className={styles.hexCode}
        value={hex}
        maxLength={6}
        placeholder="ffffff"
        onChange={e => tryApply(e.target.value)}
        onBlur={e => tryApply(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && tryApply(e.target.value)}
      />
    </div>
  );
}

export default function PropertyPanel({
  template,
  values,
  onChange,
  cardFormat,
  onFormatChange,
  customDims,
  onCustomDimsChange,
  isFreeform,
  onToggleFreeform,
  themeOverrides,
  onThemeOverride,
}) {
  const { required = [], optional = [] } = template.placeholders;
  const [activeSection, setActiveSection] = useState('content');

  const sections = [
    { id: 'content', label: '✏ Content' },
    { id: 'bio',     label: '📝 Bio' },
    { id: 'theme',   label: '🎨 Theme' },
    { id: 'format',  label: '📐 Format' },
  ];

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}><span className={styles.accent}>Creative</span> Studio</span>
        <span className={styles.panelSub}>Edit your digital card</span>
      </div>

      {/* Section tabs */}
      <div className={styles.sectionTabs}>
        {sections.map(s => (
          <button
            key={s.id}
            className={`${styles.sectionTab} ${activeSection === s.id ? styles.sectionTabActive : ''}`}
            onClick={() => setActiveSection(s.id)}
          >{s.label}</button>
        ))}
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      {activeSection === 'content' && (
        <div className={styles.fields}>
          <div className={styles.groupLabel}>Required</div>
          {required.map(key => (
            <Field key={key} fieldKey={key} value={values[key] || ''} onChange={onChange} required />
          ))}
          {optional.length > 0 && (
            <>
              <div className={styles.groupLabel} style={{ marginTop: 16 }}>Optional</div>
              {optional.map(key => (
                <Field key={key} fieldKey={key} value={values[key] || ''} onChange={onChange} />
              ))}
            </>
          )}

          {/* Freeform toggle here too */}
          <div style={{ marginTop: 12 }}>
            <button
              className={`${styles.modeBtn} ${isFreeform ? styles.modeBtnActive : ''}`}
              onClick={onToggleFreeform}
            >
              {isFreeform ? '🚀 Freeform (drag elements)' : '📦 Structured Layout'}
            </button>
          </div>
        </div>
      )}

      {/* ── BIO / RICH TEXT ───────────────────────────────────────────── */}
      {activeSection === 'bio' && (
        <div className={styles.fields}>
          <div className={styles.groupLabel}>Bio / Description</div>
          <p className={styles.hint}>
            Shown on the Landing Page below your name. Supports rich formatting — bold, italic, colors, links, and more.
          </p>
          <RichTextEditor
            value={values.userBio || ''}
            onChange={html => onChange('userBio', html)}
            placeholder="Write a short bio, tagline, or description…"
          />
        </div>
      )}

      {/* ── THEME COLORS ─────────────────────────────────────────────── */}
      {activeSection === 'theme' && (
        <div className={styles.fields}>
          <div className={styles.groupLabel}>Color Palette</div>
          <p className={styles.hint}>Type a hex code like <code>#22d3ee</code> or use the color picker.</p>

          {[
            { key: 'bg',            label: 'Background' },
            { key: 'accent',        label: 'Accent' },
            { key: 'textPrimary',   label: 'Primary Text' },
            { key: 'textSecondary', label: 'Secondary Text' },
            { key: 'cardBg',        label: 'Card BG' },
          ].map(({ key, label }) => {
            const currentVal = (themeOverrides?.[key] ?? template.theme[key]) || '#ffffff';
            return (
              <div key={key} className={styles.field}>
                <label className={styles.label}>{label}</label>
                <HexColorField
                  label=""
                  value={currentVal}
                  onChange={v => onThemeOverride(key, v)}
                />
              </div>
            );
          })}

          <button
            className={styles.resetBtn}
            onClick={() => onThemeOverride(null, null)}
          >↺ Reset to template defaults</button>
        </div>
      )}

      {/* ── FORMAT ───────────────────────────────────────────────────── */}
      {activeSection === 'format' && (
        <div className={styles.fields}>
          <div className={styles.groupLabel}>Card Size</div>
          <div className={styles.formatButtons}>
            {[
              { id: 'standard', label: '3.5×2"',   icon: '🇺🇸' },
              { id: 'm90x50',   label: '90×50mm',  icon: '📏' },
              { id: 'uk',       label: 'UK/EU',    icon: '🇬🇧' },
              { id: 'japan',    label: 'Japan',    icon: '🇯🇵' },
              { id: 'credit',   label: 'Credit',   icon: '💳' },
              { id: 'vertical', label: 'Vertical', icon: '📱' },
              { id: 'square',   label: 'Square',   icon: '⬛' },
              { id: 'custom',   label: 'Custom',   icon: '🛠️' },
            ].map(f => (
              <button
                key={f.id}
                className={`${styles.formatBtn} ${cardFormat === f.id ? styles.formatBtnActive : ''}`}
                onClick={() => onFormatChange(f.id)}
                title={f.label}
              >
                <span className={styles.formatBtnIcon}>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {cardFormat === 'custom' && (
            <div className={styles.customInputs}>
              <div className={styles.field}>
                <label className={styles.label}>Width (mm)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={customDims.width}
                  onChange={e => onCustomDimsChange(p => ({ ...p, width: Number(e.target.value) }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Height (mm)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={customDims.height}
                  onChange={e => onCustomDimsChange(p => ({ ...p, height: Number(e.target.value) }))}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.themeBadge}>
        <div className={styles.themeSwatches}>
          {['bg','accent','textPrimary'].map(k => (
            <span
              key={k}
              className={styles.swatch}
              style={{ background: themeOverrides?.[k] ?? template.theme[k] }}
              title={k}
            />
          ))}
        </div>
        <span className={styles.themeLabel}>Theme: {template.name}</span>
      </div>
    </aside>
  );
}

function Field({ fieldKey, value, onChange, required }) {
  const isImageField = fieldKey === 'userAvatar' || fieldKey === 'companyLogo';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange(fieldKey, reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>{FIELD_ICONS[fieldKey] || '·'}</span>
        {FIELD_LABELS[fieldKey] || fieldKey}
        {required && <span className={styles.req}>*</span>}
      </label>
      <div className={styles.inputGroup}>
        <input
          className={styles.input}
          type={fieldKey === 'userEmail' ? 'email' : fieldKey === 'profileUrl' ? 'url' : 'text'}
          value={value}
          placeholder={FIELD_LABELS[fieldKey]}
          onChange={e => onChange(fieldKey, e.target.value)}
        />
        {isImageField && (
          <>
            <label className={styles.uploadBtn}>
              Upload
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {value && (
              <button type="button" className={styles.clearBtn} onClick={() => onChange(fieldKey, '')} title="Clear">✕</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

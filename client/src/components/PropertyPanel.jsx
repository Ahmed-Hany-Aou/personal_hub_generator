import { useState, useCallback } from 'react';
import styles from './PropertyPanel.module.css';
import RichTextEditor from './RichTextEditor.jsx';

const FIELD_LABELS = {
  userName: 'Full Name',
  userTitle: 'Job Title',
  companyName: 'Company',
  userEmail: 'Email',
  userPhone: 'Phone',
  whatsAppNumber: 'WhatsApp',
  cvUrl: 'CV URL (Google Drive/Dropbox)',
  githubHandle: 'GitHub',
  linkedinHandle: 'LinkedIn',
  xHandle: 'X / Twitter',
  instagramHandle: 'Instagram',
  facebookHandle: 'Facebook',
  snapchatHandle: 'Snapchat',
  threadsHandle: 'Threads',
  youtubeHandle: 'YouTube',
  profileUrl: 'Profile URL',
  avatarInitials: 'Avatar Initials',
  companyLogo: 'Company Logo',
  userAvatar: 'Profile Photo',
};

const FIELD_ICONS = {
  userName: '👤', userTitle: '💼', companyName: '🏢',
  userEmail: '✉', userPhone: '☎', whatsAppNumber: '💬', cvUrl: '📄',
  githubHandle: '⌥', linkedinHandle: '🔗', xHandle: '𝕏',
  instagramHandle: '📸', facebookHandle: '📘',
  snapchatHandle: '👻', threadsHandle: '🧵', youtubeHandle: '▶',
  profileUrl: '🌐', avatarInitials: '🔤', companyLogo: '🖼', userAvatar: '🙎',
};

const SOCIAL_KEYS = ['githubHandle','linkedinHandle','xHandle','instagramHandle','facebookHandle','youtubeHandle','snapchatHandle','threadsHandle'];

const FORMATS = [
  { id: 'standard', label: '3.5×2" US',  icon: '🇺🇸' },
  { id: 'm90x50',   label: '90×50 mm',   icon: '📏' },
  { id: 'uk',       label: 'UK / EU',    icon: '🇬🇧' },
  { id: 'japan',    label: 'Japan',      icon: '🇯🇵' },
  { id: 'credit',   label: 'Credit',     icon: '💳' },
  { id: 'vertical', label: 'Vertical',   icon: '📱' },
  { id: 'square',   label: 'Square',     icon: '⬛' },
  { id: 'custom',   label: 'Custom',     icon: '🛠' },
];

/** Hex + color-picker combo */
function HexPicker({ value, onChange }) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#ffffff';
  const [txt, setTxt] = useState(safe.slice(1));

  const tryApply = (raw) => {
    const c = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setTxt(c);
    if (c.length === 6) onChange(`#${c}`);
  };

  return (
    <div className={styles.hexPicker}>
      <input type="color" className={styles.swatch}
        value={safe}
        onChange={e => { onChange(e.target.value); setTxt(e.target.value.slice(1)); }}
      />
      <span className={styles.hash}>#</span>
      <input type="text" className={styles.hexInput}
        value={txt} maxLength={6} placeholder="22d3ee"
        onChange={e => tryApply(e.target.value)}
        onBlur={e => tryApply(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && tryApply(e.target.value)}
      />
    </div>
  );
}

/** Accordion section */
function Section({ id, icon, title, badge, open, onToggle, children }) {
  return (
    <div className={styles.section}>
      <button className={`${styles.sectionHeader} ${open ? styles.sectionHeaderOpen : ''}`} onClick={() => onToggle(id)}>
        <span className={styles.sectionIcon}>{icon}</span>
        <span className={styles.sectionTitle}>{title}</span>
        {badge > 0 && <span className={styles.badge}>{badge}</span>}
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>›</span>
      </button>
      {open && (
        <div className={styles.sectionBody}>
          {children}
        </div>
      )}
    </div>
  );
}

/** Standard text/email/url input */
function Field({ fieldKey, value, onChange, required, placeholder }) {
  const isImageField = fieldKey === 'userAvatar' || fieldKey === 'companyLogo';

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(fieldKey, reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>{FIELD_ICONS[fieldKey] || '·'}</span>
        {FIELD_LABELS[fieldKey] || fieldKey}
        {required && <span className={styles.req}>*</span>}
      </label>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type={fieldKey === 'userEmail' ? 'email' : fieldKey === 'profileUrl' ? 'url' : 'text'}
          value={value}
          placeholder={placeholder || FIELD_LABELS[fieldKey]}
          onChange={e => onChange(fieldKey, e.target.value)}
        />
        {isImageField && (
          <>
            <label className={styles.uploadBtn} title="Upload file">
              ↑
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </label>
            {value && (
              <button type="button" className={styles.clearBtn} onClick={() => onChange(fieldKey, '')} title="Remove">✕</button>
            )}
          </>
        )}
      </div>
      {isImageField && value && (
        <div className={styles.imagePreview}>
          <img src={value} alt={FIELD_LABELS[fieldKey]} />
        </div>
      )}
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
  open = true,
  showGrid = true,
  onToggleGrid,
}) {
  const { required = [], optional = [] } = template.placeholders;
  const [sections, setSections] = useState({ identity: true, social: false, bio: false, media: false, theme: false, format: false });

  const toggle = useCallback((id) => {
    setSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const mediaKeys  = optional.filter(k => ['userAvatar','companyLogo','avatarInitials'].includes(k));
  const socialKeys = optional.filter(k => SOCIAL_KEYS.includes(k));
  const otherKeys  = optional.filter(k => !mediaKeys.includes(k) && !socialKeys.includes(k) && k !== 'userBio');
  const socialFilled = socialKeys.filter(k => values[k]).length;
  const hasBio = !!values.userBio;

  return (
    <aside className={`${styles.panel} ${!open ? styles.panelHidden : ''}`}>
      {/* Brand header */}
      <div className={styles.panelHead}>
        <span className={styles.brandName}><span className={styles.brandAccent}>Creative</span> Studio</span>
        <span className={styles.brandSub}>Digital identity editor</span>
      </div>

      {/* Scrollable content */}
      <div className={styles.scroll}>

        {/* ── Identity ──────────────────────────────────────────────── */}
        <Section id="identity" icon="👤" title="Your Identity" open={sections.identity} onToggle={toggle}>
          {required.map(k => (
            <Field key={k} fieldKey={k} value={values[k] || ''} onChange={onChange} required />
          ))}

          {/* Ensure common fields are grouped logically */}
          {['companyName', 'userPhone', 'whatsAppNumber', 'cvUrl'].map(k => (
            (optional.includes(k) || required.includes(k)) && (
              <Field key={k} fieldKey={k} value={values[k] || ''} onChange={onChange} required={required.includes(k)} />
            )
          ))}

          {otherKeys.filter(k => !['companyName', 'userPhone', 'whatsAppNumber', 'cvUrl'].includes(k)).map(k => (
            <Field key={k} fieldKey={k} value={values[k] || ''} onChange={onChange} />
          ))}

          {/* Profile URL gets extra help text */}
          {required.includes('profileUrl') === false && otherKeys.includes('profileUrl') === false && optional.includes('profileUrl') && (
            <Field fieldKey="profileUrl" value={values.profileUrl || ''} onChange={onChange} placeholder="https://yourwebsite.com" />
          )}
        </Section>

        {/* ── Media ─────────────────────────────────────────────────── */}
        {mediaKeys.length > 0 && (
          <Section id="media" icon="🖼" title="Photos & Logo" badge={mediaKeys.filter(k => values[k]).length} open={sections.media} onToggle={toggle}>
            {mediaKeys.map(k => (
              <Field key={k} fieldKey={k} value={values[k] || ''} onChange={onChange} />
            ))}
          </Section>
        )}

        {/* ── Social ─────────────────────────────────────────────────── */}
        {socialKeys.length > 0 && (
          <Section id="social" icon="🔗" title="Social Links" badge={socialFilled} open={sections.social} onToggle={toggle}>
            <p className={styles.hint}>Enter your username only (without @)</p>
            {socialKeys.map(k => (
              <Field key={k} fieldKey={k} value={values[k] || ''} onChange={onChange} />
            ))}
          </Section>
        )}

        {/* ── Bio ────────────────────────────────────────────────────── */}
        <Section id="bio" icon="📝" title="Bio / Description" badge={hasBio ? 1 : 0} open={sections.bio} onToggle={toggle}>
          <p className={styles.hint}>Shown on the landing page. Supports bold, italic, links, colors and more.</p>
          <RichTextEditor
            value={values.userBio || ''}
            onChange={html => onChange('userBio', html)}
            placeholder="Tell people about yourself…"
          />
        </Section>

        {/* ── Theme ─────────────────────────────────────────────────── */}
        <Section id="theme" icon="🎨" title="Colors & Theme" open={sections.theme} onToggle={toggle}>
          {[
            { key: 'bg',            label: 'Background' },
            { key: 'accent',        label: 'Accent' },
            { key: 'textPrimary',   label: 'Primary Text' },
            { key: 'textSecondary', label: 'Secondary Text' },
          ].map(({ key, label }) => (
            <div key={key} className={styles.themeRow}>
              <span className={styles.themeRowLabel}>{label}</span>
              <HexPicker
                value={themeOverrides?.[key] ?? template.theme[key] ?? '#ffffff'}
                onChange={v => onThemeOverride(key, v)}
              />
            </div>
          ))}
          <button className={styles.resetBtn} onClick={() => onThemeOverride(null, null)}>
            ↺ Reset to template defaults
          </button>
          
          <div className={styles.divider} />
          
          <div className={styles.themeRow}>
            <span className={styles.themeRowLabel}>Show Canvas Grid</span>
            <label className={styles.switch}>
              <input type="checkbox" checked={showGrid} onChange={e => onToggleGrid(e.target.checked)} />
              <span className={styles.slider} />
            </label>
          </div>
        </Section>

        {/* ── Format & Layout ────────────────────────────────────────── */}
        <Section id="format" icon="📐" title="Card Size & Layout" open={sections.format} onToggle={toggle}>
          <div className={styles.formatGrid}>
            {FORMATS.map(f => (
              <button
                key={f.id}
                className={`${styles.fmtBtn} ${cardFormat === f.id ? styles.fmtBtnActive : ''}`}
                onClick={() => onFormatChange(f.id)}
                title={f.label}
              >
                <span>{f.icon}</span>
                <span className={styles.fmtLabel}>{f.label}</span>
              </button>
            ))}
          </div>

          {cardFormat === 'custom' && (
            <div className={styles.customDims}>
              <div className={styles.field}>
                <label className={styles.label}>Width (mm)</label>
                <input type="number" className={styles.input} value={customDims.width}
                  onChange={e => onCustomDimsChange(p => ({ ...p, width: +e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Height (mm)</label>
                <input type="number" className={styles.input} value={customDims.height}
                  onChange={e => onCustomDimsChange(p => ({ ...p, height: +e.target.value }))} />
              </div>
            </div>
          )}

          <div className={styles.divider} />

          <button
            className={`${styles.modeBtn} ${isFreeform ? styles.modeBtnActive : ''}`}
            onClick={onToggleFreeform}
          >
            <span className={styles.modeBtnIcon}>{isFreeform ? '🚀' : '📦'}</span>
            <div className={styles.modeBtnText}>
              <span>{isFreeform ? 'Freeform Mode' : 'Structured Layout'}</span>
              <span className={styles.modeBtnSub}>{isFreeform ? 'Drag elements anywhere' : 'Auto-arranged layout'}</span>
            </div>
          </button>
        </Section>

      </div>

      {/* Footer swatches */}
      <div className={styles.footer}>
        <div className={styles.swatches}>
          {['bg','accent','textPrimary'].map(k => (
            <span key={k} className={styles.swatch}
              style={{ background: themeOverrides?.[k] ?? template.theme[k] }}
              title={k} />
          ))}
        </div>
        <span className={styles.footerLabel}>{template.name}</span>
      </div>
    </aside>
  );
}

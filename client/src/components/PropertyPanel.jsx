import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PropertyPanel.module.css';
import RichTextEditor from './RichTextEditor.jsx';
import StyleToolbar from './StyleToolbar.jsx';
import IconPicker from './IconPicker.jsx';
import { getIconPath } from '../lib/iconLibrary.js';

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

const SOCIAL_KEYS = ['githubHandle', 'linkedinHandle', 'xHandle', 'instagramHandle', 'facebookHandle', 'youtubeHandle', 'snapchatHandle', 'threadsHandle'];

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, color: 'var(--accent)' }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const FORMATS = [
  { id: 'standard', label: '3.5×2" US', icon: '🇺🇸' },
  { id: 'm90x50', label: '90×50 mm', icon: '📏' },
  { id: 'uk', label: 'UK / EU', icon: '🇬🇧' },
  { id: 'japan', label: 'Japan', icon: '🇯🇵' },
  { id: 'credit', label: 'Credit', icon: '💳' },
  { id: 'vertical', label: 'Vertical', icon: '📱' },
  { id: 'square', label: 'Square', icon: '⬛' },
  { id: 'custom', label: 'Custom', icon: '🛠' },
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
  isStyleLocked,
  selectedStyleId,
  open = true,
  onPanelHeaderClick,
  showGrid = true,
  onToggleGrid,
  onTemplateChange,
  onResetToInitial,
  onResetIdentity,
  onResetSocial,
  onResetBio,
  onResetFormat,
  onInstall,
  canInstall,
  isInstalled,
  onFullTemplateSelect,
  selectedNodeId,
  nodeStyles,
  onStyleChange,
  activeThemeBg,
  onActiveThemeBgChange,
  onAddCustomIcon,
  onRemoveCustomIcon,
  customIcons,
  accentColor,
  onAddCustomImage,
  onRemoveCustomImage,
  customImages,
}) {
  const navigate = useNavigate();
  const rawReq = template.placeholders?.required || [];
  const rawOpt = template.placeholders?.optional || [];
  const required = rawReq.length > 0 ? rawReq : ['userName', 'userTitle', 'userEmail'];
  const optional = rawOpt.length > 0 ? rawOpt : ['userPhone', 'companyName', 'userAvatar', 'companyLogo', 'avatarInitials', 'githubHandle', 'linkedinHandle', 'xHandle', 'instagramHandle', 'facebookHandle', 'snapchatHandle', 'threadsHandle', 'youtubeHandle', 'profileUrl', 'whatsAppNumber', 'cvUrl'];
  const [sections, setSections] = useState({ pwa: true, templates: true, styles: true, identity: true, social: false, bio: false, media: false, theme: false, format: false, editorOptions: true, icons: false });
  const [showIconPicker, setShowIconPicker] = useState(false);

  const toggle = useCallback((id) => {
    setSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Auto-expand Element Style section when a node is selected
  useEffect(() => {
    if (selectedNodeId) {
      setSections(prev => ({ ...prev, editorOptions: true }));
    }
  }, [selectedNodeId]);
  const handleExploreMore = () => {
    // We navigate home, where selecting any template will perform a full load
    navigate('/');
  };

  const mediaKeys = optional.filter(k => ['userAvatar', 'companyLogo', 'avatarInitials'].includes(k));
  const socialKeys = optional.filter(k => SOCIAL_KEYS.includes(k));
  const otherKeys = optional.filter(k => !mediaKeys.includes(k) && !socialKeys.includes(k) && k !== 'userBio');
  const socialFilled = socialKeys.filter(k => values[k]).length;
  const hasBio = !!values.userBio;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  return (
    <aside className={`${styles.panel} ${!open ? styles.panelHidden : ''}`}>
      {/* Brand header — tap on mobile to toggle panel open/close */}
      <div className={styles.panelHead} onClick={onPanelHeaderClick}>
        <div className={styles.dragHandle} />
        <span className={styles.brandName}><span className={styles.brandAccent}>Creative</span> Studio</span>
        <span className={styles.brandSub}>Digital identity editor</span>
      </div>

      {/* Scrollable content */}
      <div className={styles.scroll}>

        {/* ── Templates (Layouts) ────────────────────────────────────── */}
        <Section id="templates" icon="📐" title="Change Layout" open={sections.templates} onToggle={toggle}>
          <div className={styles.galleryGrid}>
            {[
              { id: 'template-neon-futurism', name: 'Strike', icon: '⚡' },
              { id: 'template-solaris-glass', name: 'Sidebar', icon: '💎' },
              { id: 'template-midnight-gold', name: 'Center', icon: '🌑' },
              { id: 'template-minimal-light', name: 'Wide', icon: '⬜' },
              { id: 'template-prism-split', name: 'Split', icon: '💠' },
              { id: 'template-horizon-split', name: 'Horizon', icon: '〰️' },
              { id: 'template-artist-vibrant', name: 'Stack', icon: '🎨' },
              { id: 'template-circuit-dark', name: 'Blueprint', icon: '💾' },
              { id: 'template-gemini-dark', name: 'Float', icon: '♊' },
              { id: 'bento', name: 'Bento Grid', icon: '🧩' },
              { id: 'radial', name: 'Radial', icon: '🎯' },
            ].map(t => (
              <button
                key={t.id}
                className={`${styles.galleryBtn} ${template.id === t.id ? styles.galleryBtnActive : ''}`}
                onClick={() => onTemplateChange(t.id)}
              >
                <span className={styles.galleryBtnIcon}>{t.icon}</span>
                <span className={styles.galleryBtnLabel}>{t.name}</span>
              </button>
            ))}
          </div>
          <button className={styles.moreTemplates} onClick={() => navigate('/')}>
            Explore more layouts →
          </button>

          <div className={styles.divider} />
          <button className={styles.resetBtn} onClick={onResetToInitial}>
            ↺ Reset Layout to Original
          </button>
        </Section>

        {/* ── Styles (Visual Presets) ───────────────────────────────── */}
        <Section id="styles" icon="🎭" title="Visual Style" open={sections.styles} onToggle={toggle}>
          <p className={styles.hint}>Apply a mood without changing your layout</p>
          <div className={styles.galleryGrid}>
            {[
              { id: 'solaris', name: 'Solaris', icon: '💎', theme: { bg: '#0f172a', cardBg: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', accent: '#22d3ee', textPrimary: '#f8fafc', textSecondary: '#94a3b8', glassBackground: 'rgba(255, 255, 255, 0.05)', glassBorder: 'rgba(255, 255, 255, 0.1)', accentBar: true } },
              { id: 'neon', name: 'Neon', icon: '⚡', theme: { bg: '#060d14', cardBg: 'linear-gradient(135deg, #bc13fe 0%, #7e0fff 100%)', accent: '#00f3ff', textPrimary: '#ffffff', textSecondary: '#a5b4fc', glassBackground: 'rgba(6, 13, 20, 0.6)', glassBorder: 'rgba(0, 243, 255, 0.4)', glow: '0 0 15px rgba(0, 243, 255, 0.6)' } },
              { id: 'noir', name: 'Noir', icon: '🌑', theme: { bg: '#0a0a0a', cardBg: '#0a0a0a', accent: '#ffffff', textPrimary: '#ffffff', textSecondary: '#888888', glassBackground: 'rgba(255,255,255,0.02)', glassBorder: 'rgba(255,255,255,0.05)' } },
              { id: 'emerald', name: 'Emerald', icon: '🌿', theme: { bg: '#062016', cardBg: '#062016', accent: '#10b981', textPrimary: '#ecfdf5', textSecondary: '#6ee7b7' } },
              { id: 'midnight', name: 'Midnight', icon: '🌙', theme: { bg: '#0a0f1a', cardBg: 'linear-gradient(145deg, #0a0f1a 0%, #0d1425 100%)', accent: '#00f0ff', textPrimary: '#ffffff', textSecondary: '#b0c4de' } },
              { id: 'sunset', name: 'Sunset', icon: '🌅', theme: { bg: '#1a0b14', cardBg: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)', accent: '#ffb347', textPrimary: '#ffffff', textSecondary: '#ffe0cc' } },
            ].map(s => (
              <button
                key={s.id}
                title={selectedStyleId === s.id && isStyleLocked ? "Style locked – layout changes won't affect colors." : `Apply ${s.name} mood`}
                className={`${styles.galleryBtn} ${(selectedStyleId === s.id) ||
                    (!isStyleLocked && (
                      template.id.includes(s.id) ||
                      (s.id === 'noir' && template.id.includes('midnight')) ||
                      (s.id === 'solaris' && template.id.includes('glass'))
                    )) ? styles.galleryBtnActive : ''
                  } ${selectedStyleId === s.id && isStyleLocked ? styles.galleryBtnLocked : ''}`}
                onClick={() => {
                  onThemeOverride(s.theme, s.id);
                }}
              >
                <span className={styles.galleryBtnIcon}>{s.icon}</span>
                <span className={styles.galleryBtnLabel}>
                  {s.name}
                  {selectedStyleId === s.id && isStyleLocked && <LockIcon />}
                </span>
              </button>
            ))}
          </div>
          <button
            className={styles.resetBtn}
            onClick={() => onThemeOverride(null, null)}
            title="Unlock style and return to layout default colors"
          >
            {isStyleLocked ? '🔓 Unlock & Reset Style' : '↺ Reset to Template Default'}
          </button>
        </Section>

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

          <div className={styles.divider} />
          <button className={styles.resetBtn} onClick={onResetIdentity}>
            ↺ Reset Identity Data
          </button>
        </Section>

        {/* ── Media ─────────────────────────────────────────────────── */}
        {mediaKeys.length > 0 && (
          <Section id="media" icon="🖼" title="Photos & Logo" badge={mediaKeys.filter(k => values[k]).length} open={sections.media} onToggle={toggle}>
            {mediaKeys.map(k => (
              <Field key={k} fieldKey={k} value={values[k] || ''} onChange={onChange} />
            ))}
            <div className={styles.divider} />
            <button className={styles.resetBtn} onClick={() => {
              mediaKeys.forEach(k => onChange(k, ''));
            }}>
              ↺ Reset Photos
            </button>
          </Section>
        )}

        {/* ── Social ─────────────────────────────────────────────────── */}
        {socialKeys.length > 0 && (
          <Section id="social" icon="🔗" title="Social Links" badge={socialFilled} open={sections.social} onToggle={toggle}>
            <p className={styles.hint}>Enter your username only (without @)</p>
            {socialKeys.map(k => (
              <Field key={k} fieldKey={k} value={values[k] || ''} onChange={onChange} />
            ))}
            <div className={styles.divider} />
            <button className={styles.resetBtn} onClick={onResetSocial}>
              ↺ Reset Social Links
            </button>
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
          <div className={styles.divider} />
          <button className={styles.resetBtn} onClick={onResetBio}>
            ↺ Reset Bio
          </button>
        </Section>

        {/* ── Theme ─────────────────────────────────────────────────── */}
        <Section id="theme" icon="🎨" title="Colors & Theme" open={sections.theme} onToggle={toggle}>
          {[
            { key: 'bg', label: 'Workspace' },
            { key: 'cardBg', label: 'Card Color' },
            { key: 'accent', label: 'Accent' },
            { key: 'textPrimary', label: 'Primary Text' },
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

          <div className={styles.divider} />
          <button className={styles.resetBtn} onClick={onResetFormat}>
            ↺ Reset Size & Alignment
          </button>
        </Section>

        {/* ── Icons & Decorations ───────────────────────────────────── */}
        <Section
          id="icons"
          icon="✦"
          title="Icons & Decorations"
          badge={customIcons?.length || 0}
          open={sections.icons}
          onToggle={toggle}
        >
          <p className={styles.hint}>Place decorative icons anywhere on the card. They can always be dragged freely.</p>
          <button
            className={styles.addIconBtn}
            onClick={() => setShowIconPicker(true)}
          >
            + Add Icon
          </button>
          {customIcons && customIcons.length > 0 && (
            <div className={styles.iconList}>
              {customIcons.map(ci => {
                const iconPath = getIconPath(ci.iconKey);
                const segs = iconPath ? iconPath.split(' M ') : [];
                return (
                  <div key={ci.id} className={styles.iconListItem}>
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke={ci.color || accentColor || '#22d3ee'}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      {segs.map((seg, i) => (
                        <path key={i} d={i === 0 ? seg : 'M ' + seg} />
                      ))}
                    </svg>
                    <span className={styles.iconListLabel}>{ci.iconKey}</span>
                    <button
                      className={styles.iconRemoveBtn}
                      onClick={() => onRemoveCustomIcon?.(ci.id)}
                      title="Remove icon"
                    >✕</button>
                  </div>
                );
              })}
            </div>
          )}
          {showIconPicker && (
            <IconPicker
              onAdd={({ iconKey, color, size }) => {
                onAddCustomIcon?.({ iconKey, color, size });
                setShowIconPicker(false);
              }}
              onClose={() => setShowIconPicker(false)}
              accentColor={accentColor}
            />
          )}

          <div className={styles.divider} />

          {/* Image / logo upload */}
          <p className={styles.hint} style={{ marginBottom: 8 }}>Upload an image or logo from your device and drag it anywhere.</p>
          <label className={styles.addIconBtn} style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
            ↑ Upload Image / Logo
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => onAddCustomImage?.({ src: reader.result, name: file.name });
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
          </label>

          {customImages && customImages.length > 0 && (
            <div className={styles.iconList} style={{ marginTop: 10 }}>
              {customImages.map(img => (
                <div key={img.id} className={styles.iconListItem}>
                  <img
                    src={img.src}
                    alt={img.name || 'uploaded'}
                    style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 3, flexShrink: 0 }}
                  />
                  <span className={styles.iconListLabel}>{img.name || 'Image'}</span>
                  <button
                    className={styles.iconRemoveBtn}
                    onClick={() => onRemoveCustomImage?.(img.id)}
                    title="Remove image"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Editor Options ────────────────────────────────────────── */}
        <Section id="editorOptions" icon="✏️" title="Element Styles" open={sections.editorOptions} onToggle={toggle}>
          <StyleToolbar
            nodeId={selectedNodeId}
            nodeStyles={nodeStyles}
            onStyleChange={onStyleChange}
            bgColor={activeThemeBg}
            onBgChange={onActiveThemeBgChange}
          />
        </Section>

      </div>

      {/* Footer swatches */}
      <div className={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className={styles.swatches}>
            {['bg', 'accent', 'textPrimary'].map(k => (
              <span key={k} className={styles.swatch}
                style={{ background: themeOverrides?.[k] ?? template.theme[k] }}
                title={k} />
            ))}
          </div>
          <span className={styles.footerLabel}>{template.name}</span>
        </div>
        {/* ── Help / Info ────────────────────────────────────────── */}
        <div className={styles.panelFooter}>
          {!isStandalone && (
            <div className={styles.installBanner}>
              <div className={styles.installInfo}>
                <span className={styles.installIcon}>📲</span>
                <div>
                  <div className={styles.installTitle}>{isInstalled ? 'Creative Studio App' : 'Install Creative Studio'}</div>
                  <div className={styles.installSub}>{isInstalled ? 'Quick access from home screen' : 'Save as app on your device'}</div>
                </div>
              </div>
              <button 
                className={styles.installBtn} 
                onClick={isInstalled ? () => window.open(window.location.href, '_self') : onInstall}
              >
                {isInstalled ? 'Open' : 'Install'}
              </button>
            </div>
          )}
          <div className={styles.footerNote}>Creative Studio v1.2</div>
        </div>
      </div>
    </aside>
  );
}

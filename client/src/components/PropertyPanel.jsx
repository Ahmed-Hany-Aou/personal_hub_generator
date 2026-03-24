import styles from './PropertyPanel.module.css';

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

export default function PropertyPanel({ template, values, onChange }) {
  const { required = [], optional = [] } = template.placeholders;

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Properties</span>
        <span className={styles.panelSub}>Edit your card content</span>
      </div>

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
      </div>

      <div className={styles.themeBadge}>
        <div className={styles.themeSwatches}>
          <span style={{ background: template.theme.bg }} className={styles.swatch} title="Background" />
          <span style={{ background: template.theme.accent }} className={styles.swatch} title="Accent" />
          <span style={{ background: template.theme.textPrimary }} className={styles.swatch} title="Text" />
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
      reader.onloadend = () => {
        onChange(fieldKey, reader.result);
      };
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
              <button 
                type="button" 
                className={styles.clearBtn} 
                onClick={() => onChange(fieldKey, '')}
                title="Clear image"
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

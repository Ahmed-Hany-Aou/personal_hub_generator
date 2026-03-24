import styles from './LandingPreview.module.css';

export default function LandingPreview({ theme, values }) {
  const isGradient = (theme.bg).includes('gradient');

  return (
    <div
      className={styles.page}
      style={{
        background: isGradient ? theme.bg : theme.bg,
        backgroundColor: !isGradient ? theme.bg : undefined,
        '--accent': theme.accent,
        '--text-primary': theme.textPrimary,
        '--text-secondary': theme.textSecondary,
        '--glass-bg': theme.glassBackground,
        '--font-heading': theme.fontHeading,
        '--font-body': theme.fontBody,
      }}
    >
      <div className={styles.hero}>
        <div className={styles.avatar} style={{ borderColor: theme.accent }}>
          <span style={{ color: theme.accent, fontSize: '2rem' }}>
            {(values.userName || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className={styles.name} style={{ color: theme.textPrimary }}>{values.userName}</h1>
        <p className={styles.title} style={{ color: theme.textSecondary }}>{values.userTitle}</p>
        {values.companyName && (
          <span className={styles.company} style={{ color: theme.accent, borderColor: `${theme.accent}40` }}>
            {values.companyName}
          </span>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle} style={{ color: `${theme.accent}80` }}>CONTACT</div>
        {values.userEmail && (
          <a
            href={`mailto:${values.userEmail}`}
            className={styles.glassCard}
            style={{ background: theme.glassBackground, borderColor: `${theme.accent}20` }}
          >
            <span className={styles.glassIcon} style={{ color: theme.accent }}>✉</span>
            <div>
              <div className={styles.glassLabel} style={{ color: theme.textSecondary }}>Email</div>
              <div className={styles.glassValue} style={{ color: theme.textPrimary }}>{values.userEmail}</div>
            </div>
          </a>
        )}
        {values.userPhone && (
          <a
            href={`tel:${values.userPhone}`}
            className={styles.glassCard}
            style={{ background: theme.glassBackground, borderColor: `${theme.accent}20` }}
          >
            <span className={styles.glassIcon} style={{ color: theme.accent }}>☎</span>
            <div>
              <div className={styles.glassLabel} style={{ color: theme.textSecondary }}>Phone</div>
              <div className={styles.glassValue} style={{ color: theme.textPrimary }}>{values.userPhone}</div>
            </div>
          </a>
        )}
      </div>

      {(values.githubHandle || values.linkedinHandle) && (
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ color: `${theme.accent}80` }}>SOCIAL</div>
          <div className={styles.socialRow}>
            {values.githubHandle && (
              <a
                href={`https://github.com/${values.githubHandle}`}
                target="_blank"
                className={styles.socialBtn}
                style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}
              >
                <span style={{ color: theme.accent }}>⌥</span> GitHub
              </a>
            )}
            {values.linkedinHandle && (
              <a
                href={`https://linkedin.com/in/${values.linkedinHandle}`}
                target="_blank"
                className={styles.socialBtn}
                style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}
              >
                <span style={{ color: theme.accent }}>🔗</span> LinkedIn
              </a>
            )}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle} style={{ color: `${theme.accent}80` }}>CONNECT</div>
        <div
          className={styles.qrBlock}
          style={{ background: theme.glassBackground, borderColor: `${theme.accent}20` }}
        >
          <div className={styles.qrPlaceholder} style={{ borderColor: theme.accent, color: theme.accent }}>
            <div className={styles.qrMock} />
          </div>
          <div>
            <div className={styles.qrScan} style={{ color: theme.textPrimary }}>SCAN TO CONNECT</div>
            <div className={styles.qrUrl} style={{ color: theme.textSecondary }}>
              {values.profileUrl || 'yourpage.com'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.saveBtn} style={{ background: theme.accent }}>
        📞 Save Contact Info
      </div>
    </div>
  );
}

import styles from './CardCanvas.module.css';

export default function CardCanvas({ theme, values }) {
  const isGradient = (theme.cardBg || theme.bg).includes('gradient');

  return (
    <div className={styles.scaleWrapper}>
      <div
        id="card-export-target"
        className={styles.card}
        style={{
          background: isGradient ? theme.cardBg : theme.bg,
          backgroundColor: !isGradient ? theme.bg : undefined,
        }}
      >
        <div className={styles.grid} />
        <div className={styles.glow} />

        <div className={styles.body}>
          <div
            className={styles.name}
            style={{ color: theme.textPrimary, fontFamily: theme.fontHeading }}
          >
            {(values.userName || '').toUpperCase()}
          </div>

          <div
            className={styles.title}
            style={{ color: theme.textSecondary, fontFamily: theme.fontBody }}
          >
            {(values.userTitle || '').toUpperCase()}
          </div>

          {values.companyName && (
            <div
              className={styles.company}
              style={{ color: theme.accent, fontFamily: theme.fontHeading }}
            >
              {values.companyName}
            </div>
          )}

          <div
            className={styles.divider}
            style={{ background: `${theme.accent}40` }}
          />

          <div className={styles.contacts}>
            {values.userEmail && (
              <div className={styles.contactRow} style={{ color: theme.textSecondary }}>
                <span className={styles.icon} style={{ color: theme.accent }}>✉</span>
                <span style={{ fontFamily: theme.fontBody }}>{values.userEmail}</span>
              </div>
            )}
            {values.userPhone && (
              <div className={styles.contactRow} style={{ color: theme.textSecondary }}>
                <span className={styles.icon} style={{ color: theme.accent }}>☎</span>
                <span style={{ fontFamily: theme.fontBody }}>{values.userPhone}</span>
              </div>
            )}
            {values.githubHandle && (
              <div className={styles.contactRow} style={{ color: theme.textSecondary }}>
                <span className={styles.icon} style={{ color: theme.accent }}>⌥</span>
                <span style={{ fontFamily: theme.fontBody }}>github.com/{values.githubHandle}</span>
              </div>
            )}
            {values.linkedinHandle && (
              <div className={styles.contactRow} style={{ color: theme.textSecondary }}>
                <span className={styles.icon} style={{ color: theme.accent }}>🔗</span>
                <span style={{ fontFamily: theme.fontBody }}>in/{values.linkedinHandle}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.qrArea}>
          <div className={styles.qrBox} style={{ borderColor: `${theme.accent}80` }}>
            <div className={styles.qrInner} style={{ color: theme.accent }}>
              <div className={styles.qrLabel} style={{ color: `${theme.accent}90` }}>SCAN</div>
              <div className={styles.qrDots} />
            </div>
          </div>
          <div className={styles.qrCaption} style={{ color: `${theme.accent}70` }}>
            {values.profileUrl ? values.profileUrl.replace(/^https?:\/\//, '') : 'yourpage.com'}
          </div>
        </div>
      </div>
    </div>
  );
}

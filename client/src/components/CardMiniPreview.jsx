import styles from './CardMiniPreview.module.css';

export default function CardMiniPreview({ theme, defaults }) {
  const isDark = theme.bg.startsWith('#0') || theme.bg.startsWith('#1') || theme.bg.startsWith('linear');
  const bg = theme.cardBg || theme.bg;
  const isGradient = bg.includes('gradient') || bg.includes('linear');

  return (
    <div
      className={styles.preview}
      style={{
        background: isGradient ? bg : bg,
        backgroundColor: isGradient ? undefined : bg,
      }}
    >
      {!isGradient && (
        <div className={styles.grid} style={{ '--gc': theme.accent }} />
      )}
      <div className={styles.content}>
        <div className={styles.name} style={{ color: theme.textPrimary, fontFamily: theme.fontHeading }}>
          {defaults.userName}
        </div>
        <div className={styles.title} style={{ color: theme.textSecondary, fontFamily: theme.fontBody }}>
          {defaults.userTitle}
        </div>
        {defaults.companyName && (
          <div className={styles.company} style={{ color: theme.accent }}>
            {defaults.companyName}
          </div>
        )}
        <div className={styles.divider} style={{ background: theme.accent + '40' }} />
        <div className={styles.contact} style={{ color: theme.textSecondary }}>
          <span>✉ {defaults.userEmail}</span>
          <span>📞 {defaults.userPhone}</span>
        </div>
      </div>
      <div className={styles.qrPlaceholder} style={{ borderColor: theme.accent + '60', color: theme.accent + '80' }}>
        QR
      </div>
    </div>
  );
}

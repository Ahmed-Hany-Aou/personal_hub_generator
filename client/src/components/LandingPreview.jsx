import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import styles from './LandingPreview.module.css';

export default function LandingPreview({ theme, values }) {
  const isGradient = (theme.bg).includes('gradient');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const url = values.profileUrl || 'https://yourpage.com';
    QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: { dark: theme.accent, light: theme.glassBackground || theme.bg }
    }).then(setQrCodeUrl).catch(console.error);
  }, [values.profileUrl, theme.accent, theme.glassBackground, theme.bg]);

  const hasSocials = values.githubHandle || values.linkedinHandle || values.xHandle || values.facebookHandle || values.instagramHandle || values.snapchatHandle || values.youtubeHandle || values.threadsHandle;

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
          {values.userAvatar ? (
            <img src={values.userAvatar} alt="Profile" className={styles.avatarImg} />
          ) : values.companyLogo ? (
            <img src={values.companyLogo} alt="Logo" className={styles.logoImg} />
          ) : (
            <span style={{ color: theme.accent, fontSize: '2rem' }}>
              {values.avatarInitials ? values.avatarInitials.substring(0, 3).toUpperCase() : (values.userName || 'U').substring(0, 2).toUpperCase()}
            </span>
          )}
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

      {hasSocials && (
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ color: `${theme.accent}80` }}>SOCIAL</div>
          <div className={styles.socialRow}>
            {values.githubHandle && (
              <a href={`https://github.com/${values.githubHandle}`} target="_blank" rel="noreferrer" className={styles.socialBtn} style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}>
                <span style={{ color: theme.accent }}>⌥</span> GitHub
              </a>
            )}
            {values.linkedinHandle && (
              <a href={`https://linkedin.com/in/${values.linkedinHandle}`} target="_blank" rel="noreferrer" className={styles.socialBtn} style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}>
                <span style={{ color: theme.accent }}>🔗</span> LinkedIn
              </a>
            )}
            {values.xHandle && (
              <a href={`https://x.com/${values.xHandle}`} target="_blank" rel="noreferrer" className={styles.socialBtn} style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}>
                <span style={{ color: theme.accent }}>𝕏</span> X
              </a>
            )}
            {values.facebookHandle && (
              <a href={`https://facebook.com/${values.facebookHandle}`} target="_blank" rel="noreferrer" className={styles.socialBtn} style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}>
                <span style={{ color: theme.accent }}>📘</span> Facebook
              </a>
            )}
            {values.instagramHandle && (
              <a href={`https://instagram.com/${values.instagramHandle}`} target="_blank" rel="noreferrer" className={styles.socialBtn} style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}>
                <span style={{ color: theme.accent }}>📸</span> Instagram
              </a>
            )}
            {values.youtubeHandle && (
              <a href={`https://youtube.com/${values.youtubeHandle}`} target="_blank" rel="noreferrer" className={styles.socialBtn} style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}>
                <span style={{ color: theme.accent }}>▶️</span> YouTube
              </a>
            )}
            {values.snapchatHandle && (
              <a href={`https://snapchat.com/add/${values.snapchatHandle}`} target="_blank" rel="noreferrer" className={styles.socialBtn} style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}>
                <span style={{ color: theme.accent }}>👻</span> Snapchat
              </a>
            )}
            {values.threadsHandle && (
              <a href={`https://threads.net/@${values.threadsHandle}`} target="_blank" rel="noreferrer" className={styles.socialBtn} style={{ background: theme.glassBackground, borderColor: `${theme.accent}30`, color: theme.textPrimary }}>
                <span style={{ color: theme.accent }}>🧵</span> Threads
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
          <div className={styles.qrPlaceholder} style={{ borderColor: theme.accent, padding: qrCodeUrl ? 0 : 6 }}>
            {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" style={{width: '100%', height: '100%', borderRadius: '4px'}} /> : <div className={styles.qrMock} />}
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

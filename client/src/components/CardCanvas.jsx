import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import styles from './CardCanvas.module.css';

export default function CardCanvas({ theme, values }) {
  const isGradient = (theme.cardBg || theme.bg).includes('gradient');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const url = values.profileUrl || 'https://yourpage.com';
    QRCode.toDataURL(url, {
      width: 260,
      margin: 1,
      color: { dark: theme.accent, light: theme.bg }
    }).then(setQrCodeUrl).catch(console.error);
  }, [values.profileUrl, theme.accent, theme.bg]);

  return (
    <div className={styles.scaleWrapper}>
      <div
        id="card-export-target"
        className={styles.card}
        style={{
          background: isGradient ? theme.cardBg : theme.bg,
          backgroundColor: !isGradient ? theme.bg : undefined,
          '--accent': theme.accent,
          '--font-heading': theme.fontHeading || 'Poppins',
          '--font-body': theme.fontBody || 'Inter',
        }}
      >
        {theme.accentBar && <div className={styles.accentBar} style={{ background: theme.accent }} />}
        <div className={styles.grid} />
        <div className={styles.glow} />

        <div className={styles.body}>
          <div
            className={styles.name}
            style={{ color: theme.textPrimary, fontFamily: theme.fontHeading }}
          >
            {(values.userName || '').toUpperCase()}
          </div>
          {values.companyLogo && (
            <img src={values.companyLogo} alt="Logo" className={styles.cardLogo} />
          )}

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
          <div className={styles.qrBox} style={{ borderColor: `${theme.accent}80`, padding: qrCodeUrl ? 0 : 10, overflow: 'hidden' }}>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%', borderRadius: '10px' }} />
            ) : (
              <div className={styles.qrInner} style={{ color: theme.accent }}>
                <div className={styles.qrLabel} style={{ color: `${theme.accent}90` }}>SCAN</div>
                <div className={styles.qrDots} />
              </div>
            )}
          </div>
          <div className={styles.qrCaption} style={{ color: `${theme.accent}70` }}>
            {values.profileUrl ? values.profileUrl.replace(/^https?:\/\//, '') : 'yourpage.com'}
          </div>
        </div>
      </div>
    </div>
  );
}

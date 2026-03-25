import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import styles from './CardCanvas.module.css';
import DraggableNode from './DraggableNode.jsx';

export default function CardCanvas({ 
  theme, 
  values, 
  width, 
  height,
  isFreeform,
  layoutState,
  onLayoutChange,
  onSelectNode,
  canvasRef,
}) {
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

  const PREVIEW_WIDTH = 682.5;
  const PREVIEW_HEIGHT = 450; 
  const scale = Math.min(PREVIEW_WIDTH / width, PREVIEW_HEIGHT / height, 0.65);

  const getLayout = () => {
    if (isFreeform) return 'custom';
    const ratio = width / height;
    if (ratio >= 0.95 && ratio <= 1.05) return 'square';
    if (ratio < 1) return 'vertical';
    return 'horizontal';
  };

  // Common DraggableNode props
  const dn = (id) => ({
    id,
    isFreeform,
    layoutState,
    onLayoutChange,
    onSelect: onSelectNode,
    canvasRef,
  });

  return (
    <div className={styles.scaleWrapper} style={{ width: width * scale, height: height * scale }}>
      <div
        id="card-export-target"
        ref={canvasRef}
        className={styles.card}
        data-layout={getLayout()}
        style={{
          width: width,
          height: height,
          transform: `scale(${scale})`,
          background: isGradient ? theme.cardBg : theme.bg,
          backgroundColor: !isGradient ? theme.bg : undefined,
          '--accent': theme.accent,
          '--font-heading': theme.fontHeading || 'Poppins',
          '--font-body': theme.fontBody || 'Inter',
          position: 'relative',
        }}
      >
        {theme.accentBar && <div className={styles.accentBar} style={{ background: theme.accent }} />}
        <div className={styles.grid} />
        <div className={styles.glow} />

        <div className={styles.body}>
          <DraggableNode {...dn('userName')}>
            <div className={styles.name} style={{ color: theme.textPrimary, fontFamily: theme.fontHeading }}>
              {(values.userName || '').toUpperCase()}
            </div>
          </DraggableNode>

          <DraggableNode {...dn('userTitle')}>
            <div className={styles.title} style={{ color: theme.textSecondary, fontFamily: theme.fontBody }}>
              {(values.userTitle || '').toUpperCase()}
            </div>
          </DraggableNode>

          {values.companyName && (
            <DraggableNode {...dn('companyName')}>
              <div className={styles.company} style={{ color: theme.accent, fontFamily: theme.fontHeading }}>
                {values.companyName}
              </div>
            </DraggableNode>
          )}

          <DraggableNode {...dn('divider')}>
            <div className={styles.divider} style={{ background: theme.accent, opacity: 0.3 }} />
          </DraggableNode>

          <DraggableNode {...dn('contacts')}>
            <div className={styles.contacts}>
              {values.userEmail && (
                <div className={styles.contactRow}><span className={styles.icon}>✉️</span>{values.userEmail}</div>
              )}
              {values.userPhone && (
                <div className={styles.contactRow}><span className={styles.icon}>📞</span>{values.userPhone}</div>
              )}
              {values.githubHandle && (
                <div className={styles.contactRow}><span className={styles.icon}>⌥</span>github.com/{values.githubHandle}</div>
              )}
              {values.linkedinHandle && (
                <div className={styles.contactRow}><span className={styles.icon}>🔗</span>in/{values.linkedinHandle}</div>
              )}
              {values.xHandle && (
                <div className={styles.contactRow}><span className={styles.icon}>𝕏</span>@{values.xHandle}</div>
              )}
              {values.facebookHandle && (
                <div className={styles.contactRow}><span className={styles.icon}>📘</span>fb.com/{values.facebookHandle}</div>
              )}
              {values.instagramHandle && (
                <div className={styles.contactRow}><span className={styles.icon}>📸</span>@{values.instagramHandle}</div>
              )}
              {values.youtubeHandle && (
                <div className={styles.contactRow}><span className={styles.icon}>▶️</span>{values.youtubeHandle}</div>
              )}
              {values.snapchatHandle && (
                <div className={styles.contactRow}><span className={styles.icon}>👻</span>{values.snapchatHandle}</div>
              )}
              {values.threadsHandle && (
                <div className={styles.contactRow}><span className={styles.icon}>🧵</span>@{values.threadsHandle}</div>
              )}
            </div>
          </DraggableNode>
        </div>

        <DraggableNode {...dn('qrArea')}>
          <div className={styles.qrArea}>
            <div className={styles.qrBox} style={{ borderColor: theme.accent }}>
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%' }} />
              ) : (
                <div className={styles.qrInner} style={{ color: theme.accent }}>
                  <div className={styles.qrLabel}>SCAN</div>
                  <div className={styles.qrDots} />
                </div>
              )}
            </div>
            <div className={styles.qrCaption}>{values.profileUrl || 'your-hub.link'}</div>
          </div>
        </DraggableNode>
      </div>
    </div>
  );
}

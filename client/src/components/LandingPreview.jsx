import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import styles from './LandingPreview.module.css';
import DraggableNode from './DraggableNode.jsx';

const SOCIAL_MAP = [
  { key: 'githubHandle',    label: 'GitHub',    icon: '⌥', url: h => `https://github.com/${h}` },
  { key: 'linkedinHandle',  label: 'LinkedIn',  icon: '🔗', url: h => `https://linkedin.com/in/${h}` },
  { key: 'xHandle',         label: 'X',         icon: '𝕏', url: h => `https://x.com/${h}` },
  { key: 'instagramHandle', label: 'Instagram', icon: '📸', url: h => `https://instagram.com/${h}` },
  { key: 'facebookHandle',  label: 'Facebook',  icon: '📘', url: h => `https://facebook.com/${h}` },
  { key: 'youtubeHandle',   label: 'YouTube',   icon: '▶', url: h => `https://youtube.com/${h}` },
  { key: 'snapchatHandle',  label: 'Snapchat',  icon: '👻', url: h => `https://snapchat.com/add/${h}` },
  { key: 'threadsHandle',   label: 'Threads',   icon: '🧵', url: h => `https://threads.net/@${h}` },
];

export default function LandingPreview({
  theme,
  values,
  isFreeform,
  layoutState,
  onLayoutChange,
  onSelectNode,
  canvasRef,
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const url = values.profileUrl || 'https://yourpage.com';
    QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: theme.accent, light: theme.glassBackground || theme.bg },
    }).then(setQrCodeUrl).catch(console.error);
  }, [values.profileUrl, theme.accent, theme.glassBackground, theme.bg]);

  const dn = (id) => ({
    id,
    isFreeform,
    layoutState,
    onLayoutChange,
    onSelect: onSelectNode,
    canvasRef,
  });

  const gs = (id) => layoutState[id] || {};

  const hasWhatsApp = !!values.whatsAppNumber;
  const waSameAsPhone = hasWhatsApp && values.whatsAppNumber.replace(/\D/g, '') === (values.userPhone || '').replace(/\D/g, '');

  return (
    <div
      ref={canvasRef}
      className={styles.page}
      style={{
        background: theme.bg,
        '--accent': theme.accent,
        '--text-primary': theme.textPrimary,
        '--text-secondary': theme.textSecondary,
        '--glass-bg': theme.glassBackground,
        '--font-heading': theme.fontHeading,
        '--font-body': theme.fontBody,
        position: 'relative',
      }}
    >
      {/* ── Avatar ─────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <DraggableNode {...dn('landingAvatar')}>
          <div className={styles.avatar} style={{ borderColor: theme.accent, ...gs('landingAvatar') }}>
            {values.userAvatar ? (
              <img src={values.userAvatar} alt="Profile" className={styles.avatarImg} />
            ) : values.companyLogo ? (
              <img src={values.companyLogo} alt="Logo" className={styles.logoImg} />
            ) : (
              <span style={{ color: theme.accent, fontSize: '2rem' }}>
                {values.avatarInitials
                  ? values.avatarInitials.substring(0, 3).toUpperCase()
                  : (values.userName || 'U').substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </DraggableNode>

        <DraggableNode {...dn('landingName')}>
          <h1 className={styles.name} style={{ color: theme.textPrimary }}>{values.userName}</h1>
        </DraggableNode>

        <DraggableNode {...dn('landingTitle')}>
          <p className={styles.title} style={{ color: theme.textSecondary }}>{values.userTitle}</p>
        </DraggableNode>

        {values.companyName && (
          <DraggableNode {...dn('landingCompany')}>
            <span className={styles.company} style={{ color: theme.accent, borderColor: `${theme.accent}40` }}>
              {values.companyName}
            </span>
          </DraggableNode>
        )}
      </div>

      {/* ── Bio ─────────────────────────────────────────────────────────── */}
      {values.userBio && (
        <DraggableNode {...dn('landingBio')}>
          <div
            className={styles.bio}
            style={{ color: theme.textSecondary, background: theme.glassBackground, borderColor: `${theme.accent}20` }}
            dangerouslySetInnerHTML={{ __html: values.userBio }}
          />
        </DraggableNode>
      )}

      {/* ── Contact ─────────────────────────────────────────────────────── */}
      <DraggableNode {...dn('landingContact')}>
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ color: `${theme.accent}80` }}>CONTACT</div>
          {values.userEmail && (
            <a
              href={`mailto:${values.userEmail}`}
              className={styles.glassCard}
              style={{ background: theme.glassBackground, borderColor: `${theme.accent}20` }}
              target="_blank" rel="noreferrer"
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
                <div className={styles.glassLabel} style={{ color: theme.textSecondary }}>
                  Phone {waSameAsPhone && <span style={{ color: '#25D366', marginLeft: 6 }}>💬</span>}
                </div>
                <div className={styles.glassValue} style={{ color: theme.textPrimary }}>{values.userPhone}</div>
              </div>
            </a>
          )}
          {!waSameAsPhone && hasWhatsApp && (
            <a
              href={`https://api.whatsapp.com/send/?phone=${values.whatsAppNumber.replace(/\D/g, '')}&text&type=phone_number&app_absent=0`}
              className={styles.glassCard}
              style={{ background: theme.glassBackground, borderColor: `${theme.accent}20` }}
              target="_blank" rel="noreferrer"
            >
              <span className={styles.glassIcon} style={{ color: '#25D366' }}>💬</span>
              <div>
                <div className={styles.glassLabel} style={{ color: theme.textSecondary }}>WhatsApp</div>
                <div className={styles.glassValue} style={{ color: theme.textPrimary }}>{values.whatsAppNumber}</div>
              </div>
            </a>
          )}
        </div>
      </DraggableNode>

      {/* ── Social links — each platform is its own draggable node ──────── */}
      {SOCIAL_MAP.filter(s => values[s.key]).length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ color: `${theme.accent}80` }}>SOCIAL</div>
          <div className={styles.socialGrid}>
            {SOCIAL_MAP.filter(s => values[s.key]).map(s => (
              <DraggableNode key={s.key} {...dn(`social-${s.key}`)}>
                <a
                  href={s.url(values[s.key])}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialBtn}
                  style={{
                    background: theme.glassBackground,
                    borderColor: `${theme.accent}30`,
                    color: theme.textPrimary,
                  }}
                >
                  <span className={styles.socialIcon} style={{ color: theme.accent }}>{s.icon}</span>
                  {s.label}
                </a>
              </DraggableNode>
            ))}
          </div>
        </div>
      )}

      {/* ── QR / Connect ─────────────────────────────────────────────────── */}
      <DraggableNode {...dn('landingConnect')}>
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ color: `${theme.accent}80` }}>CONNECT</div>
          <div className={styles.qrBlock} style={{ background: theme.glassBackground, borderColor: `${theme.accent}20` }}>
            <div
              className={styles.qrPlaceholder}
              style={{
                borderColor: theme.accent,
                padding: qrCodeUrl ? (layoutState?.landingConnect?.fontSize ? (layoutState.landingConnect.fontSize / 16) * 6 : 6) : 6,
                width:  layoutState?.landingConnect?.fontSize ? (layoutState.landingConnect.fontSize / 16) * 70 : 70,
                height: layoutState?.landingConnect?.fontSize ? (layoutState.landingConnect.fontSize / 16) * 70 : 70,
              }}
            >
              {qrCodeUrl
                ? <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%', borderRadius: '4px' }} />
                : <div className={styles.qrMock} />}
            </div>
            <div>
              <div className={styles.qrScan} style={{ color: theme.textPrimary }}>SCAN TO CONNECT</div>
              <div className={styles.qrUrl} style={{ color: theme.textSecondary }}>
                {values.profileUrl || 'yourpage.com'}
              </div>
            </div>
          </div>
        </div>
      </DraggableNode>

      {/* ── Save contact button ───────────────────────────────────────────── */}
      <div className={styles.actionGroup}>
        {values.whatsAppNumber && (
          <DraggableNode {...dn('landingWhatsApp')}>
            <a
              href={`https://api.whatsapp.com/send/?phone=${values.whatsAppNumber.replace(/\D/g, '')}&text&type=phone_number&app_absent=0`}
              target="_blank" rel="noreferrer"
              className={styles.saveBtn}
              style={{ background: '#25D366', color: '#fff' }}
            >
              💬 WhatsApp Me
            </a>
          </DraggableNode>
        )}

        {values.cvUrl && (
          <DraggableNode {...dn('landingCv')}>
            <a
              href={values.cvUrl}
              target="_blank" rel="noreferrer"
              className={styles.saveBtn}
              style={{ background: theme.accent, color: '#000' }}
            >
              📄 View CV
            </a>
          </DraggableNode>
        )}

        <DraggableNode {...dn('landingSaveBtn')}>
          <a
            href="contact.vcf"
            className={styles.saveBtn}
            style={{ background: theme.textPrimary, color: theme.bg }}
          >
            👤 Save Contact
          </a>
        </DraggableNode>
      </div>
    </div>
  );
}

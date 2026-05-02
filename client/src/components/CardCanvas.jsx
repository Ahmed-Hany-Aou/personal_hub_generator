import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import styles from './CardCanvas.module.css';
import DraggableNode from './DraggableNode.jsx';

const ICONS = {
  email: 'email',
  phone: 'phone',
  whatsapp: 'chat',
  github: 'github',
  linkedin: 'linkedin',
  x: 'x',
  facebook: 'facebook',
  instagram: 'instagram',
  youtube: 'youtube',
  snapchat: 'snapchat',
  threads: 'threads',
};

const ICON_PATHS = {
  email: 'M4 6h16v12H4z M4 6l8 6 8-6',
  phone: 'M6 5h4l2 5-3 2c1.5 3 3.5 5 6 6l2-3 5 2v4c0 1-1 2-2 2C11 21 3 13 3 7c0-1 1-2 2-2z',
  whatsapp: 'M20 11.5a8 8 0 1 1-3-6.3L21 4l-1.2 4.2A7.9 7.9 0 0 1 20 11.5z M9 9c0 3 3 6 6 6',
  github: 'M12 2a10 10 0 0 0-3.2 19.4c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.4-1-.9-1.3-.9-1.3-.7-.5 0-.5 0-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.8 2.4.6.1-.5.3-.8.6-1-2.3-.2-4.7-1.1-4.7-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.9-.3 3 1a10.4 10.4 0 0 1 5.5 0c2.1-1.3 3-.9 3-.9.4 1 .2 1.9.1 2.7a3.9 3.9 0 0 1 1 2.6c0 4-2.4 4.8-4.7 5 .4.4.7.9.7 1.8v2.7c0 .3.2.7.7.5A10 10 0 0 0 12 2z',
  linkedin: 'M6 9H2v13h4zm-2-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 2h4v2c.6-1.1 2-2.3 4.2-2.3C22 8.7 22 12 22 16v6h-4v-5.5c0-2.1 0-4.7-2.8-4.7-2.8 0-3.2 2.2-3.2 4.6V22h-4V9z',
  x: 'M4 4l7.8 9.2L4.5 20H7l6.1-6.9L19 20h5l-8.2-9.7L23 4h-2.5l-5.7 6.4L10 4z',
  facebook: 'M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.6.4-1 1-1z',
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  youtube: 'M21.6 8s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C16 4.8 12 4.8 12 4.8s-4 0-6.7.2c-.4 0-1.3.1-2.1.9C2.6 6.5 2.4 8 2.4 8S2 9.8 2 11.6v.8c0 1.8.4 3.6.4 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.8.2 6.4.2 6.4.2s4 0 6.7-.2c.4 0 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.4-1.8.4-3.6v-.8c0-1.8-.4-3.6-.4-3.6z M10 9.5l5 2.1-5 2.1v-4.2z',
  snapchat: 'M12 3c-2.8 0-4.2 2.2-4.2 4.1 0 1-.3 1.6-.9 2.1-.4.3-1 .6-1.5.8-.6.2-1.2.5-1.2 1.1 0 .6.7.9 1.4 1 .7.2 1.3.4 1.7.8.4.4.5 1 .2 1.5-.2.4-.7.7-1.1 1-.4.2-.9.5-.9 1 0 .6.6.9 1.2.9.9 0 1.5.5 1.8 1.1.3.6.8 1.4 2.4 1.4s2.1-.8 2.4-1.4c.3-.6.9-1.1 1.8-1.1.6 0 1.2-.3 1.2-.9 0-.5-.5-.8-.9-1-.4-.3-.9-.6-1.1-1-.3-.5-.2-1.1.2-1.5.4-.4 1-.6 1.7-.8.7-.1 1.4-.4 1.4-1 0-.6-.6-.9-1.2-1.1-.5-.2-1.1-.5-1.5-.8-.6-.5-.9-1.1-.9-2.1C16.2 5.2 14.8 3 12 3z',
  threads: 'M13 4c-4.4 0-8 3.1-8 7s3.6 7 8 7c1.8 0 3.4-.4 4.7-1.2.6-.3 1.2-.1 1.6.4l1.1 1.5c.4.5 1 .4 1.1-.2.2-.9.4-1.9.4-2.9 0-4.7-4-8.6-8.9-8.6H13zm0 4.2c2.4 0 4.4 1.5 4.4 3.3 0 1.8-2 3.3-4.4 3.3-2.4 0-4.4-1.5-4.4-3.3 0-1.8 2-3.3 4.4-3.3z',
};

function IconMark({ type }) {
  const d = ICON_PATHS[type];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}

const CONTACT_MAP = [
  { id: 'card-email', icon: 'email', label: v => v.userEmail || null },
  { id: 'card-phone', icon: 'phone', label: v => (v.userPhone && v.whatsAppNumber === v.userPhone) ? `${v.userPhone} • WhatsApp` : (v.userPhone || null) },
  { id: 'card-whatsapp', icon: 'whatsapp', label: v => (v.whatsAppNumber && v.whatsAppNumber !== v.userPhone) ? v.whatsAppNumber : null },
  { id: 'card-github', icon: 'github', label: v => v.githubHandle ? `github.com/${v.githubHandle}` : null },
  { id: 'card-linkedin', icon: 'linkedin', label: v => v.linkedinHandle ? `in/${v.linkedinHandle}` : null },
  { id: 'card-x', icon: 'x', label: v => v.xHandle ? `@${v.xHandle}` : null },
  { id: 'card-facebook', icon: 'facebook', label: v => v.facebookHandle ? `fb.com/${v.facebookHandle}` : null },
  { id: 'card-instagram', icon: 'instagram', label: v => v.instagramHandle ? `@${v.instagramHandle}` : null },
  { id: 'card-youtube', icon: 'youtube', label: v => v.youtubeHandle || null },
  { id: 'card-snapchat', icon: 'snapchat', label: v => v.snapchatHandle || null },
  { id: 'card-threads', icon: 'threads', label: v => v.threadsHandle ? `@${v.threadsHandle}` : null },
];

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
  showGrid = true,
  templateId,
  layout,
}) {
  const [layoutPulse, setLayoutPulse] = useState(false);
  const cardBackground = theme.cardBg || theme.bg;
  const isGradient = cardBackground?.includes('gradient');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const url = values.profileUrl || 'https://yourpage.com';
    QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: theme.accent, light: theme.bg }
    }).then(setQrCodeUrl).catch(console.error);
  }, [values.profileUrl, theme.accent, theme.bg]);

  useEffect(() => {
    if (!templateId) return;
    setLayoutPulse(true);
    const timer = setTimeout(() => setLayoutPulse(false), 300);
    return () => clearTimeout(timer);
  }, [templateId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    ro.observe(el);
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const PADDING = 24;
  const availW = containerSize.width > 0 ? containerSize.width - PADDING * 2 : 800;
  const availH = containerSize.height > 0 ? containerSize.height - PADDING * 2 : 500;
  const scale = Math.min(availW / width, availH / height, 1);

  const getLayout = () => {
    if (isFreeform) return 'custom';
    const curLayout = layout || (
      templateId?.includes('midnight') ? 'bento' :
      templateId?.includes('sunset') ? 'radial' :
      templateId?.includes('prism') ? 'prism' : null
    );
    if (curLayout === 'prism') return 'prism';
    if (curLayout === 'centered') return 'centered';
    if (curLayout === 'strike') return 'strike';
    if (curLayout === 'sidebar') return 'sidebar';
    if (curLayout === 'wide') return 'wide';
    if (curLayout === 'stack') return 'stack';
    if (curLayout === 'blueprint') return 'blueprint';
    if (curLayout === 'float') return 'float';
    if (curLayout === 'bento') return 'bento';
    if (curLayout === 'radial') return 'radial';

    const ratio = width / height;
    if (ratio >= 0.95 && ratio <= 1.05) return 'square';
    if (ratio < 1) return 'vertical';
    return 'horizontal';
  };

  const currentLayout = getLayout();

  const dn = (id) => ({
    id,
    isFreeform,
    layoutState,
    onLayoutChange,
    onSelect: onSelectNode,
    canvasRef,
  });

  const ns = (id, base = {}) => {
    const s = layoutState?.[id] || {};
    return {
      ...base,
      ...(s.color ? { color: s.color } : {}),
      ...(s.fontSize ? { fontSize: `${s.fontSize}px` } : {}),
      ...(s.fontFamily ? { fontFamily: s.fontFamily } : {}),
      ...(s.fontWeight ? { fontWeight: s.fontWeight } : {}),
      ...(s.fontStyle ? { fontStyle: s.fontStyle } : {}),
      ...(s.textDecoration ? { textDecoration: s.textDecoration } : {}),
      ...(s.textAlign ? { textAlign: s.textAlign } : {}),
      ...(s.letterSpacing != null ? { letterSpacing: `${s.letterSpacing}px` } : {}),
      ...(s.opacity != null ? { opacity: s.opacity } : {}),
    };
  };

  return (
    <div ref={containerRef} className={styles.canvasContainer}>
      <div className={styles.scaleWrapper} style={{ width: width * scale, height: height * scale }}>
        <div
          id="card-export-target"
          ref={canvasRef}
          className={`${styles.card} ${layoutPulse ? styles.layoutPulse : ''}`}
          data-layout={currentLayout}
          data-mode={isFreeform ? 'freeform' : 'structured'}
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            background: cardBackground,
            backgroundColor: !isGradient ? cardBackground : undefined,
            '--accent': theme.accent,
            '--font-heading': theme.fontHeading || 'Poppins',
            '--font-body': theme.fontBody || 'Inter',
            '--prism-left-bg': theme.glassBackground || 'rgba(0,0,0,0.1)',
            '--glass-bg': theme.glassBackground || 'rgba(255, 255, 255, 0.03)',
            '--glass-border': theme.glassBorder || 'rgba(255, 255, 255, 0.1)',
            '--card-glow': theme.glow || 'none',
            '--grid-color': theme.glassBorder || 'rgba(255, 255, 255, 0.05)',
            position: 'relative',
          }}
        >
          {currentLayout === 'prism' && <div className={styles.prismBg} />}
          {currentLayout === 'blueprint' && <div className={styles.blueprintCrosshair} />}
          {theme.accentBar && <div className={styles.accentBar} style={{ background: theme.accent }} />}
          {showGrid && <div className={styles.grid} />}
          <div className={styles.glow} />

          <div className={`${styles.body} ${styles.pane} ${styles.profilePane}`}>
            <DraggableNode {...dn('userName')}>
              <div
                className={styles.name}
                style={ns('userName', {
                  color: theme.textPrimary,
                  fontFamily: theme.fontHeading || 'Poppins, sans-serif',
                })}
              >
                {(values.userName || '').toUpperCase()}
              </div>
            </DraggableNode>

            <DraggableNode {...dn('userTitle')}>
              <div
                className={styles.title}
                style={ns('userTitle', {
                  color: theme.textSecondary || theme.textPrimary,
                  fontFamily: theme.fontBody || 'Inter, sans-serif',
                })}
              >
                {(values.userTitle || '').toUpperCase()}
              </div>
            </DraggableNode>

            {values.companyName && (
              <DraggableNode {...dn('companyName')}>
                <div
                  className={styles.company}
                  style={ns('companyName', {
                    color: theme.accent,
                    fontFamily: theme.fontHeading || 'Poppins, sans-serif',
                  })}
                >
                  {values.companyName}
                </div>
              </DraggableNode>
            )}

            <DraggableNode {...dn('divider')}>
              <div
                className={styles.divider}
                style={{
                  ...ns('divider', { opacity: 0.3 }),
                  background: layoutState?.divider?.color || theme.accent,
                  '--divider-width': layoutState?.divider?.fontSize ? `${layoutState.divider.fontSize * 7}px` : '320px',
                  '--divider-height': layoutState?.divider?.letterSpacing ? `${Math.max(1, layoutState.divider.letterSpacing)}px` : '2px'
                }}
              />
            </DraggableNode>

            <div className={styles.contacts}>
              {CONTACT_MAP.map(({ id, icon, label }) => {
                const text = label(values);
                if (!text) return null;
                return (
                  <DraggableNode key={id} {...dn(id)}>
                    <div
                      className={styles.contactRow}
                      style={ns(id, {
                        color: theme.textSecondary || theme.textPrimary,
                        fontFamily: theme.fontBody || 'Inter, sans-serif',
                      })}
                    >
                      <span className={styles.icon}>{icon}</span>
                      {text}
                    </div>
                  </DraggableNode>
                );
              })}
            </div>
          </div>

          <div className={`${styles.qrArea} ${styles.pane} ${styles.ctaPane}`}>
            <DraggableNode {...dn('qrArea')}>
              <div className={styles.qrAreaInner}>
                <div
                  className={styles.qrBox}
                  style={{
                    borderColor: theme.accent,
                    width: layoutState?.qrArea?.fontSize ? (layoutState.qrArea.fontSize / 16) * 130 : 130,
                    height: layoutState?.qrArea?.fontSize ? (layoutState.qrArea.fontSize / 16) * 130 : 130,
                  }}
                >
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <div className={styles.qrInner} style={{ color: theme.accent }}>
                      <div className={styles.qrLabel}>SCAN</div>
                      <div className={styles.qrDots} />
                    </div>
                  )}
                </div>
                <div
                  className={styles.qrCaption}
                  style={ns('qrArea', { color: theme.textSecondary || theme.textPrimary })}
                >
                  {values.profileUrl || 'your-hub.link'}
                </div>
              </div>
            </DraggableNode>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import styles from './CardCanvas.module.css';
import DraggableNode from './DraggableNode.jsx';

const CONTACT_MAP = [
  { id: 'card-email', icon: '✉️', label: v => v.userEmail || null },
  { id: 'card-phone', icon: '📞', label: v => (v.userPhone && v.whatsAppNumber === v.userPhone) ? `${v.userPhone} 📱` : (v.userPhone || null) },
  { id: 'card-whatsapp', icon: '💬', label: v => (v.whatsAppNumber && v.whatsAppNumber !== v.userPhone) ? v.whatsAppNumber : null },
  { id: 'card-github', icon: '⌥', label: v => v.githubHandle ? `github.com/${v.githubHandle}` : null },
  { id: 'card-linkedin', icon: '🔗', label: v => v.linkedinHandle ? `in/${v.linkedinHandle}` : null },
  { id: 'card-x', icon: '𝕏', label: v => v.xHandle ? `@${v.xHandle}` : null },
  { id: 'card-facebook', icon: '📘', label: v => v.facebookHandle ? `fb.com/${v.facebookHandle}` : null },
  { id: 'card-instagram', icon: '📸', label: v => v.instagramHandle ? `@${v.instagramHandle}` : null },
  { id: 'card-youtube', icon: '▶️', label: v => v.youtubeHandle || null },
  { id: 'card-snapchat', icon: '👻', label: v => v.snapchatHandle || null },
  { id: 'card-threads', icon: '🧵', label: v => v.threadsHandle ? `@${v.threadsHandle}` : null },
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

  useEffect(() => {
    const url = values.profileUrl || 'https://yourpage.com';
    QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: theme.accent, light: theme.bg }
    }).then(setQrCodeUrl).catch(console.error);
  }, [values.profileUrl, theme.accent, theme.bg]);

  // Visual feedback on layout change
  useEffect(() => {
    if (!templateId) return;
    setLayoutPulse(true);
    const timer = setTimeout(() => setLayoutPulse(false), 300);
    return () => clearTimeout(timer);
  }, [templateId]);

  const PREVIEW_WIDTH = 920;
  const PREVIEW_HEIGHT = 570;

  // Container-aware scaling: check window width for mobile adaptability
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth - 48 : PREVIEW_WIDTH;
  const targetWidth = Math.min(PREVIEW_WIDTH, viewportWidth);
  const scale = Math.min(targetWidth / width, PREVIEW_HEIGHT / height, 0.88);

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

  /**
   * Build inline styles for inner content divs by merging base (theme) styles
   * with per-node overrides from layoutState. This lets fontSize, fontFamily,
   * color, etc. override the CSS class values directly on the element.
   */
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
        {/* Structural Overlays */}
        {currentLayout === 'prism' && <div className={styles.prismBg} />}
        {currentLayout === 'blueprint' && <div className={styles.blueprintCrosshair} />}
        {theme.accentBar && <div className={styles.accentBar} style={{ background: theme.accent }} />}
        {showGrid && <div className={styles.grid} />}
        <div className={styles.glow} />

        {/* 1. Left Pane (Profile / Body) */}
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

        {/* 2. Right Pane (QR / Call to Action) */}
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
  );
}

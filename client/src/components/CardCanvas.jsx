import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import styles from './CardCanvas.module.css';
import DraggableNode from './DraggableNode.jsx';
import { getIconPath } from '../lib/iconLibrary.js';

// Renders a single SVG icon from the shared library.
// Supports multi-path icons by splitting on ' M ' tokens.
function IconMark({ type, size, color }) {
  const raw = getIconPath(type);
  if (!raw) return null;
  const segments = raw.split(' M ');
  return (
    <svg
      viewBox="0 0 24 24"
      width={size || '1em'}
      height={size || '1em'}
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {segments.map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M ' + seg} />
      ))}
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
                      <span className={styles.icon}>
                        <IconMark type={icon} />
                      </span>
                      {text}
                    </div>
                  </DraggableNode>
                );
              })}
            </div>
          </div>

          {/* Company logo overlay — always draggable */}
          {values.companyLogo && (
            <DraggableNode
              id="companyLogo"
              isFreeform={isFreeform}
              alwaysDraggable
              layoutState={layoutState}
              onLayoutChange={onLayoutChange}
              onSelect={onSelectNode}
              canvasRef={canvasRef}
            >
              <img
                src={values.companyLogo}
                alt="Company Logo"
                style={{
                  maxWidth: 80,
                  maxHeight: 48,
                  objectFit: 'contain',
                  display: 'block',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  ...(layoutState?.companyLogo?.opacity != null ? { opacity: layoutState.companyLogo.opacity } : {}),
                }}
              />
            </DraggableNode>
          )}

          {/* Custom image nodes — always draggable */}
          {(layoutState?.__customImageIds || []).map(imgId => {
            const img = layoutState[imgId];
            if (!img?.src) return null;
            const imgW = img.fontSize || img.width || 80;
            return (
              <DraggableNode
                key={imgId}
                id={imgId}
                isFreeform={isFreeform}
                alwaysDraggable
                layoutState={layoutState}
                onLayoutChange={onLayoutChange}
                onSelect={onSelectNode}
                canvasRef={canvasRef}
              >
                <img
                  src={img.src}
                  alt="custom"
                  style={{
                    width: imgW,
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: img.opacity != null ? img.opacity : 1,
                    borderRadius: 4,
                  }}
                />
              </DraggableNode>
            );
          })}

          {/* Custom icon nodes — always draggable, seeded via layoutState */}
          {(layoutState?.__customIconIds || []).map(cid => {
            const ci = layoutState[cid];
            if (!ci) return null;
            return (
              <DraggableNode
                key={cid}
                id={cid}
                isFreeform={isFreeform}
                alwaysDraggable
                layoutState={layoutState}
                onLayoutChange={onLayoutChange}
                onSelect={onSelectNode}
                canvasRef={canvasRef}
              >
                <IconMark
                  type={ci.iconKey}
                  size={ci.fontSize || ci.size || 32}
                  color={ci.color || (layoutState?.[cid]?.color) || theme.accent}
                />
              </DraggableNode>
            );
          })}

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

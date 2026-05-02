import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import styles from './CardBackCanvas.module.css';

export default function CardBackCanvas({ theme, values, width, height, canvasRef }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const url = values.profileUrl || (values.userEmail ? `mailto:${values.userEmail}` : 'https://yourpage.com');
    // QRCode only accepts plain hex — strip gradients and fall back to bg
    const rawLight = theme.cardBg || theme.bg;
    const lightColor = rawLight && !rawLight.includes('gradient') && !rawLight.includes('rgba') && !rawLight.includes('hsl')
      ? rawLight
      : theme.bg || '#000000';
    QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: theme.accent, light: lightColor }
    }).then(setQrCodeUrl).catch(console.error);
  }, [values.profileUrl, values.userEmail, theme.accent, theme.bg, theme.cardBg]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    ro.observe(el);
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const PADDING = 24;
  const availW = containerSize.width > 0 ? containerSize.width - PADDING * 2 : 800;
  const availH = containerSize.height > 0 ? containerSize.height - PADDING * 2 : 500;
  const scale  = Math.min(availW / width, availH / height, 1);

  const cardBg    = theme.cardBg || theme.bg;
  const isGrad    = cardBg?.includes('gradient');
  const accent    = theme.accent    || '#22d3ee';
  const textPrim  = theme.textPrimary  || '#ffffff';
  const textSec   = theme.textSecondary || textPrim;
  const headingFf = theme.fontHeading || 'Poppins, sans-serif';
  const bodyFf    = theme.fontBody    || 'Inter, sans-serif';

  // Proportional sizes relative to card dimensions
  const qrSize      = Math.round(Math.min(width, height) * 0.32);
  const logoMaxH    = Math.round(height * 0.12);
  const nameFontSz  = Math.round(height * 0.045);
  const urlFontSz   = Math.round(height * 0.038);
  const cornerSz    = Math.round(Math.min(width, height) * 0.07);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.scaleWrapper} style={{ width: width * scale, height: height * scale }}>
        <div
          id="card-back-export-target"
          ref={canvasRef}
          className={styles.card}
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            background: cardBg,
            backgroundColor: !isGrad ? cardBg : undefined,
            '--accent': accent,
            '--font-heading': headingFf,
            '--font-body': bodyFf,
          }}
        >
          {/* Decorative top-left corner mark */}
          <span
            className={styles.cornerTL}
            style={{ borderColor: `${accent}70`, width: cornerSz, height: cornerSz }}
          />
          {/* Decorative bottom-right corner mark */}
          <span
            className={styles.cornerBR}
            style={{ borderColor: `${accent}70`, width: cornerSz, height: cornerSz }}
          />

          {/* Subtle grid overlay */}
          <div
            className={styles.grid}
            style={{ backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)` }}
          />

          {/* Thin accent line at very top */}
          <div className={styles.topBar} style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

          {/* Main centered content */}
          <div className={styles.center}>
            {/* Logo or company name */}
            {values.companyLogo ? (
              <img
                src={values.companyLogo}
                alt="Company Logo"
                style={{ maxHeight: logoMaxH, maxWidth: width * 0.4, objectFit: 'contain', marginBottom: Math.round(height * 0.04) }}
              />
            ) : values.companyName ? (
              <div
                className={styles.company}
                style={{
                  color: accent,
                  fontFamily: headingFf,
                  fontSize: Math.round(height * 0.05),
                  marginBottom: Math.round(height * 0.04),
                  letterSpacing: '0.18em',
                }}
              >
                {values.companyName.toUpperCase()}
              </div>
            ) : null}

            {/* QR code */}
            <div
              className={styles.qrBox}
              style={{
                width:  qrSize + 16,
                height: qrSize + 16,
                borderColor: `${accent}30`,
                boxShadow: `0 0 32px ${accent}18`,
              }}
            >
              {qrCodeUrl
                ? <img src={qrCodeUrl} alt="QR Code" style={{ width: qrSize, height: qrSize, display: 'block' }} />
                : <div style={{ width: qrSize, height: qrSize, background: `${accent}20` }} />
              }
            </div>

            {/* Scan label */}
            <div
              className={styles.scanLabel}
              style={{ color: `${accent}99`, fontFamily: bodyFf, fontSize: Math.round(height * 0.033) }}
            >
              SCAN TO CONNECT
            </div>

            {/* Profile URL */}
            {(values.profileUrl || values.userEmail) && (
              <div
                className={styles.url}
                style={{ color: `${textSec}bb`, fontFamily: bodyFf, fontSize: urlFontSz }}
              >
                {values.profileUrl || values.userEmail}
              </div>
            )}
          </div>

          {/* Bottom: person name */}
          <div
            className={styles.bottomName}
            style={{ color: `${textPrim}40`, fontFamily: headingFf, fontSize: nameFontSz }}
          >
            {values.userName || ''}
          </div>

          {/* Thin accent line at very bottom */}
          <div className={styles.bottomBar} style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        </div>
      </div>
    </div>
  );
}

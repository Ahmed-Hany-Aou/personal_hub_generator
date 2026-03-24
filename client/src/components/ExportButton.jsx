import { useState } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import styles from './ExportButton.module.css';

function generateVCard(values) {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${values.userName || ''}`,
    `TITLE:${values.userTitle || ''}`,
    `ORG:${values.companyName || ''}`,
    `EMAIL:${values.userEmail || ''}`,
    `TEL:${values.userPhone || ''}`,
    values.githubHandle ? `URL:https://github.com/${values.githubHandle}` : '',
    values.linkedinHandle ? `URL:https://linkedin.com/in/${values.linkedinHandle}` : '',
    values.profileUrl ? `URL:${values.profileUrl}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
}

function generateLandingHTML(theme, values) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${values.userName || 'Digital Card'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:${theme.bg};color:${theme.textPrimary};font-family:'Inter',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
    .card{background:${theme.glassBackground};border:1px solid ${theme.accent}20;border-radius:20px;padding:40px 30px;max-width:420px;width:100%;display:flex;flex-direction:column;gap:24px;box-shadow:0 20px 60px rgba(0,0,0,0.4)}
    .hero{text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px}
    .avatar{width:80px;height:80px;border-radius:50%;border:2px solid ${theme.accent};display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.2);font-size:2rem;color:${theme.accent};margin-bottom:8px}
    h1{font-family:'Poppins',sans-serif;font-size:1.6rem;font-weight:700;letter-spacing:1px}
    .title-sub{color:${theme.textSecondary};font-size:0.85rem;letter-spacing:1px;text-transform:uppercase}
    .company{color:${theme.accent};font-size:0.85rem;font-weight:600;border:1px solid ${theme.accent}40;padding:3px 14px;border-radius:20px}
    .section-label{font-size:0.65rem;font-weight:700;letter-spacing:2px;color:${theme.accent}80;font-family:'Poppins',sans-serif;text-transform:uppercase;margin-bottom:8px}
    .glass{background:${theme.glassBackground};border:1px solid ${theme.accent}20;border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:14px;text-decoration:none;color:inherit;margin-bottom:8px}
    .glass:hover{opacity:0.85}
    .icon-col{color:${theme.accent};font-size:1.1rem;width:24px;text-align:center}
    .label{font-size:0.65rem;color:${theme.textSecondary};text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
    .value{font-size:0.85rem;font-weight:500}
    .social-row{display:flex;gap:10px}
    .social-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:12px;border:1px solid ${theme.accent}30;background:${theme.glassBackground};text-decoration:none;color:${theme.textPrimary};font-size:0.8rem;font-weight:600}
    .social-btn:hover{opacity:0.85}
    .qr-block{background:${theme.glassBackground};border:1px solid ${theme.accent}20;border-radius:12px;padding:16px;display:flex;align-items:center;gap:16px}
    .qr-block img{width:80px;height:80px;border-radius:8px}
    .qr-label{font-family:'Poppins',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:2px;margin-bottom:4px}
    .qr-url{font-size:0.7rem;color:${theme.textSecondary}}
    .save-btn{background:${theme.accent};color:#0a0f16;font-family:'Poppins',sans-serif;font-size:0.9rem;font-weight:600;padding:16px;border-radius:14px;text-align:center;text-decoration:none;display:block}
    .save-btn:hover{opacity:0.9}
  </style>
</head>
<body>
  <div class="card">
    <div class="hero">
      <div class="avatar">${(values.userName || 'U').charAt(0).toUpperCase()}</div>
      <h1>${values.userName || ''}</h1>
      <div class="title-sub">${values.userTitle || ''}</div>
      ${values.companyName ? `<div class="company">${values.companyName}</div>` : ''}
    </div>
    <div>
      <div class="section-label">Contact</div>
      ${values.userEmail ? `<a href="mailto:${values.userEmail}" class="glass"><span class="icon-col">✉</span><div><div class="label">Email</div><div class="value">${values.userEmail}</div></div></a>` : ''}
      ${values.userPhone ? `<a href="tel:${values.userPhone}" class="glass"><span class="icon-col">☎</span><div><div class="label">Phone</div><div class="value">${values.userPhone}</div></div></a>` : ''}
    </div>
    ${(values.githubHandle || values.linkedinHandle) ? `
    <div>
      <div class="section-label">Social</div>
      <div class="social-row">
        ${values.githubHandle ? `<a href="https://github.com/${values.githubHandle}" target="_blank" class="social-btn"><span style="color:${theme.accent}">⌥</span> GitHub</a>` : ''}
        ${values.linkedinHandle ? `<a href="https://linkedin.com/in/${values.linkedinHandle}" target="_blank" class="social-btn"><span style="color:${theme.accent}">🔗</span> LinkedIn</a>` : ''}
      </div>
    </div>` : ''}
    ${values.profileUrl ? `
    <div>
      <div class="section-label">Connect</div>
      <div class="qr-block">
        <img src="qr-code.png" alt="QR Code" />
        <div>
          <div class="qr-label" style="color:${theme.textPrimary}">SCAN TO CONNECT</div>
          <div class="qr-url">${values.profileUrl}</div>
        </div>
      </div>
    </div>` : ''}
    <a href="contact.vcf" class="save-btn">📞 Save Contact Info</a>
  </div>
</body>
</html>`;
}

export default function ExportButton({ values, template }) {
  const [state, setState] = useState('idle');

  const handleExport = async () => {
    setState('loading');
    try {
      const zip = new JSZip();

      const cardEl = document.getElementById('card-canvas');
      if (cardEl) {
        const canvas = await html2canvas(cardEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: template.theme.bg,
          logging: false,
        });
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        zip.file('business-card.png', blob);
      }

      const profileUrl = values.profileUrl || `mailto:${values.userEmail}` || 'https://yourpage.com';
      const qrDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: template.theme.accent.replace('#', '') === template.theme.accent ? template.theme.accent : template.theme.accent,
          light: '#00000000',
        },
      });
      const qrBase64 = qrDataUrl.split(',')[1];
      zip.file('qr-code.png', qrBase64, { base64: true });

      const landingHTML = generateLandingHTML(template.theme, values);
      zip.file('index.html', landingHTML);

      const vcf = generateVCard(values);
      zip.file('contact.vcf', vcf);

      zip.file('README.txt', [
        `Digital Card for ${values.userName || 'User'}`,
        '========================',
        '',
        'Files included:',
        '  business-card.png  - High-resolution business card image',
        '  index.html         - Mobile landing page (open in browser)',
        '  contact.vcf        - Contact file (tap to save to phone)',
        '  qr-code.png        - QR code linking to your profile',
        '',
        `Generated by Creative Studio`,
      ].join('\n'));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(values.userName || 'card').replace(/\s+/g, '-').toLowerCase()}-digital-card.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setState('done');
      setTimeout(() => setState('idle'), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <button
      className={`${styles.btn} ${state === 'done' ? styles.done : state === 'error' ? styles.error : ''}`}
      onClick={handleExport}
      disabled={state === 'loading'}
    >
      {state === 'loading' && '⏳ Exporting…'}
      {state === 'done' && '✓ Downloaded!'}
      {state === 'error' && '⚠ Try again'}
      {state === 'idle' && '⬇ Export ZIP'}
    </button>
  );
}

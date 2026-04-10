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
    values.xHandle ? `URL:https://x.com/${values.xHandle}` : '',
    values.instagramHandle ? `URL:https://instagram.com/${values.instagramHandle}` : '',
    values.facebookHandle ? `URL:https://facebook.com/${values.facebookHandle}` : '',
    values.snapchatHandle ? `URL:https://snapchat.com/add/${values.snapchatHandle}` : '',
    values.youtubeHandle ? `URL:https://youtube.com/${values.youtubeHandle}` : '',
    values.threadsHandle ? `URL:https://threads.net/@${values.threadsHandle}` : '',
    values.profileUrl ? `URL:${values.profileUrl}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
}

function generateLandingHTML(theme, values) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${values.userName || 'Digital Card'}</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            heading: ['Outfit', 'sans-serif'],
            body: ['Inter', 'sans-serif'],
          },
          colors: {
            bg: '${theme.bg}',
            text: '${theme.textPrimary}',
            muted: '${theme.textSecondary}',
            accent: '${theme.accent}',
            glass: '${theme.glassBackground || theme.bg}',
          },
          animation: {
            'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'float': 'float 6s ease-in-out infinite',
          },
          keyframes: {
            fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-15px)' },
            }
          }
        }
      }
    }
  </script>
  
  <style>
    /* Custom Vanilla CSS overrrides for glass visuals */
    body { background: ${theme.bg}; color: ${theme.textPrimary}; overflow-x: hidden; }
    .glass-panel {
      background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.05);
      border-top: 1px solid rgba(255,255,255,0.1);
      border-left: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 30px 60px rgba(0,0,0,0.3), inset 0 0 0 1px ${theme.accent}20;
    }
    .glass-btn {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      border: 1px solid rgba(255,255,255,0.05);
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .glass-btn:hover {
      background: rgba(255,255,255,0.08);
      border-color: ${theme.accent}50;
      box-shadow: 0 10px 30px ${theme.accent}20;
    }
    
    /* Scroll animation classes attached by JS */
    .reveal { opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .reveal.active { opacity: 1; transform: translateY(0); }
    
    /* Hide scrollbar for clean aesthetic */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme.accent}40; border-radius: 4px; }
  </style>
</head>
<body class="font-body min-h-screen relative flex flex-col items-center py-16 px-4 sm:px-6">

  <!-- Ambient Background Orbs -->
  <div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px] pointer-events-none animate-float" style="animation-delay: 0s;"></div>
  <div class="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/15 blur-[100px] pointer-events-none animate-float" style="animation-delay: -3s;"></div>

  <!-- Main Card Container -->
  <main id="tiltWrapper" class="relative z-10 w-full max-w-md perspective-[1000px]">
    
    <div id="tiltCard" class="glass-panel rounded-3xl p-8 sm:p-10 flex flex-col gap-10 transition-transform duration-200 ease-out will-change-transform">
      
      <!-- Profile Header -->
      <header class="flex flex-col items-center text-center gap-4 reveal">
        <div class="relative group">
          <div class="absolute inset-0 bg-accent/40 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div class="w-28 h-28 rounded-full border border-white/20 overflow-hidden relative z-10 shadow-xl bg-glass flex items-center justify-center text-4xl text-accent font-heading font-medium">
            ${values.userAvatar ? '<img src="' + values.userAvatar + '" alt="Profile" class="w-full h-full object-cover" />' : (values.avatarInitials ? values.avatarInitials.substring(0, 3).toUpperCase() : (values.userName || 'U').substring(0, 2).toUpperCase())}
          </div>
        </div>
        
        <div class="flex flex-col gap-1">
          <h1 class="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-text">${values.userName || ''}</h1>
          <h2 class="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-muted">${values.userTitle || ''}</h2>
        </div>
        
        ${values.companyName ? '<div class="mt-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-bold tracking-wide uppercase shadow-[0_0_15px_theme(colors.accent)/10]">' + values.companyName + '</div>' : ''}
      </header>

      ${values.userBio ? '\n      <!-- Bio -->\n      <section class="reveal">\n        <p class="text-sm leading-relaxed text-muted text-center">' + values.userBio + '</p>\n      </section>' : ''}

      <!-- Contact Info -->
      ${(values.userEmail || values.userPhone) ? '\n      <section class="flex flex-col gap-3 reveal">\n        <h3 class="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-muted mb-1 px-1">Contact Details</h3>\n        \n        ' + (values.userEmail ? '<a href="mailto:' + values.userEmail + '" class="glass-btn rounded-2xl p-4 flex items-center gap-4 group transition-all duration-300 transform hover:-translate-y-1">\n          <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300 shadow-inner">\n            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>\n          </div>\n          <div class="flex flex-col">\n            <span class="text-[0.65rem] font-bold tracking-wider uppercase text-muted">Email Address</span>\n            <span class="text-sm font-medium text-text">' + values.userEmail + '</span>\n          </div>\n        </a>' : '') + '\n        \n        ' + (values.userPhone ? '<a href="tel:' + values.userPhone + '" class="glass-btn rounded-2xl p-4 flex items-center gap-4 group transition-all duration-300 transform hover:-translate-y-1">\n          <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300 shadow-inner">\n            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>\n          </div>\n          <div class="flex flex-col">\n            <span class="text-[0.65rem] font-bold tracking-wider uppercase text-muted">Phone Number</span>\n            <span class="text-sm font-medium text-text">' + values.userPhone + '</span>\n          </div>\n        </a>' : '') + '\n      </section>' : ''}

      <!-- Social Links -->
      ${(values.githubHandle || values.linkedinHandle || values.xHandle || values.facebookHandle || values.instagramHandle || values.snapchatHandle || values.youtubeHandle || values.threadsHandle) ? '\n      <section class="flex flex-col gap-3 reveal">\n        <h3 class="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-muted mb-1 px-1">Connect on Social</h3>\n        <div class="grid grid-cols-2 gap-3">\n          \n          ' + (values.githubHandle ? '<a href="https://github.com/' + values.githubHandle + '" target="_blank" class="glass-btn rounded-xl p-3 flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1 text-center">\n            <span class="text-accent text-xl group-hover:scale-125 transition-transform duration-300 pb-1">⌥</span>\n            <span class="text-xs font-semibold tracking-wide text-text">GitHub</span>\n          </a>' : '') + '\n          \n          ' + (values.linkedinHandle ? '<a href="https://linkedin.com/in/' + values.linkedinHandle + '" target="_blank" class="glass-btn rounded-xl p-3 flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1 text-center">\n            <span class="text-accent text-xl group-hover:scale-125 transition-transform duration-300 pb-1">🔗</span>\n            <span class="text-xs font-semibold tracking-wide text-text">LinkedIn</span>\n          </a>' : '') + '\n\n          ' + (values.xHandle ? '<a href="https://x.com/' + values.xHandle + '" target="_blank" class="glass-btn rounded-xl p-3 flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1 text-center">\n            <span class="text-accent text-xl group-hover:scale-125 transition-transform duration-300 pb-1">𝕏</span>\n            <span class="text-xs font-semibold tracking-wide text-text">X</span>\n          </a>' : '') + '\n\n          ' + (values.facebookHandle ? '<a href="https://facebook.com/' + values.facebookHandle + '" target="_blank" class="glass-btn rounded-xl p-3 flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1 text-center">\n            <span class="text-accent text-xl group-hover:scale-125 transition-transform duration-300 pb-1">📘</span>\n            <span class="text-xs font-semibold tracking-wide text-text">Facebook</span>\n          </a>' : '') + '\n\n          ' + (values.instagramHandle ? '<a href="https://instagram.com/' + values.instagramHandle + '" target="_blank" class="glass-btn rounded-xl p-3 flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1 text-center">\n            <span class="text-accent text-xl group-hover:scale-125 transition-transform duration-300 pb-1">📸</span>\n            <span class="text-xs font-semibold tracking-wide text-text">Instagram</span>\n          </a>' : '') + '\n\n          ' + (values.youtubeHandle ? '<a href="https://youtube.com/' + values.youtubeHandle + '" target="_blank" class="glass-btn rounded-xl p-3 flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1 text-center">\n            <span class="text-accent text-xl group-hover:scale-125 transition-transform duration-300 pb-1">▶️</span>\n            <span class="text-xs font-semibold tracking-wide text-text">YouTube</span>\n          </a>' : '') + '\n\n          ' + (values.threadsHandle ? '<a href="https://threads.net/@' + values.threadsHandle + '" target="_blank" class="glass-btn rounded-xl p-3 flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1 text-center">\n            <span class="text-accent text-xl group-hover:scale-125 transition-transform duration-300 pb-1">🧵</span>\n            <span class="text-xs font-semibold tracking-wide text-text">Threads</span>\n          </a>' : '') + '\n\n        </div>\n      </section>' : ''}

      <!-- QR Code Section -->
      ${values.profileUrl ? '\n      <section class="flex flex-col gap-3 reveal delay-[400ms]">\n        <h3 class="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-muted mb-1 px-1">Digital Hub</h3>\n        <div class="glass-panel bg-black/20 rounded-2xl p-4 flex items-center justify-between gap-5 relative overflow-hidden group">\n          <div class="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>\n          <div class="flex flex-col gap-1 z-10 flex-1 min-w-0">\n            <span class="text-sm font-semibold tracking-wide text-text">Scan to Connect</span>\n            <span class="text-xs text-muted truncate border-b border-white/10 pb-1 w-max block">' + values.profileUrl + '</span>\n          </div>\n          <div class="w-16 h-16 rounded-xl bg-white p-1.5 flex-shrink-0 shadow-[0_0_15px_theme(colors.accent)/20]">\n            <img src="qr-code.png" alt="QR Code" class="w-full h-full object-contain mix-blend-multiply" />\n          </div>\n        </div>\n      </section>' : ''}

      <!-- Action Buttons -->
      <footer class="mt-4 flex flex-col gap-3 reveal delay-[500ms]">
        
        ${values.cvUrl ? '<a href="' + values.cvUrl + '" target="_blank" class="w-full relative group overflow-hidden rounded-2xl p-4 flex items-center justify-center gap-3 bg-[theme(colors.glass)] border border-accent/40 shadow-[0_5px_15px_theme(colors.accent)/10] hover:shadow-[0_10px_30px_theme(colors.accent)/30] transition-all duration-300 hover:-translate-y-1">\n          <div class="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>\n          <span class="text-accent text-lg z-10">📄</span>\n          <span class="font-heading font-semibold text-text tracking-wide z-10">View Portfolio / CV</span>\n        </a>' : ''}
        
        <a href="contact.vcf" class="w-full relative group overflow-hidden rounded-2xl p-4 flex items-center justify-center gap-3 bg-accent text-[theme(colors.bg)] shadow-[0_0_20px_theme(colors.accent)/30] hover:shadow-[0_0_35px_theme(colors.accent)/50] transition-all duration-300 hover:-translate-y-1">
          <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-xl z-10 filter brightness-0">👤</span>
          <span class="font-heading font-bold tracking-wide z-10">Save Contact to Phone</span>
        </a>

      </footer>

    </div>
  </main>
  
  <p class="text-[0.65rem] text-muted tracking-widest uppercase mt-8 reveal pb-6 font-medium">Built with Creative Studio</p>

  <!-- Interactive Scripts -->
  <script>
    // 1. Scroll Reveal Animations
    document.addEventListener("DOMContentLoaded", () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('active');
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal').forEach((el) => {
        observer.observe(el);
      });
    });

    // 2. Premium Magnetic 3D Tilt Effect
    const wrapper = document.getElementById('tiltWrapper');
    const card = document.getElementById('tiltCard');
    
    if (wrapper && card && window.matchMedia("(pointer: fine)").matches) {
      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation degrees (max 6deg tilt)
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-2px)';
      });
      
      wrapper.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    }
  </script>
</body>
</html>`;
}


export default function ExportButton({ values, cardTemplate, landingTemplate, activeDims }) {
  const [state, setState] = useState('idle');

  const handleExport = async () => {
    setState('loading');
    try {
      const zip = new JSZip();
      const dims = activeDims;

      const cardEl = document.getElementById('card-export-target');
      if (cardEl) {
        const clone = cardEl.cloneNode(true);
        clone.style.transform = 'none';
        clone.style.position = 'fixed';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.width = `${dims.width}px`;
        clone.style.height = `${dims.height}px`;
        clone.style.borderRadius = '16px';
        clone.style.overflow = 'hidden';
        document.body.appendChild(clone);
        try {
          const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: cardTemplate.theme.bg,
            logging: false,
            width: dims.width,
            height: dims.height,
          });
          const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
          zip.file('business-card.png', blob);
        } finally {
          document.body.removeChild(clone);
        }
      }

      const profileUrl = values.profileUrl || `mailto:${values.userEmail}` || 'https://yourpage.com';
      const qrDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: cardTemplate.theme.accent,
          light: cardTemplate.theme.bg,
        },
      });
      const qrBase64 = qrDataUrl.split(',')[1];
      zip.file('qr-code.png', qrBase64, { base64: true });

      const landingHTML = generateLandingHTML(landingTemplate.theme, values);
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

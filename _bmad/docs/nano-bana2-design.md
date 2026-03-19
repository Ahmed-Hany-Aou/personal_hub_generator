# Nano Bana2 Design Suite Documentation

## Visual Identity
The Nano Bana2 suite is designed with a high-fidelity "Cyber-Tech" aesthetic. It emphasizes readability, dark backgrounds, and cyan/teal accents to create a futuristic and professional impression.

### Color Palette
- **Primary Accent:** `#00ffff` (Cyan) - Used for borders, icons, and highlights.
- **Background:** `#0a0f1e` (Dark Navy/Blue-Black) - Provides a high-contrast foundation.
- **Text (Primary):** `#ffffff` (White) - For names and main labels.
- **Text (Secondary):** `#94a3b8` (Slate-Gray) - For titles, labels, and descriptions.

### Interactive Elements
1. **Rotating Ring:** The profile picture is encased in a dual-gradient ring that rotates continuously at 10s intervals.
2. **Pulse Overlay:** A subtle radial gradient pulses across the landing card background every 4 seconds to add depth.
3. **Contact Items:** Use a glassmorphic background (`rgba(255, 255, 255, 0.03)`) with hover states that transition icons and text colors.

### CSS Customization
The following CSS variables are exposed for the Elite Studio property editor:
- `--primary`: The main accent color.
- `--bg`: The background color of the landing page and cards.
- `--text`: The main text color.
- `--pulse-duration`: The speed of the background pulse animation.

### Placeholder Integration
The suite uses the following BMAD placeholders:
- `{{fullName}}`
- `{{jobTitle}}`
- `{{companyName}}` (Business card only)
- `{{userEmail}}`
- `{{userPhone}}`
- `{{githubUsername}}`
- `{{linkedinUsername}}`
- `{{profileUrl}}` (QR code link)

# Creative Studio – Digital Card Generator

## Overview
A full-featured digital identity studio. Users pick a template, fill in their details, and export a ZIP containing:
- A high-resolution business card PNG
- A mobile-friendly landing page (HTML)
- A vCard contact file (.vcf)
- A QR code PNG

## Architecture

### Frontend-only (React + Vite)
- No backend server required — all data is served as static JSON files
- QR codes generated client-side with the `qrcode` package
- Card-to-image export using `html2canvas`
- ZIP packaging using `jszip`

### Project Layout
```
client/
  src/
    App.jsx                   # Router (Gallery / Editor routes)
    pages/
      Gallery.jsx             # Template selection grid
      Editor.jsx              # Full editor with card + landing tabs
    components/
      CardCanvas.jsx          # Full-size live business card preview
      LandingPreview.jsx      # Mobile landing page live preview
      PropertyPanel.jsx       # Left-side form panel
      CardMiniPreview.jsx     # Thumbnail preview in gallery
      ExportButton.jsx        # One-click ZIP export (all 4 files)
  public/
    templates/
      manifest.json           # List of template IDs
      template-gemini-dark.json
      template-minimal-light.json
      template-purple-gradient.json
  vite.config.js              # Vite on 0.0.0.0:5000, allowedHosts: true

templates/gallery/            # Source templates (copied to client/public)
server/index.js               # Express API (optional, not used in dev)
```

## Workflow
- `npm run dev` → Vite dev server on port 5000
- `npm run build` → builds to `dist/` for static deployment

## Adding a New Template
1. Create `templates/gallery/template-<id>.json` with `id`, `name`, `category`, `tags`, `description`, `theme`, `placeholders`
2. Copy to `client/public/templates/<id>.json`
3. Add the ID to `client/public/templates/manifest.json`

## Dependencies
- react, react-dom, react-router-dom — UI framework
- vite, @vitejs/plugin-react — build tooling
- html2canvas — card-to-PNG export
- jszip — ZIP packaging
- qrcode — client-side QR code generation
- express, cors — optional API server (not used in current dev setup)
- qr-image, jimp — Node.js image tools (legacy CLI tools)

## Deployment
- Static site deployment (publicDir: "dist")
- Build command: `npm run build`

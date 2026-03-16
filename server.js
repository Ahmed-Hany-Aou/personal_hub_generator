import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import qr from 'qr-image';
import { Jimp, loadFont } from 'jimp';
import { SANS_64_WHITE, SANS_64_BLACK, SANS_32_BLACK, SANS_32_WHITE } from 'jimp/fonts';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

import { v4 as uuidv4 } from 'uuid';
import { AdvancedConfigSchema } from './validators/registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

// --- LEGACY CONVERTER ---
function convertLegacyConfig(data) {
    // Handle wrapped designs { id, config: { ... } } vs flat configs
    const answers = data.config || data;
    console.log("♻️ Legacy Detector: Converting old config structure...");
    
    return {
        fullName: answers.fullName || 'User',
        jobTitle: answers.jobTitle || '',
        accentColor: answers.accentColor || '#6366f1',
        migratedFrom: 'v1-dynamic',
        pages: [{
            slug: 'index',
            name: 'Home',
            theme: answers.landingPage?.theme || 'glass',
            components: answers.landingPage?.components || [
                { type: 'profile', data: { name: answers.fullName, jobTitle: answers.jobTitle, profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=user' } },
                { type: 'footer', data: { footerText: 'Elite Design Suite' } }
            ]
        }],
        activePageSlug: 'index',
        printableCard: answers.printableCard || {
            layers: [
                { type: 'text', content: answers.fullName || 'User', x: 80, y: 150, style: { color: 'white' } },
                { type: 'qr', x: 680, y: 150, size: 300 }
            ]
        }
    };
}

// --- HELPERS ---
// ... (renderTemplate, renderComponent, renderLayout, compositeLayers remain similar but potentially hardened)
function renderTemplate(template, data) {
    let result = template;
    const sectionRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
    result = result.replace(sectionRegex, (match, key, content) => {
        if (Array.isArray(data[key])) {
            return data[key].map(item => {
                let subContent = content;
                for (const k in item) {
                    subContent = subContent.replace(new RegExp(`{{${k}}}`, 'g'), item[k]);
                }
                return subContent;
            }).join('\n');
        }
        return data[key] ? content : '';
    });
    for (const key in data) {
        if (typeof data[key] === 'string' || typeof data[key] === 'number') {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        }
    }
    return result;
}

const COMPONENT_REGISTRY = {
    profile: 'components/profile.html',
    'link-item': 'components/link-item.html',
    'social-icons': 'components/social-icons.html',
    footer: 'components/footer.html',
    'cta-button': 'components/cta-button.html',
    'lead-form': 'components/lead-form.html'
};

function renderComponent(type, data, index = 0) {
    const templatePath = path.join(__dirname, COMPONENT_REGISTRY[type]);
    if (!fs.existsSync(templatePath)) return `<!-- Component ${type} not found -->`;
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // Inject dynamic animation delay based on index
    const enhancedData = { 
        ...data, 
        animationDelay: `${0.2 + (index * 0.1)}s` 
    };
    
    return renderTemplate(template, enhancedData);
}

function renderLayout(layoutConfig, sessionData) {
    const theme = layoutConfig.theme || 'glass';
    const templateFile = `base-${theme}.html`;
    const templatePath = path.join(__dirname, 'templates', templateFile);
    
    let baseTemplate;
    if (fs.existsSync(templatePath)) {
        baseTemplate = fs.readFileSync(templatePath, 'utf8');
    } else {
        baseTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'base-glass.html'), 'utf8');
    }

    const componentsHtml = layoutConfig.components.map((comp, idx) => {
        // Merge sessionData (global) with component data, but local data MUST win
        const componentData = { ...sessionData, ...comp.data };
        return renderComponent(comp.type, componentData, idx);
    }).join('\n');
    let html = baseTemplate.replace('{{components}}', componentsHtml);
    
    // Global data replacement
    html = html.replace(/{{fullName}}/g, sessionData.fullName || '');
    html = html.replace(/{{jobTitle}}/g, sessionData.jobTitle || '');
    html = html.replace(/{{accentColor}}/g, sessionData.accentColor || '#6366f1');
    html = html.replace(/{{designId}}/g, sessionData.id || '');
    
    // Inject Meta Tags
    const metaTags = `
        <title>${sessionData.seo?.title || sessionData.fullName || 'Personal Hub'}</title>
        <meta name="description" content="${sessionData.seo?.description || ''}">
        <meta property="og:title" content="${sessionData.seo?.title || sessionData.fullName || 'Personal Hub'}">
        <meta property="og:description" content="${sessionData.seo?.description || ''}">
        <meta property="og:image" content="${sessionData.seo?.ogImage || ''}">
        <meta property="og:type" content="website">
    `;
    html = html.replace('<!-- META_TAGS -->', metaTags);

    return html;
}

async function compositeLayers(card, layers, sessionDir) {
    for (const layer of layers) {
        try {
            if (layer.type === 'image') {
                const imgPath = layer.src.startsWith('uploads') ? path.join(__dirname, layer.src) : path.join(sessionDir, layer.src);
                if (fs.existsSync(imgPath)) {
                    const img = await Jimp.read(imgPath);
                    if (layer.width && layer.height) img.resize({ w: layer.width, h: layer.height });
                    card.composite(img, layer.x, layer.y);
                }
            } else if (layer.type === 'text') {
                const font = await loadFont(layer.style.color === 'white' ? SANS_64_WHITE : SANS_64_BLACK);
                card.print({ font, x: layer.x, y: layer.y, text: layer.content });
            } else if (layer.type === 'qr') {
                const qrPath = path.join(sessionDir, 'qr_code.png');
                if (fs.existsSync(qrPath)) {
                    const qrImg = await Jimp.read(qrPath);
                    qrImg.resize({ w: layer.size || 200, h: layer.size || 200 });
                    card.composite(qrImg, layer.x, layer.y);
                }
            }
        } catch (e) {
            console.warn(`Layer Compositor Warning: Failed to process layer ${layer.type}`, e.message);
        }
    }
}

// --- API ---

app.post('/generate', upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]), async (req, res) => {
    const sessionId = uuidv4();
    const sessionDir = path.join(__dirname, 'temp', `session_${sessionId}`);
    
    try {
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

        let rawConfig = req.body.advancedConfig ? 
            (typeof req.body.advancedConfig === 'string' ? JSON.parse(req.body.advancedConfig) : req.body.advancedConfig) : 
            convertLegacyConfig(req.body);

        // --- ZOD VALIDATION ---
        const config = AdvancedConfigSchema.parse(rawConfig);

        const files = req.files || {};
        if (files['profilePic'] && files['profilePic'][0]) {
            const ext = path.extname(files['profilePic'][0].originalname) || '.png';
            const uuidName = `${uuidv4()}${ext}`;
            fs.copyFileSync(files['profilePic'][0].path, path.join(sessionDir, 'profile_pic.png'));
            // In a real persistence layer, we'd save uuidName to the designs DB
        }

        const vCardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.fullName}\nEND:VCARD`;
        fs.writeFileSync(path.join(sessionDir, 'contact.vcf'), vCardContent);

        const htmlContent = renderLayout(config.landingPage, config);
        fs.writeFileSync(path.join(sessionDir, 'index.html'), htmlContent);

        const qr_svg = qr.image(config.baseUrl || 'https://bmad-elite.com', { type: 'png' });
        const qrPath = path.join(sessionDir, 'qr_code.png');
        const qrStream = fs.createWriteStream(qrPath);
        qr_svg.pipe(qrStream);
        await new Promise((resolve) => qrStream.on('finish', resolve));

        const card = new Jimp({ width: 1050, height: 600, color: 0x0f172aff });
        await compositeLayers(card, config.printableCard.layers, sessionDir);
        await card.write(path.join(sessionDir, 'final_card_with_qr.png'));

        const zip = new AdmZip();
        zip.addLocalFolder(sessionDir);
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=Studio_${sessionId}.zip`);
        res.send(zip.toBuffer());

    } catch (err) {
        console.error("Studio Engine Error:", err);
        const status = err.name === 'ZodError' ? 400 : 500;
        res.status(status).json({ 
            message: "Studio Engine Error", 
            details: err.errors || err.message 
        });
    } finally {
        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        if (req.files) {
            Object.values(req.files).flat().forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
        }
    }
});

// --- PUBLIC API (Stateless) ---
const PUBLIC_API_KEY = 'elite-dev-123';

app.post('/api/v1/generate', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== PUBLIC_API_KEY) return res.status(401).json({ error: "Invalid or missing API Key" });

    try {
        const config = AdvancedConfigSchema.parse(req.body);
        const activePage = config.pages.find(p => p.slug === config.activePageSlug) || config.pages[0];
        
        if (!activePage) return res.status(400).json({ error: "No page found in config" });

        const htmlContent = renderLayout(activePage, config);
        
        res.set('Content-Type', 'text/html');
        res.send(htmlContent);
    } catch (err) {
        const details = err.name === 'ZodError' ? err.errors : err.message;
        res.status(400).json({ error: "Generation Failed", details });
    }
});

// --- PREVIEW API (Real-time) ---
app.post('/api/preview', async (req, res) => {
    try {
        let rawConfig = req.body.advancedConfig ? 
            (typeof req.body.advancedConfig === 'string' ? JSON.parse(req.body.advancedConfig) : req.body.advancedConfig) : 
            convertLegacyConfig(req.body);

        const config = AdvancedConfigSchema.parse(rawConfig);
        const activePage = config.pages.find(p => p.slug === config.activePageSlug) || config.pages[0];
        
        if (!activePage) return res.status(400).json({ error: "No page found in config" });

        const htmlContent = renderLayout(activePage, config);
        
        res.set('Content-Type', 'text/html');
        res.send(htmlContent);
    } catch (err) {
        const details = err.name === 'ZodError' ? err.errors : err.message;
        res.status(400).json({ error: "Preview Failed", details });
    }
});

// --- ASSET LIBRARY API ---
const ASSETS_DIR = path.join(__dirname, 'designs', 'assets');
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

app.post('/api/assets/upload', upload.single('asset'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const ext = path.extname(req.file.originalname);
    const assetId = uuidv4();
    const assetPath = path.join(ASSETS_DIR, `${assetId}${ext}`);
    
    fs.copyFileSync(req.file.path, assetPath);
    fs.unlinkSync(req.file.path);
    
    res.json({ 
        id: assetId, 
        name: req.file.originalname, 
        url: `/designs/assets/${assetId}${ext}`,
        ext
    });
});

app.get('/api/assets', (req, res) => {
    if (!fs.existsSync(ASSETS_DIR)) return res.json([]);
    const files = fs.readdirSync(ASSETS_DIR);
    const assets = files.map(f => ({
        id: path.parse(f).name,
        name: f,
        url: `/designs/assets/${f}`
    }));
    res.json(assets);
});

// Serve assets directory
app.use('/designs/assets', express.static(ASSETS_DIR));

// --- PERSISTENCE API ---
const DESIGNS_DIR = path.join(__dirname, 'designs');
if (!fs.existsSync(DESIGNS_DIR)) fs.mkdirSync(DESIGNS_DIR);

app.post('/api/save', async (req, res) => {
    try {
        const config = AdvancedConfigSchema.parse(req.body.config);
        const designId = req.body.id || uuidv4();
        const designPath = path.join(DESIGNS_DIR, `${designId}.json`);
        
        const designData = {
            id: designId,
            lastModified: new Date().toISOString(),
            config
        };
        
        fs.writeFileSync(designPath, JSON.stringify(designData, null, 2));
        res.json({ message: "Design saved successfully", id: designId });
    } catch (err) {
        res.status(400).json({ error: "Save Failed", details: err.errors || err.message });
    }
});

app.get('/api/designs', (req, res) => {
    const files = fs.readdirSync(DESIGNS_DIR).filter(f => f.endsWith('.json'));
    const designs = files.map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(DESIGNS_DIR, f), 'utf8'));
        return { id: data.id, fullName: data.config.fullName, lastModified: data.lastModified };
    });
    res.json(designs);
});

app.get('/api/designs/:id', (req, res) => {
    const designPath = path.join(DESIGNS_DIR, `${req.params.id}.json`);
    if (fs.existsSync(designPath)) {
        res.json(JSON.parse(fs.readFileSync(designPath, 'utf8')));
    } else {
        res.status(404).json({ error: "Design not found" });
    }
});

// --- ANALYTICS ENGINE ---
function logActivity(designId, type, data = {}) {
    const logDir = path.join(__dirname, 'designs', 'analytics');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logFile = path.join(logDir, `${designId}.jsonl`);
    const entry = JSON.stringify({
        timestamp: new Date().toISOString(),
        type,
        ...data
    }) + '\n';
    fs.appendFile(logFile, entry, (err) => {
        if (err) console.error("Analytics Log Error:", err);
    });
}

app.post('/api/analytics/track', async (req, res) => {
    const { designId, type, details } = req.body;
    if (!designId || !type) return res.status(400).json({ error: "Missing tracking data" });
    
    logActivity(designId, type, details);

    // Webhook Proxy for Lead Capture
    if (type === 'lead_capture') {
        const designPath = path.join(DESIGNS_DIR, `${designId}.json`);
        if (fs.existsSync(designPath)) {
            const design = JSON.parse(fs.readFileSync(designPath, 'utf8'));
            if (design.config?.globalLeadWebhook) {
                try {
                    fetch(design.config.globalLeadWebhook, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            designId,
                            timestamp: new Date().toISOString(),
                            lead: details
                        })
                    }).catch(err => console.error("Webhook Delivery Failed:", err.message));
                } catch (err) {
                    console.error("Webhook Dispatch Error:", err);
                }
            }
        }
    }

    res.json({ status: "tracked" });
});

// --- AI INTELLIGENCE API ---
app.post('/api/ai/suggest-palette', async (req, res) => {
    try {
        const { assetUrl } = req.body;
        if (!assetUrl) return res.status(400).json({ error: "No asset URL provided" });

        // Security check: Only allow local assets
        if (!assetUrl.startsWith('/designs/assets/')) {
             return res.status(403).json({ error: "Only internal assets supported" });
        }

        const fileName = path.basename(assetUrl);
        const filePath = path.join(ASSETS_DIR, fileName);

        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Asset not found" });

        const image = await Jimp.read(filePath);
        image.resize({ w: 100, h: 100 }); // Downscale for performance

        const colors = {};
        for (let x = 0; x < image.bitmap.width; x++) {
            for (let y = 0; y < image.bitmap.height; y++) {
                const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
                // Skip transparent or near-black/near-white pixels for better vibrancy
                if (pixel.a < 200) continue;
                const brightness = (pixel.r + pixel.g + pixel.b) / 3;
                if (brightness < 30 || brightness > 230) continue;

                // Simple quantization to group similar colors
                const k = `${Math.round(pixel.r/20)*20},${Math.round(pixel.g/20)*20},${Math.round(pixel.b/20)*20}`;
                colors[k] = (colors[k] || 0) + 1;
            }
        }

        // Sort to find dominant
        const dominant = Object.entries(colors).sort((a,b) => b[1] - a[1])[0];
        if (!dominant) return res.json({ primary: '#6366f1', secondary: '#4f46e5', theme: 'glass' });

        const rgb = dominant[0].split(',').map(Number);
        const hex = "#" + rgb.map(x => x.toString(16).padStart(2, '0')).join('');

        res.json({
            primary: hex,
            secondary: hex + 'cc',
            theme: brightnessSum(rgb) > 380 ? 'minimal' : 'glass'
        });

    } catch (err) {
        console.error("AI Palette Error:", err);
        res.status(500).json({ error: "Failed to generate palette" });
    }
});

function brightnessSum(rgb) { return rgb[0] + rgb[1] + rgb[2]; }

app.get('/public-view.html', (req, res) => {
    const designId = req.query.id;
    const designsDir = path.join(__dirname, 'designs');
    const designPath = path.join(designsDir, `${designId}.json`);

    if (!designId || !fs.existsSync(designPath)) {
        return res.status(404).send('<h1>Design Not Found</h1>');
    }

    const design = JSON.parse(fs.readFileSync(designPath, 'utf8'));
    
    // Auto-log view
    logActivity(designId, 'view', {
        userAgent: req.headers['user-agent'],
        referrer: req.headers['referrer'] || req.headers['referer'] || 'direct'
    });

    // Multi-page routing
    const pageSlug = req.query.page || 'index';
    const pageConfig = (design.config.pages || []).find(p => p.slug === pageSlug) || 
                       (design.config.pages || [])[0] ||
                       { components: [] };

    // Render the layout using the requested page's config
    const html = renderLayout(pageConfig, design.config);
    res.send(html);
});

app.post('/api/designs/:id/publish', (req, res) => {
    const designPath = path.join(DESIGNS_DIR, `${req.params.id}.json`);
    if (fs.existsSync(designPath)) {
        const data = JSON.parse(fs.readFileSync(designPath, 'utf8'));
        data.published = true;
        fs.writeFileSync(designPath, JSON.stringify(data, null, 2));
        res.json({ message: "Design published!", url: `/public-view.html?id=${req.params.id}` });
    } else {
        res.status(404).json({ error: "Design not found" });
    }
});

app.get('/api/gallery', (req, res) => {
    if (!fs.existsSync(DESIGNS_DIR)) return res.json([]);
    const files = fs.readdirSync(DESIGNS_DIR).filter(f => f.endsWith('.json'));
    const published = files
        .map(f => JSON.parse(fs.readFileSync(path.join(DESIGNS_DIR, f), 'utf8')))
        .filter(d => d.published)
        .map(d => ({ id: d.id, fullName: d.config.fullName, lastModified: d.lastModified }));
    res.json(published);
});

// --- TEMPLATE GALLERY API ---
const GALLERY_TEMPLATES_DIR = path.join(__dirname, 'templates', 'gallery');
app.get('/api/templates', (req, res) => {
    if (!fs.existsSync(GALLERY_TEMPLATES_DIR)) return res.json([]);
    const files = fs.readdirSync(GALLERY_TEMPLATES_DIR).filter(f => f.endsWith('.json'));
    const templates = files.map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(GALLERY_TEMPLATES_DIR, f), 'utf8'));
        return {
            id: path.parse(f).name,
            name: data.name,
            description: data.description,
            config: data.config
        };
    });
    res.json(templates);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n------------------------------------------------`);
    console.log(`🧙 BMAD ELITE SaaS is LIVE at http://localhost:${PORT}`);
    console.log(`------------------------------------------------\n`);
});

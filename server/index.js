import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import qr from 'qr-image';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const templatesDir = path.join(__dirname, '../client/public/templates');

function loadTemplates() {
  const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(templatesDir, f), 'utf-8');
    return JSON.parse(raw);
  });
}

app.get('/api/templates', (req, res) => {
  try {
    res.json(loadTemplates());
  } catch (err) {
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

app.get('/api/templates/:id', (req, res) => {
  try {
    const templates = loadTemplates();
    const t = templates.find(t => t.id === req.params.id);
    if (!t) return res.status(404).json({ error: 'Template not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load template' });
  }
});

app.post('/api/qr', (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    const qrBuffer = qr.imageSync(url, { type: 'png', size: 8 });
    res.set('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

app.listen(PORT, 'localhost', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

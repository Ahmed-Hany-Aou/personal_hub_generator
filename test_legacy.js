
import { AdvancedConfigSchema } from './validators/registry.js';
import fs from 'fs';

const legacyContent = JSON.parse(fs.readFileSync('templates/gallery/test_1.json', 'utf8'));

// The server.js does this:
function convertLegacyConfig(data) {
    const answers = data.config || data;
    return {
        fullName: answers.fullName || 'User',
        jobTitle: answers.jobTitle || '',
        accentColor: answers.accentColor || '#6366f1',
        pages: [{
            slug: 'index',
            name: 'Home',
            theme: answers.landingPage?.theme || 'glass',
            components: answers.landingPage?.components || []
        }],
        activePageSlug: 'index'
    };
}

try {
    const converted = convertLegacyConfig(legacyContent);
    AdvancedConfigSchema.parse(converted);
    console.log("✅ Converted Legacy Validation Success");
} catch (err) {
    console.error("❌ Converted Legacy Validation Failed:", err.errors.map(e => `${e.path.join('.')}: ${e.message}`));
}

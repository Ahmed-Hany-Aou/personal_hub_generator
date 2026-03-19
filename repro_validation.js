
import { AdvancedConfigSchema } from './validators/registry.js';

const testConfig = {
    fullName: 'Ahmed Hany',
    jobTitle: 'Lead Designer',
    accentColor: '#6366f1',
    pages: [
        {
            slug: 'index',
            name: 'Home',
            theme: 'glass',
            components: [
                { type: 'profile', data: { profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=AH', name: 'Ahmed Hany', jobTitle: 'Lead Designer' } },
                { type: 'link-item', data: { url: 'https://github.com/Ahmed-Hany-Aou', label: '🚀 My GitHub' } }
            ]
        }
    ],
    activePageSlug: 'index'
};

try {
    AdvancedConfigSchema.parse(testConfig);
    console.log("✅ Basic Validation Success");
} catch (err) {
    console.error("❌ Basic Validation Failed:", err.errors);
}

const badConfig = {
    fullName: 'Ahmed Hany',
    pages: [] // Missing name/slug/theme etc in elements
};

try {
    AdvancedConfigSchema.parse(badConfig);
    console.log("✅ Empty Pages Validation Success");
} catch (err) {
    console.log("❌ Empty Pages Validation (Expected Failure):", err.errors.map(e => `${e.path.join('.')}: ${e.message}`));
}

/**
 * Elite Hub SDK v1.0
 * The programmatic way to generate and embed high-end Personal Hubs.
 */
class EliteHub {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.baseUrl = options.baseUrl || 'http://localhost:3000';
    }

    /**
     * Internal validation for basic config requirements.
     */
    validateConfig(config) {
        if (!config.fullName) throw new Error("Validation Error: 'fullName' is required.");
        if (!Array.isArray(config.pages) || config.pages.length === 0) {
            throw new Error("Validation Error: 'pages' array must not be empty.");
        }
    }

    /**
     * Generate a production-ready Hub HTML string.
     * @param {Object} config - The AdvancedConfig object (Zod validated on server).
     * @returns {Promise<string>} - The rendered HTML.
     */
    async generate(config) {
        this.validateConfig(config);
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Generation Failed');
            }

            return await response.text();
        } catch (err) {
            console.error('[EliteHub SDK] Generation Error:', err.message);
            throw err;
        }
    }

    /**
     * Embed a Hub into a specific DOM element.
     * @param {HTMLElement} element - Target container.
     * @param {Object} config - The Hub configuration.
     */
    async embed(element, config) {
        element.innerHTML = '<p style="color: grey; font-family: sans-serif;">Elite Engine Initializing...</p>';
        try {
            const html = await this.generate(config);
            
            // Create a shadow DOM or iframe to isolate styles
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.minHeight = '600px';
            
            element.innerHTML = '';
            element.appendChild(iframe);
            
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(html);
            iframe.contentWindow.document.close();
        } catch (err) {
            element.innerHTML = `<p style="color: red;">[Elite SDK Error]: ${err.message}</p>`;
        }
    }
}

// Export for module systems or attach to window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EliteHub;
} else {
    window.EliteHub = EliteHub;
}

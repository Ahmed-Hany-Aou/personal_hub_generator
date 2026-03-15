import { z } from 'zod';

// --- COMPONENT SCHEMAS ---
export const ComponentSchemas = {
    profile: z.object({
        name: z.string().min(1),
        title: z.string().optional(),
        profileImage: z.string().optional()
    }),
    'link-item': z.object({
        url: z.string().url(),
        label: z.string().min(1)
    }),
    'social-icons': z.object({
        links: z.array(z.object({
            url: z.string().url(),
            label: z.string()
        }))
    }),
    footer: z.object({
        footerText: z.string()
    }),
    'cta-button': z.object({
        label: z.string().min(1),
        url: z.string().url(),
        style: z.enum(['pulse', 'solid', 'outline']).default('solid'),
        color: z.string().optional()
    }),
    'lead-form': z.object({
        title: z.string().min(1),
        successMessage: z.string().optional(),
        fields: z.array(z.string()).default(['Name', 'Email']),
        webhookUrl: z.string().url().optional()
    })
};

// --- LAYER SCHEMAS (Card) ---
export const LayerSchemas = {
    image: z.object({
        type: z.literal('image'),
        src: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number().optional(),
        height: z.number().optional()
    }),
    text: z.object({
        type: z.literal('text'),
        content: z.string(),
        x: z.number(),
        y: z.number(),
        style: z.object({
            size: z.number().optional(),
            color: z.enum(['white', 'black']).default('white')
        })
    }),
    qr: z.object({
        type: z.literal('qr'),
        x: z.number(),
        y: z.number(),
        size: z.number().optional()
    })
};

// --- MAIN CONFIG SCHEMA ---
export const AdvancedConfigSchema = z.object({
    fullName: z.string(),
    jobTitle: z.string().optional(),
    accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#6366f1'),
    baseUrl: z.string().url().optional(),
    
    // DEPRECATED: Focus on state.pages
    landingPage: z.object({
        theme: z.string().default('glass'),
        components: z.array(z.object({
            type: z.string(),
            data: z.any()
        }))
    }).optional(),

    pages: z.array(z.object({
        slug: z.string(),
        name: z.string(),
        theme: z.string().default('glass'),
        components: z.array(z.object({
            type: z.string(),
            data: z.any()
        }))
    })).default([]),

    activePageSlug: z.string().default('index'),
    globalLeadWebhook: z.string().url().optional(),

    seo: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        ogImage: z.string().optional()
    }).default({}),

    printableCard: z.object({
        layers: z.array(z.discriminatedUnion('type', [
            LayerSchemas.image,
            LayerSchemas.text,
            LayerSchemas.qr
        ]))
    }).optional()
});

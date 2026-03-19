import { z } from 'zod';

// --- COMPONENT SCHEMAS ---
export const ComponentSchemas = {
    profile: z.object({
        name: z.string().min(1),
        title: z.string().optional(),
        profileImage: z.string().optional()
    }),
    'link-item': z.object({
        url: z.string().url().or(z.string().regex(/^(mailto:|tel:|{{).*$/)),
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
        url: z.string().url().or(z.string().regex(/^(mailto:|tel:|{{).*$/)),
        style: z.enum(['pulse', 'solid', 'outline']).default('solid'),
        color: z.string().optional()
    }),
    'lead-form': z.object({
        title: z.string().min(1),
        successMessage: z.string().optional(),
        fields: z.array(z.string()).default(['Name', 'Email']),
        webhookUrl: z.string().url().optional()
    }),
    'contact-group': z.object({
        label: z.string().optional(),
        items: z.array(z.object({
            type: z.string(),
            data: z.any()
        }))
    }),
    'social-links': z.object({
        label: z.string().optional(),
        items: z.array(z.object({
            type: z.string(),
            data: z.any()
        }))
    }),
    'icon-card': z.object({
        icon: z.string().optional(),
        url: z.string().url().or(z.string().regex(/^(mailto:|tel:|{{).*$/)),
        label: z.string().optional()
    }),
    'qr-display': z.object({
        url: z.string().url().or(z.string().regex(/{{.*}}/)),
        style: z.string().optional()
    }),
    'nano-profile': z.object({
        profileImage: z.string().optional(),
        fullName: z.string().optional(),
        jobTitle: z.string().optional()
    }),
    'nano-contact-item': z.object({
        label: z.string().optional(),
        value: z.string().optional(),
        icon: z.string().optional()
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
    }),
    'contact-list': z.object({
        type: z.literal('contact-list'),
        x: z.number(),
        y: z.number(),
        items: z.array(z.string()).optional(),
        style: z.object({
            spacing: z.number().optional(),
            iconColor: z.string().optional()
        }).optional()
    })
};

// --- MAIN CONFIG SCHEMA ---
export const AdvancedConfigSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    jobTitle: z.string().optional(),
    accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#6366f1'),
    baseUrl: z.string().url().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    
    // DEPRECATED: Focus on state.pages
    landingPage: z.object({
        theme: z.string().default('glass'),
        components: z.array(z.object({
            type: z.string(),
            data: z.any()
        }))
    }).optional(),

    pages: z.array(z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        theme: z.string().default('glass'),
        components: z.array(z.object({
            type: z.string(),
            data: z.any()
        }))
    })).default([]),

    activePageSlug: z.string().default('index'),
    partyMode: z.boolean().default(false),
    globalLeadWebhook: z.string().url().optional().or(z.literal('')),

    seo: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        ogImage: z.string().optional()
    }).default({}),

    printableCard: z.object({
        layers: z.array(z.discriminatedUnion('type', [
            LayerSchemas.image,
            LayerSchemas.text,
            LayerSchemas.qr,
            LayerSchemas['contact-list']
        ]))
    }).optional()
});

import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/server/utils/admin-session';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';
import {
    CATEGORY_CLOUDINARY_MAP,
    SUPPORTED_CATEGORIES,
} from '@/server/cloudinary/client';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/cloudinary-status — returns config status of all accounts
// ─────────────────────────────────────────────────────────────────────────────

/** Human-readable labels for each category slug. */
const CATEGORY_LABELS: Record<string, string> = {
    'ai-images': 'AI Images',
    'product-shoot': 'Product Shoot',
    'video-prompts': 'Video Prompts',
    'portrait': 'Portrait & Headshot',
    'architecture': 'Architecture & Interior',
    'food-drink': 'Food & Drink',
    'logo-brand': 'Logo & Brand',
    'texture': 'Texture & Background',
    'fashion': 'Fashion & Style',
    'wallpaper': 'Wallpaper & Poster',
    'movie': 'Movie & Cinema',
};

export async function GET(req: Request) {
    const origin = getOrigin(req);
    const headers = corsHeaders(origin);

    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    // Rate limit
    const ip = getClientIP(req);
    const rl = generalLimit(ip);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please slow down.' },
            { status: 429, headers },
        );
    }

    const accounts = SUPPORTED_CATEGORIES.map((slug) => {
        const creds = CATEGORY_CLOUDINARY_MAP[slug];
        const cloudName = creds?.cloud_name ?? '';
        const configured = !!(creds?.cloud_name && creds?.api_key && creds?.api_secret);

        return {
            slug,
            label: CATEGORY_LABELS[slug] ?? slug,
            cloudName: cloudName || '',
            configured,
        };
    });

    return NextResponse.json({ success: true, data: accounts }, { status: 200, headers });
}

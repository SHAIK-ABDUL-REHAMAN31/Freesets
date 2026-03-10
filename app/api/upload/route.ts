import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { uploadImage } from '@/server/cloudinary/upload';
import { SUPPORTED_CATEGORIES } from '@/server/cloudinary/client';
import { verifyAdminSession } from '@/server/utils/admin-session';
import { handleApiError } from '@/server/utils/error';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { uploadLimit, getClientIP } from '@/lib/rateLimit';
import { sanitizeFilename } from '@/lib/sanitize';
import type { ApiResponse } from '@/types/api.types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;   // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100 MB

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UploadResponse {
    url: string;
    publicId: string;
    thumbnailUrl: string;
    cloudName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload?category=product-shoot — admin only
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    const origin = getOrigin(req);
    const headers = corsHeaders(origin);

    try {
        // 1. Verify admin session
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
        }

        // 2. Rate limit
        const ip = getClientIP(req);
        const rl = uploadLimit(ip);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                { status: 429, headers: { ...headers, 'Retry-After': String(Math.ceil((rl.retryAfterMs || 60000) / 1000)) } },
            );
        }

        // 3. Parse multipart form data
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'A file is required. Upload an image using the "file" form field.' },
                { status: 400, headers },
            );
        }

        // 4. Determine category — from query param or form field
        const url = new URL(req.url);
        const category =
            url.searchParams.get('category') ??
            (formData.get('category') as string | null) ??
            '';

        if (!category) {
            return NextResponse.json(
                { error: 'A "category" parameter is required (query param or form field).' },
                { status: 400, headers },
            );
        }

        if (!SUPPORTED_CATEGORIES.includes(category)) {
            return NextResponse.json(
                { error: `Invalid category "${category}". Supported: ${SUPPORTED_CATEGORIES.join(', ')}` },
                { status: 400, headers },
            );
        }

        // 5. Validate MIME type
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
            return NextResponse.json(
                { error: `Invalid file type "${file.type}". Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}` },
                { status: 400, headers },
            );
        }

        // 6. Validate file size
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size: ${isVideo ? '100MB for videos' : '10MB for images'}.` },
                { status: 413, headers },
            );
        }

        // 7. Sanitize filename and generate UUID public ID
        const _sanitizedName = sanitizeFilename(file.name);
        const _uniqueId = crypto.randomUUID();

        // 8. Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 9. Upload to the category-specific Cloudinary account
        const result = await uploadImage(buffer, category);

        // 10. Return upload result
        return NextResponse.json<ApiResponse<UploadResponse>>(
            {
                success: true,
                data: {
                    url: result.url,
                    publicId: result.publicId,
                    thumbnailUrl: result.thumbnailUrl,
                    cloudName: result.cloudName,
                },
            },
            { status: 201, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}

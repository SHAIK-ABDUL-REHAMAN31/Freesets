// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary URL transform helpers
//
// Each function now takes a `cloudName` parameter so URLs are built for
// the specific Cloudinary account the image lives in.
//
// Format: https://res.cloudinary.com/{cloudName}/image/upload/{transforms}/{publicId}
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://res.cloudinary.com';

// ─────────────────────────────────────────────────────────────────────────────
// getThumbnailUrl  — 400 px wide, WebP, quality 80
// ─────────────────────────────────────────────────────────────────────────────

export function getThumbnailUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/w_400,c_scale,q_80,f_webp/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getPreviewUrl  — 1200 px wide, WebP, quality 90
// ─────────────────────────────────────────────────────────────────────────────

export function getPreviewUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/w_1200,c_scale,q_90,f_webp/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getFreeDownloadUrl  — 800 px, quality 85, watermarked "freesets.io"
// ─────────────────────────────────────────────────────────────────────────────

export function getFreeDownloadUrl(publicId: string, cloudName: string): string {
    const transforms = [
        'w_800,c_scale,q_85',
        'l_text:Arial_28_bold:freesets.io,g_south_east,x_20,y_20,o_40,co_rgb:FFFFFF',
    ].join('/');

    return `${BASE}/${cloudName}/image/upload/${transforms}/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getProDownloadUrl  — original quality, no watermark
// ─────────────────────────────────────────────────────────────────────────────

export function getProDownloadUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/${publicId}`;
}

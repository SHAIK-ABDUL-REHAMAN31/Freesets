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
// getThumbnailUrl  — scaled to 400px width, WebP, quality 80
// Keeps original aspect ratio (c_scale = no crop, no distortion)
// A square → 400×400, portrait 9:16 → 400×711, landscape 16:9 → 400×225
// ─────────────────────────────────────────────────────────────────────────────

export function getThumbnailUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/c_scale,w_400,f_webp,q_80/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getPreviewUrl  — original quality, no transforms
// ─────────────────────────────────────────────────────────────────────────────

export function getPreviewUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/${publicId}`;
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

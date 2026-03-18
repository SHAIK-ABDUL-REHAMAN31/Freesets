// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary URL transform helpers
//
// Each function takes a `cloudName` parameter so URLs are built for
// the specific Cloudinary account the image lives in.
//
// Format: https://res.cloudinary.com/{cloudName}/image/upload/{transforms}/{publicId}
//
// Quality strategy:
//   - ALL display transforms use q_100 (zero compression)
//   - Cards use w_800 + dpr_2.0 → effective 1600px for retina screens
//   - Preview uses w_1600 + dpr_auto → up to 3200px on 2x displays
//   - Downloads use the original file where possible
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://res.cloudinary.com';

// ─────────────────────────────────────────────────────────────────────────────
// getThumbnailUrl  — 800px wide, WebP, q_100, progressive
// Used as a backward-compatible alias; prefer getCardUrl for new code.
// ─────────────────────────────────────────────────────────────────────────────

export function getThumbnailUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/c_scale,w_800,f_webp,q_100,fl_progressive/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getCardUrl  — masonry grid card image
//
// c_scale,w_800 → scale to 800px (logical), keeps original aspect ratio
// f_auto        → Cloudinary picks best format per browser
//                 (AVIF › WebP › JPEG — always highest quality for that browser)
// q_100         → zero compression / maximum quality
// fl_progressive→ progressive load (user sees image top-to-bottom immediately)
// dpr_2.0       → serves 1600px physical pixels for retina/HiDPI screens
//                 (iPhone, MacBook Retina, 4K monitors)
// ─────────────────────────────────────────────────────────────────────────────

export function getCardUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/c_scale,w_800,f_auto,q_100,fl_progressive,dpr_2.0/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getPreviewUrl  — full detail page image
//
// c_scale,w_1600 → 1600px wide (logical) for large screen detail view
// f_webp         → WebP format — smaller file, zero visible quality loss
// q_100          → zero compression
// fl_progressive → progressive load
// dpr_auto       → serves 2x (3200px) automatically on retina screens
// ─────────────────────────────────────────────────────────────────────────────

export function getPreviewUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/c_scale,w_1600,f_webp,q_100,fl_progressive,dpr_auto/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getFreeDownloadUrl  — download with watermark, original quality
//
// fl_attachment → forces browser to download, not preview
// q_100         → original quality — zero compression on download
// f_jpg         → standard JPG for maximum compatibility
// Watermark overlay preserved
// ─────────────────────────────────────────────────────────────────────────────

export function getFreeDownloadUrl(publicId: string, cloudName: string): string {
    const transforms = [
        'fl_attachment,q_100,f_jpg',
        'l_text:Arial_28_bold:freesets.io,g_south_east,x_20,y_20,o_40,co_rgb:FFFFFF',
    ].join('/');

    return `${BASE}/${cloudName}/image/upload/${transforms}/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getProDownloadUrl  — true original file, no reprocessing
//
// fl_attachment              → forces browser to download
// fl_original_transformation → serves the exact original file that was
//                              uploaded — zero processing, true lossless
// ─────────────────────────────────────────────────────────────────────────────

export function getProDownloadUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/fl_attachment,fl_original_transformation/${publicId}`;
}

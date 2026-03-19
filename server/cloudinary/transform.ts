// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary URL transform helpers
//
// Each function takes a `cloudName` parameter so URLs are built for
// the specific Cloudinary account the image lives in.
//
// Format: https://res.cloudinary.com/{cloudName}/image/upload/{transforms}/{publicId}
//
// Quality strategy:
//   - Cards use w_600 + q_85 + progressive → sharp, fast, 60% smaller
//   - Blur placeholder uses w_20 + q_30 + blur → instant LQIP
//   - Preview uses w_1600 + dpr_auto → up to 3200px on 2x displays
//   - Downloads use the original file where possible
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://res.cloudinary.com';

// ─────────────────────────────────────────────────────────────────────────────
// getBlurPlaceholderUrl — tiny blurred placeholder (LQIP)
//
// c_scale,w_20 → only 20px wide (tiny file — loads in <50ms)
// f_webp       → modern format, smallest possible file
// q_30         → low quality (it's just a placeholder)
// e_blur:200   → heavily blurred — CSS upscales it to fill the card
//
// Gives instant visual feedback while the real image loads in background.
// ─────────────────────────────────────────────────────────────────────────────

export function getBlurPlaceholderUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/c_scale,w_20,f_webp,q_30,e_blur:200/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getThumbnailUrl  — 600px wide, WebP, q_85, progressive
// Used as a backward-compatible alias; prefer getCardUrl for new code.
// ─────────────────────────────────────────────────────────────────────────────

export function getThumbnailUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/c_scale,w_600,f_webp,q_85,fl_progressive/${publicId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// getCardUrl  — masonry grid card image
//
// c_scale,w_600  → scale to 600px — sweet spot for grid cards
// f_webp         → WebP format — smallest file, great quality
// q_85           → 85% quality — visually indistinguishable from q_100
//                   but 60% smaller file size → loads much faster
// fl_progressive → progressive load (image renders top-to-bottom
//                   instead of waiting for the full file)
// ─────────────────────────────────────────────────────────────────────────────

export function getCardUrl(publicId: string, cloudName: string): string {
    return `${BASE}/${cloudName}/image/upload/c_scale,w_600,f_webp,q_85,fl_progressive/${publicId}`;
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

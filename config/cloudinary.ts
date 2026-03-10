// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary folder paths
// ─────────────────────────────────────────────────────────────────────────────

export const CLOUDINARY_FOLDERS = {
    IMAGES: 'freesets/images',
    VIDEOS: 'freesets/videos',
    THUMBNAILS: 'freesets/thumbnails',
    AVATARS: 'freesets/avatars',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary transformation presets
// These are passed directly to the Cloudinary SDK / URL builder.
// ─────────────────────────────────────────────────────────────────────────────

export const IMAGE_TRANSFORMS = {
    /** Gallery grid card — fast, small */
    THUMBNAIL: {
        width: 400,
        crop: 'scale',
        quality: 80,
        fetch_format: 'auto',
    },

    /** Full-screen preview / lightbox */
    PREVIEW: {
        width: 1200,
        crop: 'scale',
        quality: 90,
        fetch_format: 'auto',
    },

    /** Free-tier download — watermarked overlay at 800 px */
    FREE_DOWNLOAD: {
        width: 800,
        crop: 'scale',
        quality: 85,
        fetch_format: 'auto',
        overlay: {
            public_id: 'freesets/watermark',
            opacity: 40,
            gravity: 'south_east',
            x: 10,
            y: 10,
        },
    },

    /** Pro / Business download — original quality, no watermark */
    PRO_DOWNLOAD: {
        quality: 'auto',
        fetch_format: 'auto',
    },
} as const;

export type TransformPreset = keyof typeof IMAGE_TRANSFORMS;

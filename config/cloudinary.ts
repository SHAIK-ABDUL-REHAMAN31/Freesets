// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary folder paths
// ─────────────────────────────────────────────────────────────────────────────

export const CLOUDINARY_FOLDERS = {
    IMAGES: 'freesets/images',
    THUMBNAILS: 'freesets/thumbnails',
    AVATARS: 'freesets/avatars',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary transformation presets
// These are passed directly to the Cloudinary SDK / URL builder.
// ─────────────────────────────────────────────────────────────────────────────

export const IMAGE_TRANSFORMS = {
    /** Gallery grid card — maximum quality */
    THUMBNAIL: {
        width: 1200,
        crop: 'scale',
        quality: 100,
        fetch_format: 'auto',
    },

    /** Full-screen preview / lightbox — maximum quality */
    PREVIEW: {
        width: 2400,
        crop: 'scale',
        quality: 100,
        fetch_format: 'auto',
    },

    /** Free-tier download — watermarked overlay, maximum quality */
    FREE_DOWNLOAD: {
        width: 1600,
        crop: 'scale',
        quality: 100,
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
        quality: 100,
        fetch_format: 'auto',
    },
} as const;

export type TransformPreset = keyof typeof IMAGE_TRANSFORMS;

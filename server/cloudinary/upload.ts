import {
    getCloudinaryClient,
    CATEGORY_CLOUDINARY_MAP,
} from '@/server/cloudinary/client';
import { getThumbnailUrl } from '@/server/cloudinary/transform';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UploadResult {
    url: string;
    publicId: string;
    thumbnailUrl: string;
    cloudName: string;
    width: number;
    height: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// uploadImage
//
// Uploads an image buffer to the Cloudinary account associated with `category`.
// Images are stored in folder `freesets/{category}` inside that account.
//
// QUALITY STRATEGY — upload the original file completely unmodified.
//   • quality: 'auto:best'       → Cloudinary stores at highest quality
//   • fetch_format: 'auto'       → Cloudinary picks best format per browser
//   • flags: 'preserve_transparency' → keeps alpha channels (PNG etc.)
//   • format: ''                 → keep original upload format, no conversion
//   • overwrite: false           → never overwrite originals; use unique_filename
//   • unique_filename: true      → prevents accidental overwrites
//
// All display transformations (resize, DPR, format, quality) are applied
// ONLY when building the URL at display time via transform.ts.
// This preserves the original file forever.
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadImage(
    fileBuffer: Buffer,
    category: string,
    publicId?: string,
): Promise<UploadResult> {
    const cld = getCloudinaryClient(category);
    const cloudName = CATEGORY_CLOUDINARY_MAP[category]?.cloud_name ?? '';

    const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cld.uploader.upload_stream(
            {
                folder: `freesets/${category}`,
                ...(publicId && { public_id: publicId }),
                resource_type: 'image',
                // ── Store original at maximum quality ──────────────────────
                quality: 'auto:best',
                fetch_format: 'auto',
                flags: 'preserve_transparency',
                // No transformation on upload — keep the original
                // Transformations are applied only at display time (URL-based)
                use_filename: false,
                unique_filename: true,
                overwrite: false,
                invalidate: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            },
        );

        uploadStream.end(fileBuffer);
    });

    // thumbnailUrl stored in DB uses the new maximum-quality transform
    // (1200px · f_webp · q_100 · fl_progressive)
    return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnailUrl: getThumbnailUrl(result.public_id, cloudName),
        cloudName,
        width: result.width,
        height: result.height,
    };
}

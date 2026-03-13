import {
    getCloudinaryClient,
    CATEGORY_CLOUDINARY_MAP,
    VIDEO_CATEGORIES,
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
                overwrite: true,
                invalidate: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            },
        );

        uploadStream.end(fileBuffer);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnailUrl: getThumbnailUrl(result.public_id, cloudName),
        cloudName,
        width: result.width,
        height: result.height,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// uploadVideo
//
// Uploads a video buffer to the Cloudinary account for `category`.
// Only video-compatible categories are allowed ('video-prompts', 'movie').
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadVideo(
    fileBuffer: Buffer,
    category: string,
): Promise<UploadResult> {
    if (!VIDEO_CATEGORIES.includes(category as any)) {
        throw new Error(
            `Category "${category}" is not video-compatible. ` +
            `Allowed categories for video upload: ${VIDEO_CATEGORIES.join(', ')}`
        );
    }

    const cld = getCloudinaryClient(category);
    const cloudName = CATEGORY_CLOUDINARY_MAP[category]?.cloud_name ?? '';

    const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cld.uploader.upload_stream(
            {
                folder: `freesets/${category}`,
                resource_type: 'video',
                overwrite: true,
                invalidate: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            },
        );

        uploadStream.end(fileBuffer);
    });

    // Cloudinary auto-generates a thumbnail for videos at .jpg extension
    const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${result.public_id}.jpg`;

    return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnailUrl,
        cloudName,
        width: result.width || 0,
        height: result.height || 0,
    };
}

import { getCloudinaryClient, CATEGORY_CLOUDINARY_MAP } from '@/server/cloudinary/client';

// ─────────────────────────────────────────────────────────────────────────────
// generateSignedDownloadUrl
//
// Generate a time-limited signed URL for Pro users to download the full-res
// image. The URL expires after `expiresInSeconds` (default: 1 hour).
//
// Now requires a `category` slug to use the correct Cloudinary account.
// ─────────────────────────────────────────────────────────────────────────────

export function generateSignedDownloadUrl(
    publicId: string,
    category: string,
    expiresInSeconds: number = 3600,
): string {
    const cld = getCloudinaryClient(category);
    const apiSecret = CATEGORY_CLOUDINARY_MAP[category]?.api_secret;

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    return cld.url(publicId, {
        secure: true,
        sign_url: true,
        type: 'authenticated',
        resource_type: 'image',
        // Force download with the original filename
        flags: 'attachment',
        // Expire the signature after the specified duration
        transformation: [
            {
                sign_url: true,
            },
        ],
        auth_token: {
            key: apiSecret!,
            expiration: expiresAt,
        },
    });
}

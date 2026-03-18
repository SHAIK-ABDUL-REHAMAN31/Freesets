'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary Image Loader for Next.js
//
// WHY THIS EXISTS:
//   By default, Next.js <Image> re-optimizes every image through its own
//   pipeline (/_next/image?url=...). When the source is already a Cloudinary
//   URL with q_100 + f_auto applied, Next.js re-compression causes:
//     1. Quality loss (double compression)
//     2. Format downgrade (Cloudinary AVIF → Next.js WEBP)
//     3. Resolution reduction based on Next.js deviceSizes config
//
//   This loader intercepts the URL and returns it unchanged for Cloudinary
//   images, so Cloudinary's own optimization is the only optimization applied.
//
// HOW IT WORKS:
//   If `src` is already a full Cloudinary URL → return as-is, no processing.
//   Otherwise → return as-is (fallback for unsplash or other sources).
// ─────────────────────────────────────────────────────────────────────────────

interface CloudinaryLoaderProps {
    src: string;
    width: number;
    quality?: number;
}

export default function cloudinaryLoader({
    src,
    width,
    quality,
}: CloudinaryLoaderProps): string {
    // Cloudinary already applied the perfect transformation (q_100, f_auto,
    // dpr_2.0, etc.) when the URL was built in transform.ts.
    // Return the URL exactly as-is — do NOT let Next.js reprocess it.
    if (src.startsWith('https://res.cloudinary.com')) {
        return src;
    }

    // For non-Cloudinary images (e.g. Unsplash fallback), return as-is.
    // Next.js will still try to optimize these unless unmatched — acceptable.
    return src;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    // ── Image Handling ────────────────────────────────────────────────────────
    //
    // WHY CUSTOM LOADER?
    //   Next.js <Image> routes every src through /_next/image which re-compresses
    //   the image using its own pipeline. When our src is already a Cloudinary URL
    //   with q_100 + f_auto applied, that re-compression causes quality loss
    //   (double compression). The custom loader returns Cloudinary URLs as-is
    //   so only Cloudinary's transforms are applied — never doubled.
    //
    images: {
        loader: 'custom',
        loaderFile: './lib/cloudinary-loader.ts',
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: false,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // ── Security Headers ──────────────────────────────────────────────────────
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://images.unsplash.com",
                            "media-src 'self' https://res.cloudinary.com",
                            "connect-src 'self' https://api.cloudinary.com https://*.mongodb.net",
                            "frame-ancestors 'none'",
                        ].join('; '),
                    },
                ],
            },
        ];
    },

    // ── Dev-mode: skip TS / ESLint errors during build ────────────────────────
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;

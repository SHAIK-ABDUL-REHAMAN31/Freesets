import '@/lib/env';
import type { Metadata } from 'next';
import { Syne, DM_Sans, Bebas_Neue } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

// ─────────────────────────────────────────────────────────────────────────────
// Fonts
// ─────────────────────────────────────────────────────────────────────────────

const syne = Syne({
    subsets: ['latin'],
    variable: '--font-syne',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    display: 'swap',
});

const bebasNeue = Bebas_Neue({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bebas-neue',
    display: 'swap',
});

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
    title: {
        default: 'Freesets — Free AI Prompts & Assets',
        template: '%s | Freesets',
    },
    description:
        'Discover, copy, and download the best free AI prompts and assets for Midjourney, DALL-E, Stable Diffusion, Sora, Runway, and more. 10,000+ curated prompts across images, video, product photography, and beyond.',
    metadataBase: new URL(APP_URL),
    openGraph: {
        title: 'Freesets — Free AI Prompts & Assets',
        description:
            'The #1 free AI prompt library. Browse 10,000+ prompts for Midjourney, DALL-E, Stable Diffusion & more.',
        url: APP_URL,
        siteName: 'Freesets',
        type: 'website',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Freesets — Free AI Prompts & Assets',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Freesets — Free AI Prompts & Assets',
        description: 'Browse 10,000+ free AI prompts. Copy, download, create.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${syne.variable} ${dmSans.variable} ${bebasNeue.variable}`}>
            <body className="antialiased min-h-screen flex flex-col font-sans bg-background text-foreground">
                {children}

                {/* Toast notifications */}
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: '#1A1A1A',
                            color: '#F5F5F5',
                            border: '1px solid #2A2A2A',
                            fontSize: '14px',
                        },
                    }}
                />
            </body>
        </html>
    );
}

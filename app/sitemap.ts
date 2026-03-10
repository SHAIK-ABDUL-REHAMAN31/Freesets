import { MetadataRoute } from 'next';
import connectDB from '@/server/db/connect';
import Prompt from '@/server/db/models/Prompt.model';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const CATEGORY_SLUGS = [
    'ai-images',
    'video-prompts',
    'product-shoot',
    'portrait',
    'architecture',
    'food',
    'logo',
    'texture',
    'movie',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        await connectDB();

        // Fetch published prompts
        const prompts = await Prompt.find({ status: 'PUBLISHED' })
            .select('_id updatedAt')
            .lean()
            .exec();

        // 1. Static Routes
        const staticRoutes = [
            '',
            '/pricing',
            '/login',
            '/signup',
        ].map((route) => ({
            url: `${APP_URL}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: route === '' ? 1 : 0.8,
        }));

        // 2. Category Routes
        const categoryRoutes = CATEGORY_SLUGS.map((slug) => ({
            url: `${APP_URL}/category/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // 3. Dynamic Prompt Routes
        const dynamicPromptRoutes = prompts.map((prompt: any) => ({
            url: `${APP_URL}/prompt/${prompt._id.toString()}`,
            lastModified: new Date(prompt.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        return [...staticRoutes, ...categoryRoutes, ...dynamicPromptRoutes];
    } catch (error) {
        console.error('Error generating sitemap:', error);

        // Fallback sitemap if DB fails
        return [
            {
                url: APP_URL,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
        ];
    }
}

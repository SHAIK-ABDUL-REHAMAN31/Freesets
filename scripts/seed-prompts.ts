/**
 * scripts/seed-prompts.ts
 *
 * Seeds the database with:
 *   1. A default admin user
 *   2. 20 high-quality sample prompts across all 8 categories
 *   3. 2 sample collections for the admin user
 *
 * Run:  npm run seed
 */

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local explicitly since Next.js uses it
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ─── Inline connectDB (avoids path-alias issues in ts-node) ─────────────────

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('❌  MONGODB_URI is not defined. Add it to .env.local or .env');
    }
    await mongoose.connect(uri, { bufferCommands: false });
    console.log('✅  MongoDB connected —', mongoose.connection.host);
}

// ─── Import models using relative paths ─────────────────────────────────────


import Prompt from '../server/db/models/Prompt.model';


// ─── Constants ──────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'admin@freesets.io';
const ADMIN_PASSWORD = 'Admin@1234!';
const ADMIN_NAME = 'Freesets Admin';

const CLOUDINARY_BASE = 'https://res.cloudinary.com/demo/image/upload';

// ─── Sample Prompts ─────────────────────────────────────────────────────────

const SAMPLE_PROMPTS = [
    // ── AI_IMAGES (3) ────────────────────────────────────────────────────────
    {
        title: 'Neon Cyberpunk Alleyway',
        promptText: 'A hyper-detailed cinematic photograph of a rain-soaked cyberpunk alleyway at night. Neon signs in Japanese kanji reflect off wet asphalt puddles. Volumetric fog drifts through the scene, illuminated by pink and cyan neon tubes. A lone figure in a black trench coat walks away from camera. Shot on Arri Alexa, anamorphic lens flare, 8K resolution.',
        negativePrompt: 'blurry, daytime, cartoon, low quality, watermark',
        category: 'AI_IMAGES',
        subCategory: 'Sci-Fi',
        styleTags: ['cyberpunk', 'neon', 'cinematic', '8k', 'rain'],
        aiTools: ['MIDJOURNEY'],
        aspectRatio: '16:9',
    },
    {
        title: 'Enchanted Forest Portal',
        promptText: 'A magical forest clearing where ancient oak trees form a natural archway. Bioluminescent mushrooms glow soft blue and green along a mossy stone path. Fireflies dance in warm golden light filtering through the canopy. A mystical portal of swirling violet energy hovers between the trees. Fantasy art, matte painting style, incredibly detailed.',
        negativePrompt: 'modern buildings, cars, people, text',
        category: 'AI_IMAGES',
        subCategory: 'Fantasy',
        styleTags: ['fantasy', 'forest', 'magical', 'bioluminescent', 'ethereal'],
        aiTools: ['STABLE_DIFFUSION'],
        aspectRatio: '16:9',
    },
    {
        title: 'Floating Sky Islands Sunset',
        promptText: 'Breathtaking aerial view of floating islands suspended in a golden hour sky. Waterfalls cascade off the edges into clouds below. Lush green vegetation covers each island with small traditional Japanese temples nestled among cherry blossom trees. Dramatic volumetric god rays pierce through cumulus clouds. Studio Ghibli meets photorealism, octane render.',
        negativePrompt: 'dark, gloomy, modern city, aircraft',
        category: 'AI_IMAGES',
        subCategory: 'Fantasy',
        styleTags: ['floating islands', 'sunset', 'ghibli', 'epic', 'aerial'],
        aiTools: ['MIDJOURNEY'],
        aspectRatio: '16:9',
    },

    // ── VIDEO_PROMPTS (2) ────────────────────────────────────────────────────
    {
        title: 'Drone Through Ancient Ruins',
        promptText: 'Cinematic FPV drone shot gliding through crumbling ancient Greek temple ruins at golden hour. Camera weaves between massive Corinthian columns covered in moss and ivy. Dust particles float in warm sunbeams. Slow motion 120fps. Professional color grade with teal and orange palette. No people in frame.',
        negativePrompt: 'modern objects, tourists, shaky camera',
        category: 'VIDEO_PROMPTS',
        subCategory: 'Travel',
        styleTags: ['drone', 'ruins', 'cinematic', 'golden hour', 'slow motion'],
        aiTools: ['SORA'],
        aspectRatio: '16:9',
    },
    {
        title: 'Deep Ocean Bioluminescence',
        promptText: 'Underwater camera slowly descends into the deep ocean abyss. Bioluminescent jellyfish pulse with electric blue and violet light. Schools of translucent deep-sea fish dart past the lens. Particles of marine snow drift upward. The darkness is punctuated by sudden flashes of anglerfish lures. Macro lens details, National Geographic quality, 4K 60fps.',
        negativePrompt: 'surface, boats, scuba divers, bright daylight',
        category: 'VIDEO_PROMPTS',
        subCategory: 'Nature',
        styleTags: ['underwater', 'bioluminescent', 'deep sea', 'macro', 'nature'],
        aiTools: ['RUNWAY'],
        aspectRatio: '16:9',
    },

    // ── PRODUCT_SHOOT (3) ────────────────────────────────────────────────────
    {
        title: 'Luxury Perfume on Marble',
        promptText: 'High-end product photography of a crystal perfume bottle on polished white Carrara marble. Soft diffused studio lighting from the left creates gentle highlights and shadows. Fresh white peonies arranged in the background, slightly out of focus. Clean minimalist composition. Shot on Phase One 150MP, f/8, focus stacked.',
        negativePrompt: 'cheap looking, harsh shadows, cluttered background, text overlay',
        category: 'PRODUCT_SHOOT',
        subCategory: 'Beauty',
        styleTags: ['luxury', 'perfume', 'marble', 'minimalist', 'studio'],
        aiTools: ['DALLE'],
        aspectRatio: '1:1',
    },
    {
        title: 'Artisan Coffee Flat Lay',
        promptText: 'Overhead flat lay product photo of specialty coffee packaging. Kraft paper bag with custom label beside a ceramic pour-over dripper, scattered roasted coffee beans, and a small white espresso cup on a warm wood surface. Morning light streaming from the right. Cozy earth tone color palette. Editorial style, Kinfolk magazine aesthetic.',
        negativePrompt: 'messy, dark, artificial lighting, branded logos',
        category: 'PRODUCT_SHOOT',
        subCategory: 'Food & Drink',
        styleTags: ['coffee', 'flat lay', 'overhead', 'minimal', 'editorial'],
        aiTools: ['MIDJOURNEY'],
        aspectRatio: '1:1',
    },
    {
        title: 'Sneaker on Concrete Pedestal',
        promptText: 'Dynamic product shot of a white minimalist sneaker hovering slightly above a raw concrete pedestal. Dramatic side lighting with sharp shadows. Subtle dust particles frozen in the air around the shoe. Dark charcoal studio background. Professional packshot with slight dutch angle. Clean, modern, Nike-style campaign aesthetic.',
        negativePrompt: 'colorful background, multiple shoes, feet, worn out',
        category: 'PRODUCT_SHOOT',
        subCategory: 'Fashion',
        styleTags: ['sneaker', 'product', 'dramatic lighting', 'floating', 'concrete'],
        aiTools: ['STABLE_DIFFUSION'],
        aspectRatio: '4:3',
    },

    // ── PORTRAIT (3) ─────────────────────────────────────────────────────────
    {
        title: 'Golden Hour Studio Portrait',
        promptText: 'Professional studio portrait of a young woman with flowing auburn hair. Warm golden backlight creates a rim light effect along her hair and shoulders. Soft fill light on face. She wears a simple cream linen top and looks directly into camera with a confident, serene expression. Shallow depth of field, f/1.4, creamy bokeh background of warm neutral tones.',
        negativePrompt: 'harsh flash, red eyes, heavy makeup, distorted face',
        category: 'PORTRAIT',
        subCategory: 'Studio',
        styleTags: ['portrait', 'golden hour', 'studio', 'rim light', 'bokeh'],
        aiTools: ['MIDJOURNEY'],
        aspectRatio: '9:16',
    },
    {
        title: 'Film Noir Character Study',
        promptText: 'Black and white character portrait in classic film noir style. A man in a fedora hat and wool overcoat stands under a single overhead lamp casting dramatic chiaroscuro lighting. Sharp contrast between deep blacks and bright highlights. Cigarette smoke curls upward. Hasselblad medium format quality, Tri-X 400 film grain texture.',
        negativePrompt: 'color, modern clothing, smiling, bright lighting',
        category: 'PORTRAIT',
        subCategory: 'Artistic',
        styleTags: ['film noir', 'black and white', 'chiaroscuro', 'dramatic', 'vintage'],
        aiTools: ['DALLE'],
        aspectRatio: '4:3',
    },
    {
        title: 'Environmental Portrait Chef',
        promptText: 'Environmental portrait of a middle-aged Japanese sushi chef in his small traditional restaurant. He stands behind a pristine hinoki wood counter, hands resting on the surface. Warm ambient lighting from paper lanterns. His white chef uniform is immaculate. Kitchen tools and ingredients visible in soft focus behind him. Documentary photography style, Leica Q2.',
        negativePrompt: 'posed, fake smile, messy kitchen, western restaurant',
        category: 'PORTRAIT',
        subCategory: 'Documentary',
        styleTags: ['chef', 'japanese', 'environmental', 'documentary', 'ambient'],
        aiTools: ['GEMINI'],
        aspectRatio: '16:9',
    },

    // ── ARCHITECTURE (2) ─────────────────────────────────────────────────────
    {
        title: 'Brutalist Concrete Museum',
        promptText: 'Architectural photography of a brutalist concrete museum exterior at dusk. Massive cantilevered volumes with exposed concrete texture and geometric fenestration. Warm interior light glows through narrow horizontal window slits contrasting against the blue twilight sky. Reflecting pool in foreground mirrors the structure. Shot with tilt-shift lens, perfectly corrected verticals.',
        negativePrompt: 'people, cars, vegetation covering building, daytime',
        category: 'ARCHITECTURE',
        subCategory: 'Modern',
        styleTags: ['brutalist', 'concrete', 'museum', 'dusk', 'reflecting pool'],
        aiTools: ['MIDJOURNEY'],
        aspectRatio: '16:9',
    },
    {
        title: 'Japanese Zen Garden Pavilion',
        promptText: 'Serene Japanese zen garden with a traditional wooden tea pavilion. Perfectly raked white gravel patterns surround carefully placed moss-covered stones. A single red maple tree provides a splash of autumn color. Minimalist composition emphasizing negative space and harmony. Soft overcast lighting eliminates harsh shadows. Architectural Digest quality.',
        negativePrompt: 'crowded, tourists, modern furniture, bright colors',
        category: 'ARCHITECTURE',
        subCategory: 'Traditional',
        styleTags: ['zen', 'japanese', 'garden', 'minimalist', 'autumn'],
        aiTools: ['STABLE_DIFFUSION'],
        aspectRatio: '16:9',
    },

    // ── FOOD (2) ─────────────────────────────────────────────────────────────
    {
        title: 'Rustic Sourdough Bread',
        promptText: 'Close-up food photography of a freshly baked sourdough boule with a beautiful ear and blistered crust. Sliced to reveal an open, airy crumb structure. Placed on a linen cloth atop a dark reclaimed wood surface. Flour dust scattered artfully. Side window light creates warm shadows. Shot at f/2.8 with a 90mm macro lens. Moody, editorial food styling.',
        negativePrompt: 'plastic packaging, store bought, bright flat lighting',
        category: 'FOOD',
        subCategory: 'Baking',
        styleTags: ['sourdough', 'bread', 'rustic', 'macro', 'moody'],
        aiTools: ['DALLE'],
        aspectRatio: '1:1',
    },
    {
        title: 'Omakase Sushi Platter',
        promptText: 'Overhead view of an exquisite omakase sushi presentation on a handmade ceramic plate. Eight pieces of nigiri featuring otoro, uni, ikura, and shima aji, each with perfect rice form. Pickled ginger and fresh wasabi on the side. Placed on a dark slate counter with bamboo mat accent. Soft natural lighting. Michelin-star restaurant quality. Bon Appétit editorial.',
        negativePrompt: 'conveyor belt sushi, plastic chopsticks, bright neon lights',
        category: 'FOOD',
        subCategory: 'Japanese',
        styleTags: ['sushi', 'omakase', 'overhead', 'editorial', 'fine dining'],
        aiTools: ['MIDJOURNEY'],
        aspectRatio: '1:1',
    },

    // ── LOGO (2) ──────────────────────────────────────────────────────────────
    {
        title: 'Geometric Mountain Logo',
        promptText: 'Minimal geometric logo design for an outdoor adventure brand. Abstract mountain peaks formed from three overlapping triangles in a gradient from deep navy to sky blue. Clean vector lines on a pure white background. Modern sans-serif wordmark below reading "SUMMIT". Scalable, works at any size. Flat design, no gradients in the icon itself, single color versatile.',
        negativePrompt: 'photorealistic, 3D, complex illustration, many colors',
        category: 'LOGO',
        subCategory: 'Brand Identity',
        styleTags: ['logo', 'geometric', 'mountain', 'minimal', 'brand'],
        aiTools: ['DALLE'],
        aspectRatio: '1:1',
    },
    {
        title: 'Vintage Coffee Shop Emblem',
        promptText: 'Vintage-style circular emblem logo for an artisan coffee roastery. Hand-drawn illustration of a coffee plant branch with beans and leaves forming a wreath border. Established date "Est. 2024" on a ribbon banner. Monochrome design using only dark brown ink on cream. Inspired by 19th century apothecary labels and letterpress printing. Vector clean.',
        negativePrompt: 'modern, neon colors, photorealistic, complex gradients',
        category: 'LOGO',
        subCategory: 'Vintage',
        styleTags: ['vintage', 'emblem', 'coffee', 'hand-drawn', 'monochrome'],
        aiTools: ['MIDJOURNEY'],
        aspectRatio: '1:1',
    },

    // ── TEXTURE (2) ──────────────────────────────────────────────────────────
    {
        title: 'Weathered Copper Patina',
        promptText: 'Seamless tileable texture of weathered copper with natural verdigris patina. Rich mix of turquoise green oxidation over warm copper orange and brown base metal. Subtle surface scratches and age marks add authenticity. Even studio lighting with no directional shadows. 4K resolution, perfect for 3D material mapping. PBR ready.',
        negativePrompt: 'objects, reflections, environment visible, low resolution',
        category: 'TEXTURE',
        subCategory: 'Metal',
        styleTags: ['copper', 'patina', 'seamless', 'PBR', 'tileable'],
        aiTools: ['STABLE_DIFFUSION'],
        aspectRatio: '1:1',
    },
    {
        title: 'Japanese Washi Paper',
        promptText: 'Seamless tileable texture of traditional Japanese washi paper. Visible natural fibers of kozo bark create an organic crosshatch pattern. Warm ivory white color with subtle golden flecks. Slightly translucent quality suggesting light passing through. Even ambient lighting. Ultra high resolution 8K for print production. Clean edges for perfect tiling.',
        negativePrompt: 'wrinkled, torn, colored, printed text, patterns',
        category: 'TEXTURE',
        subCategory: 'Paper',
        styleTags: ['washi', 'paper', 'japanese', 'seamless', 'organic'],
        aiTools: ['FIREFLY'],
        aspectRatio: '1:1',
    },
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function seed() {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing prompts...');
        await Prompt.deleteMany({});

        console.log('🌱 Inserting sample prompts...');
        const promptsWithStatus = SAMPLE_PROMPTS.map(p => ({
            ...p,
            status: 'published',
            // provide placeholder dummy values for missing image urls if needed
            outputImageUrl: `${CLOUDINARY_BASE}/v1/freesets/${p.category.toLowerCase()}-sample.jpg`,
            cloudinaryPublicId: `freesets/${p.category.toLowerCase()}-sample`,
            thumbnailUrl: `${CLOUDINARY_BASE}/v1/freesets/${p.category.toLowerCase()}-sample.jpg`
        }));
        await Prompt.insertMany(promptsWithStatus);

        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();

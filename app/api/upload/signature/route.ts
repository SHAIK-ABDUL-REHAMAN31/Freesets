import { NextResponse } from 'next/server';
import { getCloudinaryClient, CATEGORY_CLOUDINARY_MAP, SUPPORTED_CATEGORIES } from '@/server/cloudinary/client';
import { verifyAdminSession } from '@/server/utils/admin-session';

export async function POST(req: Request) {
    try {
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const category = body.category;

        if (!category || !SUPPORTED_CATEGORIES.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        const config = CATEGORY_CLOUDINARY_MAP[category];
        if (!config || !config.api_secret) {
            return NextResponse.json({ error: 'Cloudinary not configured for this category' }, { status: 500 });
        }

        const cld = getCloudinaryClient(category);
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = `freesets/${category}`;
        
        // We only sign the necessary parameters. Cloudinary requires API key and timestamp along with signature.
        const paramsToSign = {
            timestamp,
            folder,
        };

        const signature = cld.utils.api_sign_request(paramsToSign, config.api_secret);

        return NextResponse.json({
            signature,
            timestamp,
            folder,
            apiKey: config.api_key,
            cloudName: config.cloud_name,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Error generating signature' }, { status: 500 });
    }
}

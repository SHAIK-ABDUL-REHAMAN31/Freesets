import { cookies } from 'next/headers';
import connectDB from '@/server/db/connect';
import AdminSession from '@/server/db/models/AdminSession.model';

// ─────────────────────────────────────────────────────────────────────────────
// verifyAdminSession — call from any admin API route
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the admin session by checking the fs_admin_token cookie
 * against the AdminSession MongoDB collection.
 *
 * @returns `true` if the session is valid, `false` otherwise.
 */
export async function verifyAdminSession(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('fs_admin_token')?.value;

        if (!token) return false;

        await connectDB();

        const session = await AdminSession.findOne({
            token,
            expiresAt: { $gt: new Date() },
        });

        return !!session;
    } catch {
        return false;
    }
}

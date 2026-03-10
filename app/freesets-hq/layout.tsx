import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Layout — /freesets-hq/*
// ─────────────────────────────────────────────────────────────────────────────

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Server-side auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('fs_admin_token')?.value;

    if (!token) {
        redirect('/fsa-login');
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <AdminSidebar />
            <main className="min-h-screen pt-14 px-4 pb-8 lg:pt-0 lg:ml-60 lg:p-8">
                {children}
            </main>
        </div>
    );
}

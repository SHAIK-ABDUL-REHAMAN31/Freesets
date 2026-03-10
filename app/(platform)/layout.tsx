import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryNav from '@/components/layout/CategoryNav';
import { Suspense } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Layout for platform pages (Browse, Category, Search, Profile)
// ─────────────────────────────────────────────────────────────────────────────

export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <Suspense fallback={<div className="h-14 w-full border-b border-white-5 bg-background" />}>
                <CategoryNav />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}

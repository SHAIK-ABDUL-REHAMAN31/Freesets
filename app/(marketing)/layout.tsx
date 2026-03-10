import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryNav from '@/components/layout/CategoryNav';
import { Suspense } from 'react';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <Suspense fallback={<div className="h-[88px] bg-surface border-b border-surface-border/40" />}>
                <CategoryNav />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}

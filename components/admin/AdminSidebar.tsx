'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Nav items
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || '/freesets-hq';

const NAV_ITEMS = [
    { icon: '🏠', label: 'Dashboard', href: ADMIN_PATH },
    { icon: '🖼', label: 'Prompts', href: `${ADMIN_PATH}/prompts` },
    { icon: '📥', label: 'Submissions', href: `${ADMIN_PATH}/submissions` },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const handleLogout = async () => {
        try {
            await fetch('/api/admin-auth/logout', { method: 'POST' });
            router.push('/');
        } catch {
            router.push('/');
        }
    };

    const sidebarContent = (
        <>
            {/* Brand */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center gap-0.5 mb-1">
                    <span className="font-display text-lg font-extrabold text-[#7C3AED]">free</span>
                    <span className="font-display text-lg font-extrabold text-white">sets</span>
                </div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">
                    Admin Panel
                </p>
            </div>

            <div className="h-px bg-white/[0.06] mx-4" />

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === ADMIN_PATH
                            ? pathname === ADMIN_PATH
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                                isActive
                                    ? 'bg-[#7C3AED]/15 text-[#A78BFA] font-medium'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]',
                            )}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-white/[0.06] p-4 space-y-3">
                {/* Username display */}
                <div className="px-1">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Logged in as</p>
                    <p className="text-xs text-white/60 font-medium truncate">
                        {process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'Admin'}
                    </p>
                </div>

                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <span>🚪</span>
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* ── Mobile top bar ──────────────────────────────────────── */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#0D0D0D] border-b border-white/[0.06] flex items-center justify-between px-4">
                <div className="flex items-center gap-0.5">
                    <span className="font-display text-base font-extrabold text-[#7C3AED]">free</span>
                    <span className="font-display text-base font-extrabold text-white">sets</span>
                    <span className="text-[9px] font-semibold tracking-wider text-white/25 uppercase ml-2">Admin</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="6" y2="6" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    )}
                </button>
            </div>

            {/* ── Mobile overlay + sidebar ─────────────────────────── */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Sidebar panel */}
                    <aside className="absolute left-0 top-0 h-full w-64 bg-[#0D0D0D] border-r border-white/[0.06] flex flex-col animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </aside>
                </div>
            )}

            {/* ── Desktop sidebar (unchanged) ──────────────────────── */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-[#0D0D0D] border-r border-white/[0.06] flex-col z-50">
                {sidebarContent}
            </aside>
        </>
    );
}

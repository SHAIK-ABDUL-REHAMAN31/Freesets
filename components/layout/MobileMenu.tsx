'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { CATEGORIES } from '@/config/categories';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface MobileMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// MobileMenu — slide-in sheet from the left
// ─────────────────────────────────────────────────────────────────────────────

export function MobileMenu({
    open,
    onOpenChange,
}: MobileMenuProps) {
    const pathname = usePathname();

    const close = () => onOpenChange(false);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-80 border-surface-border bg-surface p-0"
            >
                {/* Header */}
                <SheetHeader className="border-b border-surface-border px-6 py-4">
                    <SheetTitle className="text-left">
                        <Link
                            href="/"
                            onClick={close}
                            className="inline-flex items-center gap-0.5 pt-1"
                        >
                            <span className="font-logo text-2xl tracking-wide text-brand">
                                FREE
                            </span>
                            <span className="font-logo text-2xl tracking-wide text-white">
                                SETS
                            </span>
                        </Link>
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Navigation menu
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col overflow-y-auto">
                    {/* ── Main navigation ─────────────────────────────── */}
                    <nav className="space-y-1 px-3 py-4">
                        <MobileNavLink
                            href="/"
                            label="Home"
                            active={pathname === '/'}
                            onClick={close}
                        />
                        <MobileNavLink
                            href="/search"
                            label="Search"
                            active={pathname === '/search'}
                            onClick={close}
                        />
                    </nav>

                    {/* ── Categories ──────────────────────────────────── */}
                    <div className="border-t border-surface-border px-3 py-4">
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Categories
                        </p>
                        <nav className="space-y-0.5">
                            {CATEGORIES.map((cat) => {
                                const href = `/?category=${cat.slug}`;
                                return (
                                    <MobileNavLink
                                        key={cat.slug}
                                        href={href}
                                        label={
                                            <span className="flex items-center gap-2">
                                                <span className="text-base">{cat.icon}</span>
                                                {cat.label}
                                            </span>
                                        }
                                        active={pathname === '/' && false}
                                        onClick={close}
                                    />
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MobileNavLink
// ─────────────────────────────────────────────────────────────────────────────

function MobileNavLink({
    href,
    label,
    active,
    onClick,
}: {
    href: string;
    label: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                    ? 'bg-brand/10 text-brand-light'
                    : 'text-gray-400 hover:bg-surface-card hover:text-white',
            )}
        >
            {label}
        </Link>
    );
}

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { CATEGORIES } from '@/config/categories';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// CategoryNav — minimal horizontal scrollable text pills (sticky below header)
// ─────────────────────────────────────────────────────────────────────────────

export default function CategoryNav() {
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Check if scrollable
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const check = () => {
            setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 2);
        };
        check();
        el.addEventListener('scroll', check);
        window.addEventListener('resize', check);
        return () => {
            el.removeEventListener('scroll', check);
            window.removeEventListener('resize', check);
        };
    }, []);

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    };

    return (
        <div className="sticky top-16 z-50 border-b border-surface-border/40 bg-surface/95 backdrop-blur-md ">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
                <div
                    ref={scrollRef}
                    className="scrollbar-hide flex items-center gap-1 overflow-x-auto py-2.5"
                >
                    {/* "All" pill */}
                    <Link
                        href="/"
                        className={cn(
                            'shrink-0 rounded-md px-4 py-1.5',
                            'text-sm font-medium transition-colors duration-150',
                            'border whitespace-nowrap',
                            !activeCategory
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-transparent text-foreground/70 border-surface-border/60 hover:text-foreground hover:border-foreground/30',
                        )}
                    >
                        All
                    </Link>

                    {/* Category pills */}
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.value;
                        return (
                            <Link
                                key={cat.slug}
                                href={`/?category=${cat.value}`}
                                className={cn(
                                    'shrink-0 rounded-md px-4 py-1.5',
                                    'text-sm font-medium transition-colors duration-150',
                                    'border whitespace-nowrap',
                                    isActive
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'bg-transparent text-foreground/70 border-surface-border/60 hover:text-foreground hover:border-foreground/30',
                                )}
                            >
                                {cat.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Scroll-right fade + arrow */}
                {canScrollRight && (
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-0 bottom-0 flex items-center pl-6 pr-2 bg-gradient-to-l from-surface via-surface/90 to-transparent"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-4 w-4 text-foreground/60" />
                    </button>
                )}
            </div>
        </div>
    );
}

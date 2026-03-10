import Link from 'next/link';
import { Github, Twitter, Instagram, Youtube } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Footer link groups
// ─────────────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = [
    {
        title: 'Product',
        links: [
            { label: 'Home', href: '/' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/' },
            { label: 'Blog', href: '/' },
            { label: 'Contact', href: '/' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy', href: '/' },
            { label: 'Terms', href: '/' },
        ],
    },
] as const;

const SOCIAL_LINKS = [
    { icon: Twitter, href: '/', label: 'Twitter' },
    { icon: Instagram, href: '/', label: 'Instagram' },
    { icon: Youtube, href: '/', label: 'YouTube' },
    { icon: Github, href: '/', label: 'GitHub' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────

export default function Footer() {
    return (
        <footer className="border-t border-surface-border bg-surface">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* ── Main grid ──────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
                    {/* Brand column */}
                    <div className="col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-0.5 pt-1">
                            <span className="font-logo text-2xl tracking-wide text-brand">
                                FREE
                            </span>
                            <span className="font-logo text-2xl tracking-wide text-foreground">
                                SETS
                            </span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-foreground/60">
                            The best free AI prompt library. Copy, download, and
                            create stunning AI-generated images and videos.
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-3 pt-2">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white transition-colors"
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {FOOTER_LINKS.map((group) => (
                        <div key={group.title}>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground/80">
                                {group.title}
                            </h3>
                            <ul className="space-y-2">
                                {group.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-foreground/60 transition-colors hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* ── Bottom bar ──────────────────────────────────────── */}
                <div className="border-t border-surface-border py-6">
                    <p className="text-center text-xs text-foreground/50">
                        © {new Date().getFullYear()} Freesets. Made for the AI era.
                    </p>
                </div>
            </div>
        </footer>
    );
}

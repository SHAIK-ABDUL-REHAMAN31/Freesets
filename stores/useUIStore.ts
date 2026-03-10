import { create } from 'zustand';

// ─────────────────────────────────────────────────────────────────────────────
// UI Store — global UI state (modals, drawers, etc.)
// ─────────────────────────────────────────────────────────────────────────────

interface UIState {
    // ── Mobile menu ─────────────────────────────────────────────────────────────
    mobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;

    // ── Backward-compat aliases ────────────────────────────────────────────────
    isMobileMenuOpen: boolean;
}

export const useUIStore = create<UIState>((set) => ({
    // ── Mobile menu ─────────────────────────────────────────────────────────────
    mobileMenuOpen: false,
    isMobileMenuOpen: false,

    toggleMobileMenu: () =>
        set((s) => ({
            mobileMenuOpen: !s.mobileMenuOpen,
            isMobileMenuOpen: !s.mobileMenuOpen,
        })),

    closeMobileMenu: () =>
        set({
            mobileMenuOpen: false,
            isMobileMenuOpen: false,
        }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Meta
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Build a pagination metadata object from the current page, page size, and
 * total document count.
 *
 * @param page  - Current page number (1-based).
 * @param limit - Number of items per page.
 * @param total - Total number of matching documents.
 */
export function buildPaginationMeta(
    page: number,
    limit: number,
    total: number,
): PaginationMeta {
    const totalPages = Math.ceil(total / limit) || 1;

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Input sanitization — pure JS, no DOM dependency (Vercel serverless safe)
// ─────────────────────────────────────────────────────────────────────────────

const MAX_STRING_LENGTH = 5000;

/**
 * Strip all HTML tags from a string.
 * Decodes common HTML entities after stripping.
 */
function stripHtml(input: string): string {
    return input
        // Remove all HTML tags
        .replace(/<[^>]*>/g, '')
        // Decode common HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&nbsp;/g, ' ');
}

/**
 * Strip all HTML tags, trim whitespace, collapse multiple spaces, enforce max length.
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    const clean = stripHtml(input);

    return clean
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, MAX_STRING_LENGTH);
}

/**
 * Sanitize prompt text — allows normal text and common punctuation.
 * Strips script tags and HTML.
 */
export function sanitizePromptText(text: string): string {
    if (typeof text !== 'string') return '';

    const clean = stripHtml(text);

    return clean.trim().slice(0, MAX_STRING_LENGTH);
}

/**
 * Recursively sanitize all string values in an object.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map((item) =>
                typeof item === 'string' ? sanitizeString(item) : item,
            );
        } else if (value && typeof value === 'object' && !(value instanceof Date)) {
            result[key] = sanitizeObject(value);
        } else {
            result[key] = value;
        }
    }

    return result as T;
}

/**
 * Sanitize a filename — remove path traversal, special chars, keep extension.
 */
export function sanitizeFilename(filename: string): string {
    if (typeof filename !== 'string') return '';

    return filename
        .replace(/\.\.\//g, '')         // remove ../
        .replace(/\.\.\\/g, '')         // remove ..\
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 200);
}

/**
 * Check if a key is reserved:
 * - cannot be registered for a short link (only for dub.sh domain)
 * - cannot be used as a workspace slug
 */
declare const RESERVED_SLUGS: string[];

export { RESERVED_SLUGS };

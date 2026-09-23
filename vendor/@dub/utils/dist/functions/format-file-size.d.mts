/**
 * Formats a file size in bytes to a human-readable string (KB, MB, GB)
 * @param bytes File size in bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted file size string
 */
declare function formatFileSize(bytes: number, decimals?: number): string;

export { formatFileSize };

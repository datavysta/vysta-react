/**
 * Generate a UUID using the Web Crypto API
 * Falls back to a simple random string if crypto.randomUUID is not available
 */
export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID().toLowerCase();
    }
    
    // Fallback for older environments
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Convert to hex string
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
        .toLowerCase();
} 
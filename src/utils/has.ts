export function has(obj: object, path: string | string[]): boolean {
    if (!obj) return false;
    
    const segments = Array.isArray(path) ? path : path.split('.');
    let current: Record<string, unknown> = obj as Record<string, unknown>;
    
    for (const key of segments) {
        if (!current || !(key in current)) {
            return false;
        }
        current = current[key] as Record<string, unknown>;
    }
    
    return true;
}

export default has;      
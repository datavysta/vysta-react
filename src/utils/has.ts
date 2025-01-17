export function has(obj: object, path: string | string[]): boolean {
    if (!obj) return false;
    
    const segments = Array.isArray(path) ? path : path.split('.');
    let current: any = obj;
    
    for (const key of segments) {
        if (!current || !(key in current)) {
            return false;
        }
        current = current[key];
    }
    
    return true;
}

export default has; 
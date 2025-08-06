/**
 * Deep comparison utility for objects, optimized for ColumnDef arrays.
 * This function performs a deep equality check between two values, handling
 * primitive types, objects, arrays, and functions.
 *
 * For functions, it compares by reference (not by content) since function
 * content comparison is complex and usually not needed for ColumnDef objects.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if the values are deeply equal, false otherwise
 */
function deepEqual(a: unknown, b: unknown): boolean {
	// Handle primitive types and reference equality
	if (a === b) {
		return true;
	}

	// Handle null/undefined cases
	if (a == null || b == null) {
		return a === b;
	}

	// Handle different types
	if (typeof a !== typeof b) {
		return false;
	}

	// Handle functions (compare by reference)
	if (typeof a === 'function') {
		return a === b;
	}

	// Handle arrays
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) {
			return false;
		}

		for (let i = 0; i < a.length; i++) {
			if (!deepEqual(a[i], b[i])) {
				return false;
			}
		}

		return true;
	}

	// Handle objects
	if (typeof a === 'object' && typeof b === 'object') {
		const keysA = Object.keys(a as object);
		const keysB = Object.keys(b as object);

		if (keysA.length !== keysB.length) {
			return false;
		}

		for (const key of keysA) {
			if (!keysB.includes(key)) {
				return false;
			}

			if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
				return false;
			}
		}

		return true;
	}

	// Handle other types (shouldn't reach here for ColumnDef objects)
	return false;
}

/**
 * Deep comparison utility specifically for ColumnDef arrays.
 * This function is optimized for the common patterns found in ColumnDef objects.
 *
 * @param a - First ColumnDef array
 * @param b - Second ColumnDef array
 * @returns true if the arrays have identical content, false otherwise
 */
export function columnDefsEqual<T>(a: T[], b: T[]): boolean {
	if (a === b) {
		return true;
	}

	if (!Array.isArray(a) || !Array.isArray(b)) {
		return false;
	}

	if (a.length !== b.length) {
		return false;
	}

	return deepEqual(a, b);
}
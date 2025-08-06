import { useMemo, useRef } from 'react';
import { ColDef } from 'ag-grid-community';
import { columnDefsEqual } from '../utils/deepEqual';

/**
 * Custom hook that memoizes columnDefs based on deep comparison.
 * This prevents unnecessary re-renders when columnDefs are recreated
 * but have the same content.
 *
 * @param columnDefs - The columnDefs array to memoize
 * @returns The memoized columnDefs array (same reference if content hasn't changed)
 */
export function useMemoizedColumnDefs<TData, TValue>(
	columnDefs: ColDef<TData, TValue>[]
): ColDef<TData, TValue>[] {
	const previousColumnDefsRef = useRef<ColDef<TData, TValue>[] | null>(null);

	return useMemo(() => {
		const previousColumnDefs = previousColumnDefsRef.current;

		// If this is the first time or columnDefs have actually changed
		if (!previousColumnDefs || !columnDefsEqual(columnDefs, previousColumnDefs)) {
			previousColumnDefsRef.current = columnDefs;
			return columnDefs;
		}

		// Return the previous reference if content is the same
		return previousColumnDefs;
	}, [columnDefs]);
}
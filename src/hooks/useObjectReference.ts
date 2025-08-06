import { MutableRefObject, useEffect, useRef } from "react";

/**
 * Combines useRef and useEffect so that the returned object always has the latest
 * values in its current field. This allows interacting with the latest values
 * without creating direct dependencies.
 * For example, it allows calling anonymous callback handlers (that get recreated
 * on every render call) even from inside methods that have been memoized.
 * @remarks - This method expects an object with a well-defined type, if the
 * properties change between calls, it will fail.
 * It's ok if one or more fields are undefined.
 *
 * @example
 * function test ({fieldA, fieldB}: {fieldA?: () => void, fieldB: () => void}) {
 *     const ref = useObjectReference({
 *         fieldA,
 *         fieldB
 *     });
 * }
 */
export function useObjectReference<T extends object>(data: T): MutableRefObject<T> {
	const events = useRef(data);

	// Update current if any of its fields have been updated.
	useEffect(() => {
		events.current = data;
	}, Object.values(data));

	return events;
}
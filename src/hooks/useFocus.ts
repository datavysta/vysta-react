import { useEffect, useRef } from 'react';

function useFocus<T extends HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement>(focus: number | undefined) {
	const inputRef = useRef<T>(null);

	useEffect(() => {
		if (focus !== undefined && focus > -1 && inputRef.current) {
			inputRef.current.focus();
			if ('select' in inputRef.current) {
				inputRef.current.select();
			}
		}
	}, [focus, inputRef.current]);

	return inputRef;
}

export default useFocus;
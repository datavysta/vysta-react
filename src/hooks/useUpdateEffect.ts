import {DependencyList, useEffect, useRef} from 'react';

const useUpdateEffect = (effect: Function, dependencies: DependencyList | undefined) => {
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		effect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);
};

export default useUpdateEffect;
import {DependencyList, useEffect, useRef} from 'react';

const useUpdateEffect = (effect: () => void, dependencies: DependencyList | undefined) => {
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		return effect();
	}, dependencies);
};

export default useUpdateEffect;

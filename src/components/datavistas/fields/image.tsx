import { FC } from 'react';
import { Image } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';
import { useTranslationContext } from '../../Filter/TranslationContext';

const ImageComponent: FC<IFieldProperty> = ({
	readOnly,
	value,
	width,
	height,
	fit = 'contain'
}) => {
	if (!value) return null;

	return (
		<Image
			src={value}
			width={width}
			height={height}
			fit={fit}
		/>
	);
};

export default ImageComponent;

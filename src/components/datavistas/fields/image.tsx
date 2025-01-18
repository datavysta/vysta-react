import { FC } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import DataType from '../../Models/DataType';
import './image.css';

const getContentType = (fileName?: string): string => {
	if (!fileName) {
		return 'image/png';
	}

	const parts = fileName.toLowerCase().split('.');
	const extension = parts[parts.length - 1];
	return `image/${extension}`;
};

const ImageComponent: FC<IFieldProperty> = ({
	readOnly,
	dataType,
	value,
	fileName
}) => {
	if (!value) {
		return null;
	}

	if (readOnly) {
		let src = value;

		if (dataType === DataType.Binary) {
			const contentType = getContentType(fileName);
			src = `data:${contentType};base64,${value}`;
		}

		return (
			<div className="vysta-image-wrapper">
				<img 
					src={src} 
					alt={fileName || 'Image'} 
					className="vysta-image"
				/>
			</div>
		);
	}

	return <>{value}</>;
};

export default ImageComponent;

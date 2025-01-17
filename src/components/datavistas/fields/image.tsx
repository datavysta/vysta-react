import React from 'react';
import { withTranslation } from 'react-i18next';
import { Image } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';
import defaultFieldProperty from '../../Models/public/defaultfieldproperty';
import DataType from '../../Models/DataType';

class ImageComponent extends React.Component<IFieldProperty> {
	public static defaultProps = defaultFieldProperty;

	private getContentType(): string {
		const { fileName } = this.props;
		if (!fileName) {
			return 'image/png';
		}

		const parts = fileName.toLowerCase().split('.');
		const extension = parts[parts.length - 1];
		return `image/${extension}`;
	}

	render() {
		const { readOnly, dataType, value } = this.props;

		if (!value) {
			return <></>;
		}

		if (readOnly) {
			let src = value;

			if (dataType === DataType.Binary) {
				const contentType = this.getContentType();

				src = `data:${contentType};base64,${value}`;
			}

			return <Image src={src} />;
		}

		return <>{value}</>;
	}
}

export default withTranslation()(ImageComponent);

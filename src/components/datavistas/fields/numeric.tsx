import React from 'react';
import { withTranslation } from 'react-i18next';
import { NumberInput } from '@mantine/core';
import IFieldProperty from '../../../public/fieldproperty';
import defaultFieldProperty from '../../../public/defaultfieldproperty';

class NumericComponent extends React.Component<IFieldProperty> {
	public static defaultProps = defaultFieldProperty;

	constructor(props: IFieldProperty) {
		super(props);

		this.onChange = this.onChange.bind(this);
	}

	private onChange(value: string) {
		const { onChange } = this.props;
		if (!onChange) {
			return;
		}

		onChange(value);
	}

	render() {
		const {
			name,
			error,
			readOnly,
			description,
			disabled,
			required,
			label,
			value,
			precision,
			minValue,
			maxValue,
			onFocus,
			onBlur,
			className,
		} = this.props;

		if (readOnly) {
			if (value !== undefined && value !== null && value !== '') {
				return <>{value}</>;
			}

			return <></>;
		}

		let num: Number | null = null;
		if (value !== undefined && value !== null && value !== '') {
			num = Number(value);
		}

		let min: number | null = null;
		if (minValue) {
			min = Number(minValue).valueOf();
		}

		let max: number | null = null;
		if (maxValue) {
			max = Number(maxValue).valueOf();
		}

		const props: any = {
			key: name,
			label,
			error,
			required,
			disabled,
			value: num !== undefined && num !== null ? num : undefined,
			min: min !== undefined && min !== null ? min : undefined,
			max: max !== undefined && max !== null ? max : undefined,
			precision:
				precision !== undefined && precision !== null
					? precision
					: undefined,
			description,
			onFocus,
			onBlur,
			onChange: this.onChange,
			className: className,
		};

		return <NumberInput {...props} />;
	}
}

export default withTranslation()(NumericComponent);

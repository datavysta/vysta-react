import { FC, ChangeEvent } from 'react';
import { NumberInput } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';

const NumericComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (value: number | string) => {
		onChange && onChange(value.toString());
	};

	if (readOnly) {
		return <>{value}</>;
	}

	return (
		<NumberInput
			disabled={disabled}
			error={error}
			value={value ? parseFloat(value) : undefined}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default NumericComponent;

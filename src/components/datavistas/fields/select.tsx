import { FC } from 'react';
import { Select } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';

const SelectComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	data,
	onChange
}) => {
	const handleChange = (value: string | null) => {
		onChange && onChange(value || '');
	};

	if (readOnly) {
		if (!value) return null;
		const option = data?.find(item => item.value === value);
		return <>{option?.label || value}</>;
	}

	return (
		<Select
			data={data || []}
			value={value}
			onChange={handleChange}
			label={label}
			error={error}
			disabled={disabled}
		/>
	);
};

export default SelectComponent;

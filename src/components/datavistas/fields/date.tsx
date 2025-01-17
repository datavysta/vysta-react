import { FC } from 'react';
import dayjs from 'dayjs';
import { DatePickerInput } from '@mantine/dates';
import IFieldProperty from '../../Models/public/fieldproperty';

const DateComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (date: Date | null) => {
		onChange && onChange(date ? dayjs(date).format('YYYY-MM-DD') : '');
	};

	if (readOnly) {
		return <>{value ? dayjs(value).format('MM/DD/YYYY') : null}</>;
	}

	return (
		<DatePickerInput
			disabled={disabled}
			error={error}
			value={value ? dayjs(value).toDate() : null}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default DateComponent;

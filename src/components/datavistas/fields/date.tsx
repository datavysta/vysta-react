import { FC } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { formatDate, formatDateUS, parseDate } from '../../../utils/dateTime';
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
		onChange && onChange(date ? formatDate(date) : '');
	};

	if (readOnly) {
		return <>{value ? formatDateUS(parseDate(value)) : null}</>;
	}

	return (
		<DatePickerInput
			disabled={disabled}
			error={error}
			value={value ? parseDate(value) : null}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default DateComponent;

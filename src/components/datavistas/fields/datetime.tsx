import { FC } from 'react';
import { DateTimePicker } from '@mantine/dates';
import { formatDateTime, formatDateTimeUS, parseDate } from '../../../utils/dateTime';
import IFieldProperty from '../../Models/public/fieldproperty';

const DateTimeComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (date: Date | null) => {
		onChange && onChange(date ? formatDateTime(date) : '');
	};

	if (readOnly) {
		return <>{value ? formatDateTimeUS(parseDate(value)) : null}</>;
	}

	return (
		<DateTimePicker
			disabled={disabled}
			error={error}
			value={value ? parseDate(value) : null}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default DateTimeComponent;

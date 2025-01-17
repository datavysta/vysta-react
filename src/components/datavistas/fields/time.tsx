import { FC } from 'react';
import { TimeInput } from '@mantine/dates';
import { formatTime, parseTimeWithBaseDate, toUTC } from '../../../utils/dateTime';
import IFieldProperty from '../../Models/public/fieldproperty';

const TimeComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange,
	utc
}) => {
	const handleChange = (date: Date | null) => {
		if (!date || !onChange) return;
		const hours = padZero(date.getHours());
		const minutes = padZero(date.getMinutes());
		onChange(`${hours}:${minutes}`);
	};

	if (readOnly && value) {
		const date = parseTimeWithBaseDate(value);
		return <>{utc ? formatTime(toUTC(date)) : formatTime(date)}</>;
	}

	return (
		<TimeInput
			disabled={disabled}
			error={error}
			value={value ? parseTimeWithBaseDate(value) : null}
			label={label}
			onChange={handleChange}
		/>
	);
};

const padZero = (num: number): string => num.toString().padStart(2, '0');

export default TimeComponent;

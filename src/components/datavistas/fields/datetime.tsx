import { FC } from 'react';
import { DateTimePicker } from '@mantine/dates';
import { Anchor } from '@mantine/core';
import { FaPlus } from 'react-icons/fa';
import dayjs from 'dayjs';
import IFieldProperty from '../../Models/public/fieldproperty';
import { useTranslationContext } from '../../Filter/TranslationContext';

const DateTimeComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (date: Date | null) => {
		onChange && onChange(date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss') : '');
	};

	if (readOnly) {
		return <>{value ? dayjs(value).format('MM/DD/YYYY hh:mm A') : null}</>;
	}

	return (
		<DateTimePicker
			disabled={disabled}
			error={error}
			value={value ? dayjs(value).toDate() : null}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default DateTimeComponent;

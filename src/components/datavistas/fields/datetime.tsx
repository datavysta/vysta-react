import { FC, useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { DateTimePicker } from '@mantine/dates';
import { Anchor } from '@mantine/core';
import { FaPlus } from 'react-icons/fa';
import dayjs from 'dayjs';
import IFieldProperty from '../../../public/fieldproperty';
import Service from '../../Filter/services/bql-service';

const DATE_TIME_UTC = 'DateTimeUtc';

const DateTimeComponent: FC<IFieldProperty> = ({
	name,
	readOnly,
	disabled,
	placeholder,
	error,
	required,
	value,
	label,
	description,
	dataType,
	onChange,
}: IFieldProperty) => {
	const service = new Service();
	const [date, setDate] = useState<Date | null>(null);

	useEffect(() => {
		value && setInitialDate();
	}, [value]);

	const setInitialDate = () => {
		dataType === DATE_TIME_UTC
			? setDate(service.toDateTimeUtc(`${value}`))
			: setDate(service.toDateTime(`${value}`));
	};

	const handleChange = (date: Date | null) => {
		const stringDate = !date
			? ''
			: dataType === DATE_TIME_UTC
			  ? service.fromDateTimeUtc(date)
			  : service.fromDateTime(date);

		setDate(date);
		onChange && onChange(stringDate);
	};

	const renderRightSection = () => {
		return onChange ? (
			<Anchor onClick={() => handleChange(new Date())}>
				<FaPlus />
			</Anchor>
		) : null;
	};

	const renderReadOnlyField = () => {
		return date ? <>{dayjs(date).format('lll')}</> : null;
	};

	return readOnly ? (
		renderReadOnlyField()
	) : (
		<DateTimePicker
			key={`${name}_date`}
			description={description}
			disabled={disabled}
			placeholder={placeholder}
			label={label}
			required={required}
			error={error}
			value={date}
			readOnly={readOnly}
			onChange={handleChange}
			rightSection={renderRightSection()}
			dropdownType={'popover'}
		/>
	);
};

export default withTranslation()(DateTimeComponent);

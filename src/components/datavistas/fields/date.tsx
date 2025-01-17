import { FC, useState, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { DatePickerInput } from '@mantine/dates';
import { Anchor } from '@mantine/core';
import { FaPlus } from 'react-icons/fa';
import IFieldProperty from '../../Models/public/fieldproperty';
import Service from '../../Filter/services/bql-service';
import useFocus from "../../../hooks/useFocus";

const DateComponent: FC<IFieldProperty> = ({
	name,
	readOnly,
	disabled,
	placeholder,
	error,
	required,
	value,
	label,
	description,
	onChange,
	onBlur,
	onFocus,
	focusTick
}: IFieldProperty) => {
	const service = new Service();
	const [date, setDate] = useState<Date | null>(null);
	const inputRef = useFocus<HTMLButtonElement>(focusTick);

	useEffect(() => {
		value && setDate(service.toDate(`${value}`));
	}, [value]);

	const handleChange = (date: Date | null) => {
		const stringDate = date ? service.fromDate(date) : '';

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
		return date ? <>{dayjs(date).format('ll')}</> : null;
	};

	return readOnly ? (
		renderReadOnlyField()
	) : (
		<DatePickerInput
			ref={inputRef}
			readOnly={readOnly}
			key={name}
			placeholder={placeholder}
			required={required}
			disabled={disabled}
			error={error}
			value={date}
			label={label}
			description={description}
			onBlur={onBlur}
			onFocus={onFocus}
			rightSection={renderRightSection()}
			onChange={handleChange}
			dropdownType={'popover'}
		/>
	);
};

export default withTranslation()(DateComponent);

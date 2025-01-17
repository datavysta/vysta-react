import { Fragment, ChangeEvent } from 'react';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { TimeInput } from '@mantine/dates';
import IFieldProperty from '../../../public/fieldproperty';

const TimeComponent = ({
	readOnly,
	disabled,
	error,
	value,
	dataType,
	label,
	onChange,
}: IFieldProperty) => {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange && onChange(`${e.target.value}:00`);
	};

	const renderReadOnlyField = () => {
		return value ? (
			<Fragment>
				{dataType === 'TimeUtc'
					? dayjs(`1970-01-01T ${value}`).utc().format('hh:mm A')
					: dayjs(`1970-01-01T ${value}`).format('hh:mm A')}
			</Fragment>
		) : null;
	};

	return readOnly ? (
		renderReadOnlyField()
	) : (
		<TimeInput
			disabled={disabled}
			error={error}
			defaultValue={value}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default withTranslation()(TimeComponent);

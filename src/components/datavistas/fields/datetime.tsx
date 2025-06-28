import { FC } from 'react';
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
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(event.target.value ? formatDateTime(new Date(event.target.value)) : '');
		}
	};

	if (readOnly) {
		return <>{value ? formatDateTimeUS(parseDate(value)) : null}</>;
	}

	return (
		<div className="vysta-field-wrapper">
			{label && (
				<label className="vysta-field-label" htmlFor="datetime-input">
					{label}
				</label>
			)}
			<input
				id="datetime-input"
				type="datetime-local"
				className={`vysta-field-input ${error ? 'vysta-field-error' : ''}`}
				disabled={disabled}
				value={value ? parseDate(value).toISOString().slice(0, 16) : ''}
				onChange={handleChange}
				aria-invalid={error ? 'true' : 'false'}
				aria-label={label}
			/>
			{error && <span className="vysta-field-error-text">{error}</span>}
		</div>
	);
};

export default DateTimeComponent;

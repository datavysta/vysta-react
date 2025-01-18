import { FC } from 'react';
import { formatTime, parseTimeWithBaseDate, toUTC } from '../../../utils/dateTime';
import IFieldProperty from '../../Models/public/fieldproperty';

const TimeComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange,
	dataType
}) => {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.value || !onChange) return;
		onChange(event.target.value);
	};

	if (readOnly && value) {
		const date = parseTimeWithBaseDate(value);
		const isUtc = dataType === 'TimeUtc';
		return <>{isUtc ? formatTime(toUTC(date)) : formatTime(date)}</>;
	}

	return (
		<div className="vysta-field-wrapper">
			{label && (
				<label className="vysta-field-label" htmlFor="time-input">
					{label}
				</label>
			)}
			<input
				id="time-input"
				type="time"
				className={`vysta-field-input ${error ? 'vysta-field-error' : ''}`}
				disabled={disabled}
				value={value || ''}
				onChange={handleChange}
				aria-invalid={error ? 'true' : 'false'}
			/>
			{error && <span className="vysta-field-error-text">{error}</span>}
		</div>
	);
};

export default TimeComponent;

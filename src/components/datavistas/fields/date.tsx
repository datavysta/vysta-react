import { FC } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import { formatDate, formatDateUS, parseDate } from '../../../utils/dateTime';

const DateComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(event.target.value ? formatDate(new Date(event.target.value)) : '');
		}
	};

	if (readOnly) {
		return <>{value ? formatDateUS(parseDate(value)) : null}</>;
	}

	return (
		<div className="vysta-field-wrapper">
			{label && (
				<label className="vysta-label" htmlFor="date-input">
					{label}
				</label>
			)}
			<input
				id="date-input"
				type="date"
				className={`vysta-input ${error ? 'vysta-input--error' : ''}`}
				disabled={disabled}
				value={value ? parseDate(value).toISOString().split('T')[0] : ''}
				onChange={handleChange}
				aria-invalid={error ? 'true' : 'false'}
				aria-label={label}
			/>
			{error && <span className="vysta-error-text">{error}</span>}
		</div>
	);
};

export default DateComponent;

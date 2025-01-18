import { FC, ChangeEvent } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import './numeric.css';

const NumericComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === '') {
			onChange && onChange('');
			return;
		}
		const num = parseFloat(value);
		if (!isNaN(num)) {
			onChange && onChange(num.toString());
		}
	};

	if (readOnly) {
		return <span className="numeric-field-readonly">{value}</span>;
	}

	return (
		<div className="numeric-field-wrapper">
			{label && <label className="numeric-field-label">{label}</label>}
			<input
				type="number"
				className={`numeric-field-input ${error ? 'numeric-field-error' : ''}`}
				disabled={disabled}
				value={value || ''}
				onChange={handleChange}
				aria-invalid={!!error}
				aria-errormessage={error?.toString()}
			/>
			{error && <div className="numeric-field-error-message">{error}</div>}
		</div>
	);
};

export default NumericComponent;

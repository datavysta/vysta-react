import { FC, ChangeEvent } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import './text.css';

const TextComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange && onChange(e.target.value);
	};

	if (readOnly) {
		return <span className="text-field-readonly">{value}</span>;
	}

	return (
		<div className="text-field-wrapper">
			{label && <label className="text-field-label">{label}</label>}
			<input
				type="text"
				className={`text-field-input ${error ? 'text-field-error' : ''}`}
				disabled={disabled}
				value={value || ''}
				onChange={handleChange}
				aria-invalid={!!error}
				aria-errormessage={error?.toString()}
			/>
			{error && <div className="text-field-error-message">{error}</div>}
		</div>
	);
};

export default TextComponent;

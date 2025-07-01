import { FC, ChangeEvent } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import './textarea.css';

const TextareaComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		if (onChange) {
			onChange(e.target.value);
		}
	};

	if (readOnly) {
		return <span className="textarea-field-readonly">{value}</span>;
	}

	return (
		<div className="textarea-field-wrapper">
			{label && <label className="textarea-field-label">{label}</label>}
			<textarea
				className={`textarea-field-input ${error ? 'textarea-field-error' : ''}`}
				disabled={disabled}
				value={value || ''}
				onChange={handleChange}
				aria-invalid={!!error}
				aria-errormessage={error?.toString()}
				rows={4}
			/>
			{error && <div className="textarea-field-error-message">{error}</div>}
		</div>
	);
};

export default TextareaComponent;

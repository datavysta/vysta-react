import { FC, ChangeEvent } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';

const UuidComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(e.target.value);
		}
	};

	const handleGenerateUuid = () => {
		if (onChange) {
			onChange(crypto.randomUUID());
		}
	};

	if (readOnly) {
		return <>{value}</>;
	}

	return (
		<div className="vysta-field-wrapper">
			{label && (
				<label className="vysta-field-label" htmlFor="uuid-input">
					{label}
				</label>
			)}
			<div className="vysta-field-input-wrapper">
				<input
					id="uuid-input"
					type="text"
					className={`vysta-field-input ${error ? 'vysta-field-input-error' : ''}`}
					disabled={disabled}
					value={value || ''}
					onChange={handleChange}
					aria-invalid={error ? 'true' : 'false'}
				/>
				<button
					type="button"
					className="vysta-field-action-button"
					onClick={handleGenerateUuid}
					aria-label="Generate UUID"
				>
					⊕
				</button>
			</div>
			{error && <span className="vysta-field-error">{error}</span>}
		</div>
	);
};

export default UuidComponent;

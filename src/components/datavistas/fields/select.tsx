import { FC } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';

const SelectComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	data,
	onChange
}) => {
	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		onChange && onChange(event.target.value);
	};

	if (readOnly) {
		if (!value) return null;
		const option = data?.find(item => item.value === value);
		return <>{option?.label || value}</>;
	}

	return (
		<div className="vysta-field-wrapper">
			{label && (
				<label 
					className="vysta-field-label" 
					htmlFor="vysta-select"
				>
					{label}
				</label>
			)}
			<select
				id="vysta-select"
				className={`vysta-select ${error ? 'vysta-select--error' : ''}`}
				value={value}
				onChange={handleChange}
				disabled={disabled}
				aria-invalid={!!error}
				aria-label={label}
			>
				{data?.map((item) => (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				))}
			</select>
			{error && <span className="vysta-field-error">{error}</span>}
		</div>
	);
};

export default SelectComponent;

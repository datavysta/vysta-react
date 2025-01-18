import { FC } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import { useTranslationContext } from '../../Filter/TranslationContext';
import './select.css';

const SelectComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	name,
	onSearch,
	onChange,
	required,
	label,
	placeholder,
	description,
	value,
	items,
	className,
}) => {
	const { t } = useTranslationContext();

	if (readOnly) {
		return <>{value}</>;
	}

	let selectData: { value: string; label: string }[] = [];

	if (onSearch && !items) {
		throw new Error('Lazy loading is not supported with the standard select element. Please provide items for the select options.');
	}

	if (items) {
		selectData = items.map((i) => ({
			value: i.value,
			label: i.label,
		}));
	} else if (value) {
		selectData = [{ value, label: value }];
	}

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		onChange?.(event.target.value);
	};

	return (
		<div className="vysta-field-wrapper">
			{label && (
				<label className="vysta-field-label" htmlFor={name}>
					{label}
					{required && <span className="vysta-field-required">*</span>}
				</label>
			)}
			<select
				id={name}
				className={`vysta-select ${error ? 'vysta-select-error' : ''} ${className || ''}`}
				disabled={disabled}
				value={value || ''}
				onChange={handleChange}
				aria-invalid={error ? 'true' : 'false'}
				aria-describedby={description ? `${name}-description` : undefined}
			>
				<option value="">{placeholder || t('Select...')}</option>
				{selectData.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{description && (
				<div id={`${name}-description`} className="vysta-field-description">
					{description}
				</div>
			)}
			{error && <div className="vysta-field-error">{error}</div>}
		</div>
	);
};

export default SelectComponent;

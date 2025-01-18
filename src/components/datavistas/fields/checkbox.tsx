import { FC, ChangeEvent } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import { useTranslationContext } from "../../Filter/TranslationContext";

const CheckboxComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const { t } = useTranslationContext();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange && onChange(e.target.checked.toString());
	};

	if (readOnly) {
		return <>{value ? t('Yes') : t('No')}</>;
	}

	return (
		<div className="vysta-checkbox-wrapper">
			<label className="vysta-checkbox-label">
				<input
					type="checkbox"
					className={`vysta-checkbox ${error ? 'vysta-checkbox--error' : ''}`}
					disabled={disabled}
					checked={value === 'true'}
					onChange={handleChange}
					aria-invalid={error ? 'true' : 'false'}
				/>
				<span className="vysta-checkbox-text">{label}</span>
			</label>
		</div>
	);
};

export default CheckboxComponent;

import { FC } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import { useTranslationContext } from "../../Filter/TranslationContext";

const ToggleComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	value,
	label,
	onChange
}) => {
	const { t } = useTranslationContext();

	const handleChange = (checked: boolean) => {
		onChange && onChange(checked);
	};

	return readOnly ? (
		<>{value ? t('Yes') : t('No')}</>
	) : (
		<div className="vysta-toggle-wrapper">
			<label className="vysta-toggle">
				<input
					type="checkbox"
					className="vysta-toggle-input"
					disabled={disabled}
					checked={value}
					onChange={(event) => handleChange(event.target.checked)}
					aria-label={label}
				/>
				<span className="vysta-toggle-slider"></span>
				{label && <span className="vysta-toggle-label">{label}</span>}
			</label>
		</div>
	);
};

export default ToggleComponent;

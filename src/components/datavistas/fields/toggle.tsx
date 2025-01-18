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
		onChange && onChange(checked.toString());
	};

	if (readOnly) {
		if (value === undefined || value === null) {
			return null;
		}

		let converted = `${value}`.toLowerCase();
		if (converted === 'true') {
			converted = 'Yes';
		} else if (converted === 'false') {
			converted = 'No';
		}

		return <span>{t(converted)}</span>;
	}

	let checked: boolean | undefined = undefined;
	const strValue = value ? `${value}`.toLowerCase() : 'false';
	if (strValue === 'true') {
		checked = true;
	} else if (strValue === 'false') {
		checked = false;
	}

	return (
		<div className="vysta-toggle-wrapper">
			<label className="vysta-toggle">
				<input
					type="checkbox"
					className="vysta-toggle-input"
					disabled={disabled}
					checked={checked}
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

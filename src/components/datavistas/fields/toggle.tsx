import { FC } from 'react';
import { Switch } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';
import {useTranslationContext} from "../../Filter/TranslationContext";

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
		<Switch
			disabled={disabled}
			checked={value}
			label={label}
			onChange={(event) => handleChange(event.currentTarget.checked)}
		/>
	);
};

export default ToggleComponent;

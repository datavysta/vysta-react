import { FC, ChangeEvent } from 'react';
import { Checkbox } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';
import {useTranslationContext} from "../../Filter/TranslationContext";

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
		<Checkbox
			disabled={disabled}
			error={error}
			checked={value === 'true'}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default CheckboxComponent;

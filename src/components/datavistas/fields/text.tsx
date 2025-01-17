import { FC, ChangeEvent } from 'react';
import { TextInput } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';
import { useTranslationContext } from '../../Filter/TranslationContext';

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
		return <>{value}</>;
	}

	return (
		<TextInput
			disabled={disabled}
			error={error}
			value={value || ''}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default TextComponent;

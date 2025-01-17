import { FC, ChangeEvent } from 'react';
import { Textarea } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';

const TextareaComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	onChange
}) => {
	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		onChange && onChange(e.target.value);
	};

	if (readOnly) {
		return <>{value}</>;
	}

	return (
		<Textarea
			disabled={disabled}
			error={error}
			value={value}
			label={label}
			onChange={handleChange}
		/>
	);
};

export default TextareaComponent;

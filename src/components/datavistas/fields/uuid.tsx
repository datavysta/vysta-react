import { FC, ChangeEvent } from 'react';
import { Anchor, TextInput } from '@mantine/core';
import { FaPlus } from 'react-icons/fa';
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
		onChange && onChange(e.target.value);
	};

	const handleGenerateUuid = () => {
		onChange && onChange(crypto.randomUUID());
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
			rightSection={
				<Anchor onClick={handleGenerateUuid}>
					<FaPlus />
				</Anchor>
			}
		/>
	);
};

export default UuidComponent;

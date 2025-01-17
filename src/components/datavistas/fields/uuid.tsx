import { ChangeEvent, Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { withTranslation } from 'react-i18next';
import { Anchor, TextInput } from '@mantine/core';
import { FaPlus } from 'react-icons/fa';
import IFieldProperty from '../../../public/fieldproperty';

const getLabel = (label: string | undefined, primary: boolean | undefined) => {
	return (
		<>
			{label}
			{primary && <span>🔑</span>}
		</>
	);
};

const UUIDComponent = ({
	name,
	readOnly,
	disabled,
	error,
	placeholder,
	required,
	value,
	onBlur,
	onFocus,
	onChange,
	label,
	description,
	className,
	isFilterComponent,
	primary,
}: IFieldProperty) => {
	const renderRightSection = () =>
		!isFilterComponent ? (
			<Anchor
				onClick={() => onChange && onChange(uuidv4().toLowerCase())}
			>
				<FaPlus />
			</Anchor>
		) : null;

	return readOnly ? (
		<Fragment>{value}</Fragment>
	) : (
		<TextInput
			readOnly={readOnly}
			key={name}
			disabled={disabled}
			required={required}
			label={getLabel(label, primary)}
			error={error}
			placeholder={placeholder}
			description={description}
			value={value ? value : ''}
			className={className}
			onChange={(event: ChangeEvent<HTMLInputElement>) =>
				onChange && onChange(event.currentTarget.value)
			}
			onBlur={onBlur}
			onFocus={onFocus}
			rightSection={onChange && renderRightSection()}
		/>
	);
};

export default withTranslation()(UUIDComponent);

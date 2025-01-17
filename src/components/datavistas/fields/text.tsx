import { ChangeEvent, FC, Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import { TextInput } from '@mantine/core';
import IFieldProperty from '../../../public/fieldproperty';
import useFocus from "../../../hooks/useFocus.ts";

const getLabel = (label: string | undefined, primary: boolean | undefined) => {
	return (
		<>
			{label}
			{primary && <span>🔑</span>}
		</>
	);
};

const TextComponent: FC<IFieldProperty> = ({
	name,
	readOnly,
	className,
	disabled,
	placeholder,
	error,
	required,
	value,
	label,
	description,
	id,
	primary,
	onChange,
	onBlur,
	onFocus,
	focusTick
}: IFieldProperty) => {
	const inputRef = useFocus<HTMLInputElement>(focusTick);

	return readOnly ? (
		<Fragment>{value}</Fragment>
	) : (
		<TextInput
			ref={inputRef}
			readOnly={readOnly}
			id={id ? id : undefined}
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
				onChange && onChange(event.target.value)
			}
			onBlur={onBlur}
			onFocus={onFocus}
		/>
	);
}


export default withTranslation()(TextComponent);

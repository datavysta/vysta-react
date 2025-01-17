import { ChangeEvent } from 'react';
import { Textarea } from '@mantine/core';
import { withTranslation } from 'react-i18next';
import IFieldProperty from '../../Models/public/fieldproperty';
import useFocus from "../../../hooks/useFocus.ts";

const TextAreaComponent = ({
	name,
	readOnly,
	disabled,
	placeholder,
	error,
	required,
	value,
	label,
	description,
	className,
	id,
	onBlur,
	onFocus,
	onChange,
	focusTick
}: IFieldProperty) => {
	const inputRef = useFocus<HTMLTextAreaElement>(focusTick);

	return readOnly ? (
		<>{value}</>
	) : (
		<Textarea
			ref={inputRef}
			readOnly={readOnly}
			key={name}
			id={id ? id : undefined}
			required={required}
			disabled={disabled}
			autosize
			maxRows={1}
			error={error}
			label={label}
			placeholder={placeholder}
			description={description}
			className={className}
			value={value || ''}
			onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
				onChange && onChange(event.target.value)
			}
			onBlur={onBlur}
			onFocus={onFocus}
		/>
	);
}


export default withTranslation()(TextAreaComponent);

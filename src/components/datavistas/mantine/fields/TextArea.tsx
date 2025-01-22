import { FC, ChangeEvent } from 'react';
import { Textarea } from '@mantine/core';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const TextAreaField: FC<IFieldProperty> = ({
    name,
    readOnly,
    className,
    disabled,
    placeholder,
    error,
    required,
    value = '',
    label,
    description,
    id,
    onChange,
    onBlur,
    onFocus,
    maxRows = 1,
}) => {
    if (readOnly) {
        return <>{value}</>;
    }

    return (
        <Textarea
            id={id}
            key={name}
            disabled={disabled}
            required={required}
            autosize
            maxRows={maxRows}
            error={error}
            label={label}
            placeholder={placeholder}
            description={description}
            className={className}
            value={value}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                onChange?.(event.target.value)
            }
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
};

export default TextAreaField; 
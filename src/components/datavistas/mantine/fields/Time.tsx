import { FC } from 'react';
import { TextInput } from '@mantine/core';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const TimeField: FC<IFieldProperty> = ({
    name,
    readOnly,
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
}) => {
    if (readOnly) {
        return <>{value}</>;
    }

    return (
        <TextInput
            id={id}
            key={name}
            disabled={disabled}
            required={required}
            label={label}
            error={error}
            placeholder={placeholder || 'HH:mm:ss'}
            description={description}
            value={value}
            onChange={(event) => onChange?.(event.currentTarget.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            type="time"
            step="1"
        />
    );
};

export default TimeField; 
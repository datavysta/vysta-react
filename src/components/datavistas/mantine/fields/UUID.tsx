import { FC } from 'react';
import { TextInput } from '@mantine/core';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const UUIDField: FC<IFieldProperty> = ({
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

    // UUID format validation
    const isValidUUID = (uuid: string) => {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    };

    return (
        <TextInput
            id={id}
            key={name}
            disabled={disabled}
            required={required}
            label={label}
            error={error || (value && !isValidUUID(value) ? 'Invalid UUID format' : undefined)}
            placeholder={placeholder || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'}
            description={description}
            value={value}
            onChange={(event) => onChange?.(event.currentTarget.value)}
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
};

export default UUIDField; 
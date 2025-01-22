import { FC } from 'react';
import { Select } from '@mantine/core';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const SelectField: FC<IFieldProperty> = ({
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
    items = [],
}) => {
    if (readOnly) {
        return <>{value}</>;
    }

    const data = items?.map(item => ({
        value: item.value,
        label: item.label
    })) ?? [];

    return (
        <Select
            id={id}
            key={name}
            disabled={disabled}
            required={required}
            label={label}
            error={error}
            placeholder={placeholder}
            description={description}
            value={value}
            onChange={(val) => onChange?.(val || '')}
            onBlur={onBlur}
            onFocus={onFocus}
            data={data}
            clearable
        />
    );
};

export default SelectField; 
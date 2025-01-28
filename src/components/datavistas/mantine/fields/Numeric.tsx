import { FC } from 'react';
import { NumberInput } from '@mantine/core';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const NumericField: FC<IFieldProperty> = ({
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
    minValue,
    maxValue,
}) => {
    if (readOnly) {
        return <>{value}</>;
    }

    const handleChange = (val: number | string | '') => {
        if (val === '' || val === null || val === undefined) {
            onChange?.('');
            return;
        }
        onChange?.(val.toString());
    };

    return (
        <NumberInput
            id={id}
            key={name}
            disabled={disabled}
            required={required}
            label={label}
            error={error}
            placeholder={placeholder}
            description={description}
            value={value === '' ? '' : parseFloat(value)}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            min={minValue ? parseFloat(minValue) : undefined}
            max={maxValue ? parseFloat(maxValue) : undefined}
            allowNegative
            allowDecimal
            hideControls
        />
    );
};

export default NumericField; 
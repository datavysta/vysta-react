import { FC } from 'react';
import { DateTimePicker, DateValue } from '@mantine/dates';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const DateTimeField: FC<IFieldProperty> = ({
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
        <DateTimePicker
            id={id}
            key={name}
            disabled={disabled}
            required={required}
            label={label}
            error={error}
            placeholder={placeholder}
            description={description}
            value={value ? new Date(value) : null}
            onChange={(date: DateValue) => onChange?.(date instanceof Date ? date.toISOString() : date || '')}
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
};

export default DateTimeField;      
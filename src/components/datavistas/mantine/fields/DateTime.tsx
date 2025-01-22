import { FC } from 'react';
import { DateTimePicker } from '@mantine/dates';
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
            onChange={(date: Date | null) => onChange?.(date ? date.toISOString() : '')}
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
};

export default DateTimeField; 
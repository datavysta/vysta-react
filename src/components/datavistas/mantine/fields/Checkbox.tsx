import { FC } from 'react';
import { Checkbox } from '@mantine/core';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const CheckboxField: FC<IFieldProperty> = ({
    name,
    readOnly,
    disabled,
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
        <Checkbox
            id={id}
            key={name}
            disabled={disabled}
            required={required}
            label={label}
            description={description}
            checked={value === 'true'}
            onChange={(event) => onChange?.(event.currentTarget.checked.toString())}
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
};

export default CheckboxField; 
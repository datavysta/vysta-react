import { FC, ChangeEvent } from 'react';
import { TextInput } from '@mantine/core';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const TextField: FC<IFieldProperty> = ({
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
    primary,
    onChange,
    onBlur,
    onFocus,
}) => {
    const getLabel = (label?: string, primary?: boolean) => {
        if (!label) return undefined;
        return primary ? `${label} 🔑` : label;
    };

    if (readOnly) {
        return <>{value}</>;
    }

    return (
        <TextInput
            id={id}
            key={name}
            disabled={disabled}
            required={required}
            label={getLabel(label, primary)}
            error={error}
            placeholder={placeholder}
            description={description}
            value={value}
            className={className}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange?.(event.target.value)
            }
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
};

export default TextField; 
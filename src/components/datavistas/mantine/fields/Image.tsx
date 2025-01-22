import { FC } from 'react';
import { Image } from '@mantine/core';
import IFieldProperty from '../../../Models/public/fieldproperty';

export const ImageField: FC<IFieldProperty> = ({
    name,
    value = '',
    label,
    description,
    id,
    className,
}) => {
    if (!value) {
        return null;
    }

    return (
        <div>
            {label && <label htmlFor={id}>{label}</label>}
            {description && <p>{description}</p>}
            <Image
                id={id}
                key={name}
                src={value}
                alt={label || name}
                className={className}
                fit="contain"
            />
        </div>
    );
};

export default ImageField; 
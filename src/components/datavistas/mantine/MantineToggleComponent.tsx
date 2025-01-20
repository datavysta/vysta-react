import { FC } from 'react';
import { Switch } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';

interface IMantineToggleProps extends IFieldProperty {
    value?: string;
    onChange?: (value: string) => void;
}

const MantineToggleComponent: FC<IMantineToggleProps> = ({
    value,
    onChange,
    label
}) => {
    const isChecked = value === 'true';

    const handleChange = (checked: boolean) => {
        onChange?.(checked.toString());
    };

    return (
        <Switch
            label={label}
            checked={isChecked}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(event.currentTarget.checked)}
            size="md"
            color="blue"
        />
    );
};

export default MantineToggleComponent; 
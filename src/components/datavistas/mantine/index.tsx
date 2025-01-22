import { FC, ReactNode } from 'react';
import { FieldComponentProvider } from '../FieldComponentContext';
import Fields from '../fields';
import MantineToggleComponent from './MantineToggleComponent';
import TextField from './fields/Text';
import TextAreaField from './fields/TextArea';
import CheckboxField from './fields/Checkbox';
import DateField from './fields/Date';
import DateTimeField from './fields/DateTime';
import ImageField from './fields/Image';
import NumericField from './fields/Numeric';
import SelectField from './fields/Select';
import TimeField from './fields/Time';
import UUIDField from './fields/UUID';

const mantineComponents = {
    [Fields.Toggle]: MantineToggleComponent,
    [Fields.Text]: TextField,
    [Fields.TextArea]: TextAreaField,
    [Fields.Checkbox]: CheckboxField,
    [Fields.Date]: DateField,
    [Fields.DateTime]: DateTimeField,
    [Fields.Image]: ImageField,
    [Fields.Numeric]: NumericField,
    [Fields.Select]: SelectField,
    [Fields.Time]: TimeField,
    [Fields.UUID]: UUIDField,
} as const;

interface MantineProviderProps {
    children: ReactNode;
}

export const VystaMantineComponentProvider: FC<MantineProviderProps> = ({ children }) => {
    return (
        <FieldComponentProvider components={mantineComponents}>
            {children}
        </FieldComponentProvider>
    );
};

export {
    MantineToggleComponent,
    TextField,
    TextAreaField,
    CheckboxField,
    DateField,
    DateTimeField,
    ImageField,
    NumericField,
    SelectField,
    TimeField,
    UUIDField,
}; 
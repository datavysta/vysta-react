import { FC, ReactNode } from 'react';
import { FieldComponentProvider } from '../FieldComponentContext';
import Fields from '../fields';
import MantineToggleComponent from './MantineToggleComponent';

const mantineComponents = {
    [Fields.Toggle]: MantineToggleComponent,
} as const;

interface MantineProviderProps {
    children: ReactNode;
}

export const MantineComponentProvider: FC<MantineProviderProps> = ({ children }) => {
    return (
        <FieldComponentProvider components={mantineComponents}>
            {children}
        </FieldComponentProvider>
    );
};

export { MantineToggleComponent }; 
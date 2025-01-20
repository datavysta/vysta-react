import React, { createContext, useContext } from 'react';
import IFieldProperty from '../Models/public/fieldproperty';

export interface FieldComponents {
    [key: string]: React.ComponentType<IFieldProperty>;
}

const defaultComponents: FieldComponents = {};

export const FieldComponentContext = createContext<FieldComponents>(defaultComponents);

export const useFieldComponentContext = () => useContext(FieldComponentContext);

export const FieldComponentProvider: React.FC<{
    components?: FieldComponents;
    children: React.ReactNode;
}> = ({ components = defaultComponents, children }) => (
    <FieldComponentContext.Provider value={components}>
        {children}
    </FieldComponentContext.Provider>
); 
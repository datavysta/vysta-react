import { ReactElement } from 'react';
import IFieldProperty from './fieldproperty';

interface IComponentFactory {
	/*
    createValidation(properties: ValidationProperties): ReactElement;

    createLayout(properties: ILayoutProperties): ReactElement;
     */

	createField: (typeName: string, properties: IFieldProperty) => ReactElement;

	/*
    createPanel(properties: IPanelProperties): ReactElement;

    isLayoutComponent(control: Control): boolean;
    */
}

export default IComponentFactory;

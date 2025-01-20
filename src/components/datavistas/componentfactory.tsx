import { ReactElement } from 'react';
import BQLComponent from './fields/bql';
import TimeComponent from './fields/time';
import DateComponent from './fields/date';
import DateTimeComponent from './fields/datetime';
import TextComponent from './fields/text';
import TextAreaComponent from './fields/textarea';
import NumericComponent from './fields/numeric';
import ImageComponent from './fields/image';
import CheckboxComponent from './fields/checkbox';
import ToggleComponent from './fields/toggle';
import SelectComponent from './fields/select';
import Fields from './fields';
import UUIDComponent from './fields/uuid';
import IFieldProperty from "../Models/public/fieldproperty";
import { useFieldComponentContext } from './FieldComponentContext';

export const useComponentFactory = () => {
	const overrides = useFieldComponentContext();

	const createField = (typeName: string, properties: IFieldProperty): ReactElement => {
		// Get any overridden components from context
		const OverriddenComponent = overrides[typeName];
		
		if (OverriddenComponent) {
			return <OverriddenComponent {...properties} />;
		}

		switch (typeName) {
			case Fields.Time:
			case Fields.TimeUtc:
				return <TimeComponent {...properties} />;
			case Fields.Date:
				return <DateComponent {...properties} />;
			case Fields.DateTime:
			case Fields.DateTimeUtc:
				return <DateTimeComponent {...properties} />;
			case Fields.Text:
				return <TextComponent {...properties} />;
			case Fields.TextArea:
				return <TextAreaComponent {...properties} />;
			case Fields.Toggle:
				return <ToggleComponent {...properties} />;
			case Fields.Checkbox:
				return <CheckboxComponent {...properties} />;
			case Fields.Numeric:
				return <NumericComponent {...properties} />;
			case Fields.Select:
				return <SelectComponent {...properties} />;
			case Fields.Image:
				return <ImageComponent {...properties} />;
			case Fields.Bql:
				return <BQLComponent {...properties} />;
			case Fields.UUID:
				return <UUIDComponent {...properties} />;
			default:
				return <TextComponent {...properties} />;
		}
	};

	return { createField };
};

export default useComponentFactory;

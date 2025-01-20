import { ReactElement } from 'react';
import Fields from './fields';
import DataType from '../Models/DataType';
import IFieldProperty from "../Models/public/fieldproperty";
import { useComponentFactory } from './componentfactory';

export interface IDataTypeComponentFactory {
	getFieldTypeByDataType(
		dataType: DataType,
		properties: IFieldProperty
	): Fields;

	getByDataType(dataType: DataType, properties: IFieldProperty): ReactElement;
}

const getFieldTypeByDataType = (
	dataType: DataType,
	properties: IFieldProperty
): Fields => {
	if (properties.encrypted === true) {
		return Fields.Password;
	}

	switch (dataType) {
		case DataType.TinyInt:
		case DataType.TinyIntUnsigned:
		case DataType.MediumInt:
		case DataType.MediumIntUnsigned:
		case DataType.Int:
		case DataType.IntUnsigned:
		case DataType.BigInt:
		case DataType.BigIntUnsigned:
		case DataType.Single:
		case DataType.Double:
		case DataType.Numeric:
			return Fields.Numeric;
		case DataType.Binary:
			return Fields.File;
		case DataType.Time:
			return Fields.Time;
		case DataType.TimeUtc:
			return Fields.TimeUtc;
		case DataType.Date:
			return Fields.Date;
		case DataType.DateTime:
			return Fields.DateTime;
		case DataType.DateTimeUtc:
			return Fields.DateTimeUtc;
		case DataType.Percent:
			return Fields.ProgressBar;
		case DataType.Boolean:
			return Fields.Toggle;
		case DataType.Json:
			return Fields.Json;
		case DataType.Xml:
			return Fields.Xml;
		case DataType.String:
		case DataType.AnsiString:
			return Fields.TextArea;
		case DataType.UUID:
			return Fields.UUID;
		default:
			return Fields.Text;
	}
};

export const useDataTypeComponentFactory = () => {
	const componentFactory = useComponentFactory();

	const getByDataType = (dataType: DataType, properties: IFieldProperty): ReactElement => {
		const fieldType = getFieldTypeByDataType(dataType, properties);
		return componentFactory.createField(fieldType, properties);
	};

	return {
		getFieldTypeByDataType,
		getByDataType
	};
};

export default useDataTypeComponentFactory;

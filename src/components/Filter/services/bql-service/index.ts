import unEscapeRef from './unEscapeRef';
import escapeIdentifier from './escapeIdentifier';
import ComparisonOperator from '../../../Models/ComparisonOperator';
import DataType from '../../../Models/DataType';
import DataTypeCategory from '../../../Models/DataTypeCategory';
import ObjectRef from '../../../Models/ObjectRef';
import { formatDate, formatDateTime, parseDate, toUTC, fromUTC } from '../../../../utils/dateTime';

export default class Service {
	private getComparisonOperatorsByBoolean(): ComparisonOperator[] {
		return [
			ComparisonOperator.Equal,
			ComparisonOperator.NotEqual,
			ComparisonOperator.IsNull,
			ComparisonOperator.IsNotNull,
		];
	}

	private getComparisonOperatorsByUUID(): ComparisonOperator[] {
		return [
			ComparisonOperator.Equal,
			ComparisonOperator.NotEqual,
			ComparisonOperator.IsNull,
			ComparisonOperator.IsNotNull,
			ComparisonOperator.In,
			ComparisonOperator.NotIn,
		];
	}

	private getComparisonOperatorsByCharacter(): ComparisonOperator[] {
		return [
			ComparisonOperator.Equal,
			ComparisonOperator.NotEqual,
			ComparisonOperator.IsNull,
			ComparisonOperator.IsNotNull,
			ComparisonOperator.In,
			ComparisonOperator.NotIn,
			ComparisonOperator.Like,
			ComparisonOperator.NotLike,
		];
	}

	private getComparisonOperatorsByNumeric(): ComparisonOperator[] {
		return [
			ComparisonOperator.Equal,
			ComparisonOperator.GreaterThan,
			ComparisonOperator.LessThan,
			ComparisonOperator.LessThanOrEqual,
			ComparisonOperator.GreaterThanOrEqual,
			ComparisonOperator.NotEqual,
			ComparisonOperator.IsNull,
			ComparisonOperator.IsNotNull,
			ComparisonOperator.In,
			ComparisonOperator.NotIn,
			ComparisonOperator.Between,
			ComparisonOperator.NotBetween,
		];
	}

	getComparisonOperatorsByDataType(dataType: DataType): ComparisonOperator[] {
		const dataTypeCategory = this.getDataTypeCategory(dataType);

		return this.getComparisonOperatorsByDataTypeCategory(dataTypeCategory);
	}

	getComparisonOperatorsByDataTypeCategory(
		dataTypeCategory: DataTypeCategory
	): ComparisonOperator[] {
		switch (dataTypeCategory) {
			case DataTypeCategory.DateTime:
			case DataTypeCategory.Bit:
			case DataTypeCategory.Numeric:
				return this.getComparisonOperatorsByNumeric();
			case DataTypeCategory.UUID:
				return this.getComparisonOperatorsByUUID();
			case DataTypeCategory.Boolean:
				return this.getComparisonOperatorsByBoolean();
			default:
				return this.getComparisonOperatorsByCharacter();
		}
	}

	getDataTypeCategory(dataType: DataType): DataTypeCategory {
		switch (dataType) {
			case DataType.UUID:
				return DataTypeCategory.UUID;
			case DataType.Boolean:
				return DataTypeCategory.Boolean;
			case DataType.Json:
				return DataTypeCategory.Json;
			case DataType.Xml:
				return DataTypeCategory.Xml;
			case DataType.Binary:
				return DataTypeCategory.Binary;
			case DataType.Date:
			case DataType.DateTime:
			case DataType.DateTimeUtc:
			case DataType.Time:
			case DataType.TimeUtc:
				return DataTypeCategory.DateTime;
			case DataType.Bit:
			case DataType.VaryingBit:
				return DataTypeCategory.Bit;
			case DataType.String:
			case DataType.AnsiString:
			case DataType.FixedString:
			case DataType.FixedAnsiString:
			case DataType.VaryingString:
			case DataType.VaryingAnsiString:
			case DataType.Email:
			case DataType.Uri:
			case DataType.HostName:
				return DataTypeCategory.Character;
			default:
				return DataTypeCategory.Numeric;
		}
	}

	toDate(value: string): Date {
		return parseDate(value);
	}

	fromDate(value: Date): string {
		return formatDate(value);
	}

	toDateTime(value: string): Date {
		return parseDate(value);
	}

	fromDateTime(value: Date): string {
		return formatDateTime(value);
	}

	toDateTimeUtc(value: string): Date {
		return toUTC(parseDate(value));
	}

	fromDateTimeUtc(value: Date): string {
		return formatDateTime(fromUTC(value));
	}

	toObjectRef(identifier: string): ObjectRef {
		return unEscapeRef(identifier);
	}

	escapeIdentifier(identifier: string | null): string | null {
		return escapeIdentifier(identifier);
	}
}

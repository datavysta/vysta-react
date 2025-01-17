import SelectStatement from '../../../Models/SelectStatement';
import formatDataType from './formatDataType';
import escapeRefIfRequired from './escapeRefIfRequired';
import unEscapeRef from './unEscapeRef';
import escapeIdentifierIfRequired from './escapeIdentifierIfRequired';
import escapeIdentifier from './escapeIdentifier';
import base64ToBlob from './base64ToBlob';
import blobToBase64 from './blobToBase64';
import ComparisonOperator from '../../../Models/ComparisonOperator';
import DataType from '../../../Models/DataType';
import DataTypeCategory from '../../../Models/DataTypeCategory';
import Writer from './writer';
import TableSource from '../../../Models/TableSource';
import ObjectRef from '../../../Models/ObjectRef';
import Join from '../../../Models/Join';
import SelectStatementItem from '../../../Models/SelectStatementItem';
import ColumnRef from '../../../Models/ColumnRef';

dayjs.extend(dayjsPluginUTC);

export default class Service {
	private static escapeSingleQuotes(value: string) {
		return value.split("'").join("''");
	}

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
		return dayjs(value).toDate();
	}

	fromDate(value: Date): string {
		return dayjs(value).format('YYYY-MM-DD');
	}

	toTime(value: string): Date {
		let dateTime = dayjs(
			'1970-01-01T' + value + '-00:00',
			'YYYY-MM-DDTHH:mm:ssZ'
		);
		dateTime = dateTime.add(-dateTime.utcOffset(), 'minutes');

		return dateTime.toDate();
	}

	fromTime(value: Date): string {
		return dayjs(value).format('HH:mm:ss');
	}

	toBlob(value: string): Blob {
		return base64ToBlob(value);
	}

	async fromBlob(value: Blob): Promise<string> {
		return await blobToBase64(value);
	}

	toDateTime(value: string): Date {
		let dateTime = dayjs(value + '-00:00', 'YYYY-MM-DDTHH:mm:ssZ');
		dateTime = dateTime.add(-dateTime.utcOffset(), 'minutes');

		return dateTime.toDate();
	}

	fromDateTime(value: Date): string {
		return dayjs(value).format('YYYY-MM-DDTHH:mm:ss');
	}

	toDateTimeUtc(value: string): Date {
		return dayjs(value, 'YYYY-MM-DDTHH:mm:ssZ').utc().toDate();
	}

	fromDateTimeUtc(value: Date): string {
		return dayjs(value).utc().format('YYYY-MM-DDTHH:mm:ssZ');
	}

	formatDataType(
		dataType: DataType | string,
		length: number | null,
		precision: number | null,
		scale: number | null
	): string {
		return formatDataType(dataType, length, precision, scale);
	}

	toBql(statement: SelectStatement): string {
		const writer = new Writer(statement);
		return writer.toBql();
	}

	toObjectRef(identifier: string): ObjectRef {
		return unEscapeRef(identifier);
	}

	fromObjectRef(objectRef: ObjectRef | ColumnRef): string {
		return escapeRefIfRequired(objectRef);
	}

	escapeIdentifier(identifier: string | null): string | null {
		return escapeIdentifier(identifier);
	}

	escapeIdentifierIfRequired(identifier: string | null): string | null {
		return escapeIdentifierIfRequired(identifier);
	}

	escapeValue(dataType: DataType, value: string | null) {
		if (value === null) {
			return 'NULL';
		}

		switch (dataType) {
			case DataType.Boolean:
				return value.toLowerCase();
			case DataType.String:
			case DataType.AnsiString:
			case DataType.VaryingString:
			case DataType.VaryingAnsiString:
			case DataType.FixedAnsiString:
			case DataType.FixedString:
			case DataType.Date:
			case DataType.DateTime:
			case DataType.DateTimeUtc:
			case DataType.Time:
			case DataType.TimeUtc:
				return "'" + Service.escapeSingleQuotes(value) + "'";
			default:
				return value;
		}
	}

	addSource(
		statement: SelectStatement,
		source: TableSource
	): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		newStatement.sources.push({ ...source });

		return newStatement;
	}

	removeSource(
		statement: SelectStatement,
		source: TableSource
	): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		const newSources = newStatement.sources.filter(
			(x) => x.id !== source.id
		);
		newStatement.sources = newSources;

		return newStatement;
	}

	changeSource(
		statement: SelectStatement,
		source: TableSource,
		objectRef: ObjectRef
	): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		const newSource = this.findTableSourceById(newStatement, source.id);
		if (!newSource) {
			throw new Error('source not found.');
		}

		newSource.object = objectRef;

		return newStatement;
	}

	changeJoin(
		statement: SelectStatement,
		source: TableSource,
		join: Join
	): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		const newSource = this.findTableSourceById(newStatement, source.id);
		if (!newSource) {
			throw new Error('source not found.');
		}

		const newJoins = newSource.joins.map((x) => {
			if (x.id !== join.id) {
				return x;
			}

			return _.cloneDeep(join);
		});

		newSource.joins = newJoins;

		return newStatement;
	}

	addJoin(
		statement: SelectStatement,
		source: TableSource,
		join: Join
	): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		const newTableSource = this.findTableSourceById(
			newStatement,
			source.id
		);
		if (!newTableSource) {
			throw new Error('table source not found.');
		}

		newTableSource.joins.push(_.cloneDeep(join));

		return newStatement;
	}

	removeJoin(
		statement: SelectStatement,
		source: TableSource,
		join: Join
	): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		const newTableSource = this.findTableSourceById(
			newStatement,
			source.id
		);
		if (!newTableSource) {
			throw new Error('table source not found.');
		}

		const newJoins: Join[] = newTableSource.joins.filter(
			(x) => x.id !== join.id
		);
		newTableSource.joins = newJoins;

		return newStatement;
	}

	addColumnFromSource(
		statement: SelectStatement,
		tableSource: TableSource,
		columnName: string
	): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		const item = new SelectStatementItem();
		item.expression = this.columnNameToBql(
			newStatement,
			tableSource,
			columnName
		);
		newStatement.items.push(item);

		return newStatement;
	}

	columnNameToBql(
		statement: SelectStatement,
		tableSource: TableSource,
		columnName: string
	): string {
		if (tableSource.alias) {
			return `${escapeIdentifierIfRequired(
				tableSource.alias
			)}.${escapeIdentifierIfRequired(columnName)}`;
		}

		const allSources = this.getAllSources(statement);
		if (allSources.length === 1) {
			const results = escapeIdentifierIfRequired(columnName);
			if (!results) {
				throw new Error('column name is null');
			}

			return results;
		}

		if (!tableSource.object) {
			throw new Error('object expected');
		}

		let expression = ObjectRef.toBql(tableSource.object);
		expression = expression + '.';
		expression = expression + `${escapeIdentifierIfRequired(columnName)}`;

		return expression;
	}

	removeColumnFromSource(
		statement: SelectStatement,
		tableSource: TableSource,
		columnName: string
	): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		const expression = this.columnNameToBql(
			statement,
			tableSource,
			columnName
		);
		const newItems = newStatement.items.filter(
			(i) => i.expression !== expression
		);

		newStatement.items = newItems;

		return newStatement;
	}

	addColumn(statement: SelectStatement): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		const item = new SelectStatementItem();
		newStatement.items.push(item);

		return newStatement;
	}

	removeColumn(statement: SelectStatement, id: string): SelectStatement {
		const newStatement = _.cloneDeep(statement);
		newStatement.items = newStatement.items.filter((x) => x.id !== id);

		return newStatement;
	}

	findTableSourceById(
		statement: SelectStatement,
		id: string
	): TableSource | null {
		for (const source of statement.sources) {
			const found = this.findTableSourceBySourceAndId(source, id);
			if (found) {
				return found;
			}
		}

		return null;
	}

	toBqlObjectRef(objectName: string): ObjectRef {
		return unEscapeRef(objectName);
	}

	private findTableSourceBySourceAndId(
		source: TableSource,
		id: string
	): TableSource | null {
		if (source.id === id) {
			return source;
		}

		for (const join of source.joins) {
			if (!join.tableSource) {
				continue;
			}

			const found = this.findTableSourceBySourceAndId(
				join.tableSource,
				id
			);
			if (found) {
				return found;
			}
		}

		return null;
	}

	getAllSources(statement: SelectStatement): TableSource[] {
		const sources: TableSource[] = [];
		for (const source of statement.sources) {
			sources.push(source);
			const children = this.getAllSourcesFromSource(source);
			for (const child of children) {
				sources.push(child);
			}
		}

		return sources;
	}

	private getAllSourcesFromSource(source: TableSource): TableSource[] {
		const children: TableSource[] = [];

		for (const join of source.joins) {
			if (!join.tableSource) {
				continue;
			}

			children.push(join.tableSource);

			const joinChildren = this.getAllSourcesFromSource(join.tableSource);
			for (const child of joinChildren) {
				children.push(child);
			}
		}

		return children;
	}

	getAllObjectReferences(statement: SelectStatement): ObjectRef[] {
		const objectRefs: ObjectRef[] = [];
		this.addObjectRefsFromSources(objectRefs, statement.sources);

		return objectRefs;
	}

	addObjectRefsFromSources(
		objectRefs: ObjectRef[],
		sources: TableSource[]
	): void {
		for (const source of sources) {
			if (!source.object) {
				continue;
			}

			if (this.containsRef(objectRefs, source.object)) {
				continue;
			}

			objectRefs.push(source.object);
		}

		for (const source of sources) {
			for (const join of source.joins) {
				this.addObjectRefsFromJoin(objectRefs, join);
			}
		}
	}

	private addObjectRefsFromJoin(objectRefs: ObjectRef[], join: Join): void {
		if (!join.tableSource) {
			return;
		}

		if (!join.tableSource.object) {
			return;
		}

		if (this.containsRef(objectRefs, join.tableSource.object)) {
			return;
		}

		objectRefs.push(join.tableSource.object);
	}

	private containsRef(
		objectRefs: ObjectRef[],
		objectRef: ObjectRef | null
	): boolean {
		for (const o of objectRefs) {
			if (ObjectRef.equals(o, objectRef)) {
				return true;
			}
		}

		return false;
	}
}

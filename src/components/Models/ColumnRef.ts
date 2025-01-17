import escapeRef from '../Filter/services/bql-service/escapeRef';
import ObjectRef from './ObjectRef';
import ObjectType from './ObjectType';

export default class ColumnRef extends ObjectRef {
	columnName: string | null = null;

	constructor(
		serverName: string | null,
		databaseName: string | null,
		schemaName: string | null,
		objectName: string | null,
		columnName: string
	) {
		super(
			ObjectType.Column,
			serverName,
			databaseName,
			schemaName,
			objectName
		);

		this.columnName = columnName;
	}

	toBql(): string {
		return escapeRef(this);
	}

	equals(value: ColumnRef | null): boolean {
		if (!value) {
			return false;
		}

		const sourceBql = this.toBql();
		const targetBql = value.toBql();

		return sourceBql === targetBql;
	}
}

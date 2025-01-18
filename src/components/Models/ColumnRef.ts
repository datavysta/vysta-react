import escapeRef from '../Filter/services/bql-service/escapeRef';
import ObjectType from './ObjectType';
import ObjectRef from './ObjectRef';

export default class ColumnRef {
	private objectRef: ObjectRef;
	columnName: string | null = null;

	constructor(
		serverName: string | null,
		databaseName: string | null,
		schemaName: string | null,
		objectName: string | null,
		columnName: string
	) {
		this.objectRef = new ObjectRef(
			ObjectType.Column,
			serverName,
			databaseName,
			schemaName,
			objectName
		);
		this.columnName = columnName;
	}

	get serverName(): string | null {
		return this.objectRef.serverName;
	}

	get databaseName(): string | null {
		return this.objectRef.databaseName;
	}

	get schemaName(): string | null {
		return this.objectRef.schemaName;
	}

	get objectName(): string | null {
		return this.objectRef.objectName;
	}

	get objectType(): ObjectType | null {
		return this.objectRef.objectType;
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

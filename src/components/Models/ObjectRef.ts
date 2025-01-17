import ObjectType from './ObjectType';
import Service from '../Filter/services/bql-service';
import formatRef from '../Filter/services/bql-service/formatRef';
import escapeRef from '../Filter/services/bql-service/escapeRef';

export default class ObjectRef {
	serverName: string | null = null;
	databaseName: string | null = null;
	schemaName: string | null = null;
	objectName: string | null = null;
	objectType: ObjectType | null = null;

	constructor(
		objectType: ObjectType | null,
		serverName: string | null,
		databaseName: string | null,
		schemaName: string | null,
		objectName: string | null
	) {
		this.objectType = objectType;
		this.serverName = serverName;
		this.databaseName = databaseName;
		this.schemaName = schemaName;
		this.objectName = objectName;
	}

	static parse(bql: string): ObjectRef {
		const service = new Service();
		return service.toObjectRef(bql);
	}

	static toBql(objectRef: ObjectRef): string {
		return escapeRef(objectRef);
	}

	static format(objRef: ObjectRef): string {
		return formatRef(objRef);
	}

	static equals(source: ObjectRef | null, target: ObjectRef | null): boolean {
		if (source === null && target === null) {
			return true;
		}

		if (!source) {
			return false;
		}

		if (!target) {
			return false;
		}

		const sourceBql = ObjectRef.toBql(source);
		const targetBql = ObjectRef.toBql(target);

		return sourceBql.toLowerCase() === targetBql.toLocaleLowerCase();
	}
}

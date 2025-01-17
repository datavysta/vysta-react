import escapeIdentifier from './escapeIdentifierIfRequired';
import ObjectRef from '../../../Models/ObjectRef';
import ColumnRef from '../../../Models/ColumnRef';

const escapeRefIfRequired = (ref: ObjectRef | ColumnRef): string => {
	let builder = '';

	if (ref.serverName) {
		const escapedServer = escapeIdentifier(ref.serverName);
		builder += `${escapedServer}.`;
	}

	if (ref.databaseName) {
		const escapedDatabase = escapeIdentifier(ref.databaseName);
		builder += `${escapedDatabase}.`;
	}

	if (ref.schemaName) {
		const escapedSchema = escapeIdentifier(ref.schemaName);
		builder += `${escapedSchema}.`;
	}

	if (ref.objectName) {
		const escapedObjectName = escapeIdentifier(ref.objectName);
		builder += escapedObjectName;
	}

	if (!(ref instanceof ColumnRef)) {
		return builder;
	}

	const colRef: ColumnRef = ref;

	if (colRef.columnName) {
		const escapedColumnName = escapeIdentifier(colRef.columnName);
		if (builder.length > 0) {
			builder += `.${escapedColumnName}`;
		} else {
			builder += `${escapedColumnName}`;
		}
	}

	return builder;
};

export default escapeRefIfRequired;

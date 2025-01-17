import ColumnRef from '../../../Models/ColumnRef';
import ObjectRef from '../../../Models/ObjectRef';

const formatRef = (ref: ObjectRef | ColumnRef): string => {
	let builder = '';

	if (ref.serverName) {
		builder += `${ref.serverName}.`;
	}

	if (ref.databaseName) {
		builder += `${ref.databaseName}.`;
	}

	if (ref.schemaName) {
		builder += `${ref.schemaName}.`;
	}

	if (ref.objectName) {
		builder += ref.objectName;
	}

	if (!(ref instanceof ColumnRef)) {
		return builder;
	}

	const colRef: ColumnRef = ref;

	if (colRef.columnName) {
		if (builder.length > 0) {
			builder += `.${colRef.columnName}`;
		} else {
			builder += `${colRef.columnName}`;
		}
	}

	return builder;
};

export default formatRef;

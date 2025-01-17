import splitString from '../../../../utils/splitString';
import unEscapeIdentifier from './unEscapeIdentifier';
import ObjectRef from '../../../Models/ObjectRef';

const unEscapeRef = (tableName: string): ObjectRef => {
	const parts = splitString(tableName, { quotes: ['"'], separator: '.' });

	const newParts = parts.map((part) => unEscapeIdentifier(part));

	if (parts.length === 1) {
		return new ObjectRef(null, null, null, null, newParts[0]);
	}

	if (parts.length === 2) {
		return new ObjectRef(null, null, null, newParts[0], newParts[1]);
	}

	console.error('Table name unsupported', tableName);
	throw new Error('unsupported tableName');
};

export default unEscapeRef;

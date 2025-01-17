import escapeIdentifier from './escapeIdentifier';

const regEx = '[ \t"]';

const escapeIdentifierIfRequired = (value: string | null): string | null => {
	if (value === null) {
		return null;
	}

	if (value.match(regEx) === null) {
		return value;
	}

	return escapeIdentifier(value);
};

export default escapeIdentifierIfRequired;

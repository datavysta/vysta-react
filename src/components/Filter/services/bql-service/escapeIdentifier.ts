const escapeToken = '"';
const escapeTokenEscaped = '\\"';

const escapeIdentifier = (value: string | null): string | null => {
	if (value === null) {
		return null;
	}

	const escapedValue = escapeDoubleQuotes(value);

	return `${escapeToken}${escapedValue}${escapeToken}`;
};

const escapeDoubleQuotes = (value: string | null): string | null => {
	if (value === null) {
		return null;
	}

	return value.replace(escapeToken, escapeTokenEscaped);
};

export default escapeIdentifier;

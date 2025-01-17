const escapeToken = '"';
const escapeTokenEscaped = '\\"';

const unEscapeIdentifier = (value: string | null): string | null => {
	if (value === null) {
		return null;
	}

	if (!(value.startsWith(escapeToken) && value.endsWith(escapeToken))) {
		return value;
	}

	const newValue = value.substring(1, value.length - 1);
	return unEscapeDoubleQuotes(newValue);
};

const unEscapeDoubleQuotes = (value: string): string => {
	return value.replace(escapeTokenEscaped, escapeToken);
};

export default unEscapeIdentifier;

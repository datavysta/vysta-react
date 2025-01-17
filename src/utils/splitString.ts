interface SplitOptions {
	quotes?: string[];
	separator?: string;
}

export function splitString(str: string, options: SplitOptions = {}): string[] {
	const { quotes = [], separator = '.' } = options;
	const result: string[] = [];
	let current = '';
	let inQuotes = false;
	let currentQuote = '';

	for (let i = 0; i < str.length; i++) {
		const char = str[i];

		// Handle quotes
		if (quotes.includes(char)) {
			if (!inQuotes) {
				inQuotes = true;
				currentQuote = char;
				current += char;
			} else if (currentQuote === char) {
				inQuotes = false;
				currentQuote = '';
				current += char;
			} else {
				current += char;
			}
			continue;
		}

		// Handle separator
		if (char === separator && !inQuotes) {
			if (current) {
				result.push(current);
				current = '';
			}
			continue;
		}

		current += char;
	}

	if (current) {
		result.push(current);
	}

	return result;
}

export default splitString; 
import { FC, useState } from 'react';
import { Autocomplete } from '@mantine/core';
import { FaSpinner } from 'react-icons/fa';
import IFieldProperty from '../../Models/public/fieldproperty';
import { useTranslationContext } from '../../Filter/TranslationContext';

const AutocompleteComponent: FC<IFieldProperty> = ({
	readOnly,
	disabled,
	error,
	value,
	label,
	data,
	onChange,
	onSearch
}) => {
	const [loading, setLoading] = useState(false);
	const [options, setOptions] = useState(data || []);

	const handleSearch = async (query: string) => {
		if (!onSearch) return;
		
		setLoading(true);
		try {
			const results = await onSearch({ keywords: query });
			setOptions(results);
		} finally {
			setLoading(false);
		}
	};

	if (readOnly) {
		return <>{value}</>;
	}

	return (
		<Autocomplete
			data={options}
			value={value || ''}
			onChange={value => onChange && onChange(value)}
			label={label}
			error={error}
			disabled={disabled}
			rightSection={loading ? <FaSpinner className="spin" /> : null}
			onSearchChange={handleSearch}
		/>
	);
};

export default AutocompleteComponent;

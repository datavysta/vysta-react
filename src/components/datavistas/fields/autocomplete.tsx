import { FC, useState, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { Autocomplete } from '@mantine/core';
import { FaSpinner } from 'react-icons/fa';
import IDataItem from '../../../public/dataitem';
import OrderByDirection from '../../Models/OrderByDirection';

interface IProps {
	items: IDataItem[];
	readOnly: boolean;
	name: string;
	required: boolean;
	label: string;
	loading: boolean;
	placeholder: string;
	description: string;
	value: string;
	multiple: boolean | undefined;
	onSearch: (condition: ISearchCondition) => void;
	onChange: (data: string) => void;
}

interface ISearchCondition {
	keywords: string | null;
	limit: number | null;
	offSet: number | null;
	orderBy: string;
	recordCount?: boolean;
	orderByPropertyNames: string[];
	tags: string[];
}

const searchCondition: ISearchCondition = {
	keywords: null,
	limit: null,
	offSet: null,
	orderBy: OrderByDirection.ASC,
	recordCount: true,
	orderByPropertyNames: [],
	tags: [],
};

const AutoCompleteComponent: FC<IProps> = ({
	readOnly,
	name,
	onSearch,
	onChange,
	required,
	label,
	loading,
	placeholder,
	description,
	value,
	items,
	multiple,
}: IProps) => {
	const [data, setData] = useState<any>([]);

	useEffect(() => {
		setItemsData();
	}, [onSearch]);

	const setItemsData = () => {
		const options = items
			? items.map(({ value, label }) => ({ value, label }))
			: [{ value, label: value }];
		setData(options);
	};

	// const filter = (options: string, search: IDataItem): OptionsFilter => {
	// 	const splittedSearch = search.value.toLowerCase().trim().split(' ');
	// 	return (options as ComboboxItem[]).filter((option) => {
	// 		const words = option.label.toLowerCase().trim().split(' ');
	// 		return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
	// 	});
	// };
	return (
		<>
			{!readOnly ? (
				<Autocomplete
					data={data}
					// itemComponent={AutoCompleteItem}
					readOnly={readOnly}
					key={name}
					required={required}
					label={label}
					placeholder={placeholder}
					description={description}
					multiple={multiple}
					onChange={(value) => onChange(value)}
					// filter={filter}
					value={value ? value : ''}
					// dropdownPosition="bottom"
					onDropdownOpen={() => onSearch && onSearch(searchCondition)}
					rightSection={loading && <FaSpinner />}
				/>
			) : (
				<>{value}</>
			)}
		</>
	);
};

export default withTranslation()(AutoCompleteComponent);

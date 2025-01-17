import {FC, ReactNode, useState} from 'react';
import {Box, Select, Highlight, Flex, ComboboxItem, ComboboxLikeRenderOptionInput} from '@mantine/core';
import {useTranslationContext} from '../TranslationContext';
import DataType from '../../Models/DataType';
import angleDown from "../../../assets/svg/angle-down.svg?react";
import {SvgIcon} from "../../SvgIcon.tsx";

interface IFilterProps {
	data: FilterAutocompleteOption[];
	dataType?: DataType;
	initialValue?: string;
	label?: string;
	onChange: (value: string) => void;
}

export interface FilterAutocompleteOption extends ComboboxItem {
	datatype: DataType;
	description?: string;
	group?: string;
	icon?: ReactNode;
	system: boolean;
	value: string;
	label: string;
	items: FilterAutocompleteOption[];
}

const renderOption = (
	searchValue: string,
	{option, checked}: ComboboxLikeRenderOptionInput<ComboboxItem>
	) => {
	const castOption = option as FilterAutocompleteOption;
	return (
		<Flex justify={'space-between'} align={'center'}>
			<Highlight
				fz={12}
				highlight={searchValue}
				highlightStyles={() => ({
					backgroundColor: '#F8EE00',
				})}
			>
				{castOption.label || castOption.value}
			</Highlight>
			<Box style={{opacity: checked ? 1 : 0.5}}>
				{castOption.icon}
			</Box>
			{castOption.description && (
				<Highlight
					fz={10}
					highlight={searchValue}
					highlightStyles={() => ({
						backgroundColor: '#F8EE00',
					})}
				>
					{castOption.description}
				</Highlight>
			)}
		</Flex>
	);
};

const FilterAutocomplete: FC<IFilterProps> = ({
	                                              data,
	                                              label,
	                                              initialValue,
	                                              onChange,
                                              }: IFilterProps) => {
	const { t } = useTranslationContext();
	const [value, setValue] = useState(initialValue || '');
	const [searchValue, setSearchValue] = useState("");

	const handleChange = (value: string | null) => {
		if (!value) {
			return;
		}
		setValue(value);
		onChange(value);
	};

	const cleanData = (data: FilterAutocompleteOption[]): void => {
		data.forEach((item) => {
			// Remove undefined groups
			if (!item.group) {
				delete item.group;
			}

			// If there are sub-items, recursively clean them
			if (item.items) {
				cleanData(item.items);
			}
		});
	};
	cleanData(data);

	return (
		<Box pos={'relative'}>
			<Select
				data={data || []}
				value={value}
				onChange={handleChange}
				label={label}
				placeholder={t('Select')}
				searchable
				onSearchChange={setSearchValue}
				renderOption={((item: ComboboxLikeRenderOptionInput<ComboboxItem>) =>
					renderOption(searchValue, item))}

				rightSection={<SvgIcon
					Icon={angleDown}
					size={18}
					style={{
						color: 'var(--mantine-color-Gray-25)',
					}}
					/>}
				rightSectionProps={{style: {pointerEvents: 'none'}}}
				style={{cursor: 'pointer'}}
			/>
		</Box>
	);
};

export default FilterAutocomplete;
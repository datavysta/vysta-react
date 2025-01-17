import {
	CheckIcon,
	Combobox,
	Group,
	Pill,
	PillsInput,
	ScrollArea,
	useCombobox,
	FocusTrap,
	Text,
	useMantineTheme,
	Flex,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import '../components/css/MultiSelectCustom.css';
import { FilterAutocompleteOption } from './FilterAutocomplete.tsx';
import { FilterDefinitionWrapper } from '../FilterDefinitionsByField.ts';

interface IProps {
	data: FilterAutocompleteOption[];
	searchOptions?: FilterAutocompleteOption[];
	tempData?: FilterAutocompleteOption[];
	onChange: (values: string[]) => void;
	onSearchChange: (keyword: string) => void;
	onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
	initialValues?: string[];
	filterDefinition?: FilterDefinitionWrapper;
}

const MultiSelectCustom = ({
	data,
	initialValues,
	searchOptions,
	tempData,
	onChange,
	onSearchChange,
	onScroll,
}: IProps) => {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});
	const theme = useMantineTheme();

	const [search, setSearch] = useState('');
	const [value, setValue] = useState<string[]>(initialValues || []);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		onChange(value);
	}, [value]);

	useEffect(() => {
		// initialValues changed from outside this component
		setValue(initialValues || []);
	}, [initialValues]);

	useEffect(() => {
		if (combobox.dropdownOpened && scrollAreaRef.current) {
			scrollAreaRef.current.scrollTo({ top: 0 });
		}
	}, [combobox.dropdownOpened]);

	useEffect(() => {
		onSearchChange(search);
	}, [search]);

	const handleValueSelect = (val: string) => {
		setSearch('');
		setValue((current) =>
			current.includes(val)
				? current.filter((v) => v !== val)
				: [...current, val]
		);
	};

	const handleValueRemove = (val: string) =>
		setValue((current) => current.filter((v) => v !== val));

	const groupedData = (
		search && !!searchOptions?.length ? searchOptions : data
	).reduce(
		(acc, item) => {
			const group = item.group || 'Ungrouped';
			if (!acc[group]) {
				acc[group] = [];
			}
			acc[group].push(item);
			return acc;
		},
		{} as Record<string, FilterAutocompleteOption[]>
	);

	const options = Object.entries(groupedData)
		.filter(([_, items]) =>
			items.some((item) =>
				item.label.toLowerCase().includes(search.trim().toLowerCase())
			)
		)
		.map(([group, items]) =>
			group === 'Ungrouped' ? (
				items
					.filter((item) =>
						item.label
							.toLowerCase()
							.includes(search.trim().toLowerCase())
					)
					.map((item) => (
						<Combobox.Option
							value={item.value}
							key={item.value}
							active={value.includes(item.value)}
						>
							<Flex align={'center'} justify={'space-between'}>
								{value.includes(item.value) && (
									<CheckIcon size={12} />
								)}
								<Flex direction={'column'} maw={'90%'}>
									<Text fz={12} w={'100%'}>
										{item.label}
									</Text>
									{item.description && (
										<Text fz={10} c={theme.colors.dark[2]}>
											{item.description}
										</Text>
									)}
								</Flex>
							</Flex>
						</Combobox.Option>
					))
			) : (
				<Combobox.Group label={group} key={group}>
					{items
						.filter((item) =>
							item.label
								.toLowerCase()
								.includes(search.trim().toLowerCase())
						)
						.map((item) => (
							<Combobox.Option
								value={item.value}
								key={item.value}
								active={value.includes(item.value)}
							>
								<Group gap="sm">
									{value.includes(item.value) && (
										<CheckIcon size={12} />
									)}
									<span>{item.label}</span>
								</Group>
							</Combobox.Option>
						))}
				</Combobox.Group>
			)
		);

	const elements = (tempData ? [...data, ...tempData] : data)
		.filter((option) => value.includes(option.value))
		.map((item) => (
			<Pill
				key={item.value}
				withRemoveButton
				onRemove={() => handleValueRemove(item.value)}
			>
				{item.label}
			</Pill>
		));

	return (
		<div className="multiselect-custom">
			<Combobox
				store={combobox}
				onOptionSubmit={handleValueSelect}
				withinPortal={true}
			>
				<Combobox.DropdownTarget>
					<PillsInput
						onClick={() => {
							combobox.openDropdown();
							setSearch('');
						}}
					>
						<Pill.Group>
							{elements}

							<Combobox.EventsTarget>
								<PillsInput.Field
									onFocus={() => {
										combobox.openDropdown();
										setSearch('');
									}}
									onChange={() => {
										combobox.updateSelectedOptionIndex();
									}}
									onKeyDown={(event) => {
										if (
											event.key === 'Backspace' &&
											search.length === 0
										) {
											event.preventDefault();
											handleValueRemove(
												value[value.length - 1]
											);
										}
									}}
								/>
							</Combobox.EventsTarget>
						</Pill.Group>
					</PillsInput>
				</Combobox.DropdownTarget>

				<Combobox.Dropdown>
					{(data.length > 10 || search) && (
						<FocusTrap active={combobox.dropdownOpened}>
							<Combobox.Search
								value={search}
								autoFocus
								onChange={(event) => {
									setSearch(event.currentTarget.value);
								}}
								placeholder="Search"
								rightSection={<CiSearch size={16} />}
							/>
						</FocusTrap>
					)}
					<ScrollArea.Autosize
						mah={'30vh'}
						mx="auto"
						onScrollCapture={onScroll}
						viewportRef={scrollAreaRef}
					>
						<Combobox.Options>
							{options.length > 0 ? (
								options
							) : (
								<Combobox.Empty>Nothing found</Combobox.Empty>
							)}
						</Combobox.Options>
					</ScrollArea.Autosize>
				</Combobox.Dropdown>
			</Combobox>
		</div>
	);
};

export default MultiSelectCustom;

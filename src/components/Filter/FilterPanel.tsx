import {FC, useCallback, useMemo, useState} from 'react';
import { useTranslationContext } from './TranslationContext';
import { Group, Button, Flex, Box } from '@mantine/core';
import Condition from '../Models/Condition';
import ExpressionCondition from '../Models/ExpressionCondition';
import GroupCondition from '../Models/GroupCondition';
import Filter from './Filter';
import { AiOutlinePlus } from 'react-icons/ai';
import filterNestedConditions from '../../utils/filterNestedConditions';
import filterEmptyGroups from '../../utils/filterEmptyGroups';
import updateNestedCondition from '../../utils/updateNestedCondition';
import { ConditionMode } from './ConditionMode';
import { Text } from '@mantine/core';
import { Select } from '@mantine/core';
import { BsChevronDown } from 'react-icons/bs';
import SaveFilterButton from './components/SaveFilterButton';
import {FilterDefinitionsByField} from "./FilterDefinitionsByField";
import DataType from "../Models/DataType";
import {ColDef} from "ag-grid-community";
import ConditionType from '../Models/ConditionType';
import CustomCloseButton from '../CloseButton.tsx';

interface IFilterProps {
	conditions: Condition[];
	// @deprecated Use `filterDefinitions` instead.
	colDef?: ColDef[];
	filterDefinitions?: FilterDefinitionsByField;
	asideTitle?: string;
	onApply?(conditions: Condition[]): void;
	onChange?(conditions: Condition[]): void;
	hideClear?:boolean;
	onClose?: () => void;
}

export const filterButtonStyle = {
	border: '1px solid var(--mantine-color-dark-18)',
	fontSize: '12px',
	fontWeight: 400,
	color: 'var(--mantine-color-default-color)',
};

const FilterPanel: FC<IFilterProps> = ({
	conditions,
	colDef,
	asideTitle,
	onApply,
	onChange,
    filterDefinitions,
	hideClear = true,
	onClose,
}: IFilterProps) => {
	const { t } = useTranslationContext();

	const validateConditions = useCallback(async (conditions: Condition[]): Promise<Condition[]> => {
		if (!filterDefinitions) {
			return conditions;
		}

		return await Promise.all(conditions.map(async condition => {
			if (condition.type === ConditionType.Group) {
				const groupCondition = condition as GroupCondition;
				groupCondition.children = await validateConditions(groupCondition.children);
				return groupCondition;
			}

			const definition = filterDefinitions.find(def => def.targetFieldName === condition.propertyName);
			if (definition?.loader) {
				const selectColumns = definition.loaderColumns || ["id", "name"];
				try {
					const options = await definition.loader({ limit: 5000, select: selectColumns });
					const validValues = options.data.map(option => {
						const key = selectColumns[0] as keyof typeof option;
						return option[key];
					});
					condition.values = condition.values.filter(value => validValues.includes(value));
				} catch (error) {
					console.error('Error loading options for validation:', error);
				}
			}
			return condition;
		}));
	}, [filterDefinitions]);

	const handleOnChange = useCallback(async (conditions: Condition[]) => {
		if (filterDefinitions) {
			const validatedConditions = await validateConditions(conditions);
			onChange?.(validatedConditions);
		} else {
			onChange?.(conditions);
		}
	}, [filterDefinitions, onChange, validateConditions]);

	const filterDefinitionParameter: FilterDefinitionsByField = useMemo(() => {
		if (filterDefinitions) {
			return filterDefinitions;
		}

		return (colDef || [])
			.filter((column) => column.field)
			.filter((column) => !column.hide)
			.sort((a, b) => (a.headerName || "").localeCompare(b.headerName || ""))
			.map((column) => ({
				targetFieldName: column.field || "",
				label: column.headerName || "",

				// Can be set
				dataType: (column as { dataType?: DataType }).dataType
			}));
	}, [filterDefinitions, colDef]);

	const getPreparedGroup = useCallback(() => {
		const group = new GroupCondition();
		group.children.push(new ExpressionCondition());
		return group;
	}, []);

	const handleConditionChange = useCallback(async (condition: Condition) => {
		setCurrentConditions((prevConditions) => {
			const newConditions = updateNestedCondition(
				prevConditions,
				condition
			);
			handleOnChange(newConditions);
			return newConditions;
		});
	}, [handleOnChange]);

	const [currentConditions, setCurrentConditions] = useState<Condition[]>(() => {
		if (conditions.length > 0 && conditions[0].children[0]?.propertyName) {
			return conditions;
		}

		return [getPreparedGroup()];
	});

	const isFirstConditionOnly =
		currentConditions?.length === 1 &&
		currentConditions[0].children?.length === 1;

	const handleAddCondition = useCallback((
		condition: Condition,
		parent?: GroupCondition
	) => {
		setCurrentConditions((prevConditions) => {
			if (parent) {
				const updatedParent = prevConditions.map((cond) => {
					if (cond.id === parent.id) {
						cond.children?.push(condition);
					}
					return cond;
				});

				return updatedParent;
			}

			return [...prevConditions, condition];
		});
	}, []);

	const handleDeleteCondition = useCallback((condition: Condition) => {
		setCurrentConditions((previousConditions) => {
			let newConditions = filterNestedConditions(
				previousConditions,
				condition.id
			);
			newConditions = filterEmptyGroups(newConditions);
			handleOnChange(newConditions);
			return newConditions;
		});
	}, [handleOnChange]);

	const isSomeConditionInvalid = useCallback(() =>
		currentConditions?.some(
			(group) => group.children?.some((expr) => !expr.valid)
		), [currentConditions]);

	const isFirstConditionValid = useCallback(() => {
		const firstCondition = currentConditions[0]
			?.children[0] as ExpressionCondition;

		return (
			firstCondition.propertyName &&
			firstCondition.comparisonOperator &&
			firstCondition.values !== null
		);
	}, [currentConditions]);

	const getIsApplyDisabled = useMemo(() => {
		return isFirstConditionOnly
			? !isFirstConditionValid()
			: isSomeConditionInvalid();
	}, [isFirstConditionOnly, isFirstConditionValid, isSomeConditionInvalid]);

	const handleApply = useCallback(async () => {
		const validatedConditions = await validateConditions(currentConditions);
		onApply?.(validatedConditions);
	}, [currentConditions, validateConditions, onApply]);

	const handleClear = useCallback(() => {
		onApply?.([]);
	}, [getPreparedGroup, handleOnChange]);

	return (
		<Box px={'sm'} py={'xs'} className="filterPanel">
			{asideTitle ? (
				<Flex
					justify={'space-between'}
					w={'100%'}
					pb={'sm'}
					mb={'sm'}
					style={{
						borderBottom: '1px solid var(--mantine-color-gray-3)',
					}}
				>
					<Text c={'var(--mantine-color-default-color'}>
						{asideTitle}
					</Text>

					<Button
						style={filterButtonStyle}
						variant={'outline'}
						leftSection={<AiOutlinePlus />}
						onClick={() => handleAddCondition(getPreparedGroup())}
					>
						{t('Add Filter Group')}
					</Button>
				</Flex>
			) : (
				<Flex justify={'space-between'} w={'100%'} mb={20} align={"center"}>
					<Text c={'var(--mantine-color-default-color'}>Filters</Text>
					<Flex direction={'row'} gap={12} align={'center'}>
						<Text
							c={'var(--mantine-color-gray-20)'}
							fz={'12px'}
							fw={500}
							variant={'transparent'}
							onClick={() =>
								setCurrentConditions([getPreparedGroup()])
							}
							style={{ cursor: 'pointer' }}
						>
							{t('Clear All Filters')}
						</Text>
						<Select
							size="xs"
							w={125}
							placeholder="Saved Filters"
							rightSection={<BsChevronDown size={12} />}
						/>
						{onClose && (
  							<CustomCloseButton onClickAction={onClose} />
						)}
					</Flex>
				</Flex>
			)}
			<Filter
				conditions={currentConditions}
				filterDefinitions={filterDefinitionParameter}
				onChange={handleConditionChange}
				onAddCondition={handleAddCondition}
				onDelete={handleDeleteCondition}
				conditionMode={ConditionMode.ValueBased}
				showAddConditionButton={false}
				showWhereLabel={true}
				firstRowRequired={false}
			/>

			<Flex
				pt={20}
				justify={asideTitle ? 'flex-end' : 'space-between'}
				w="100%"
				align={'center'}
			>
				{!asideTitle && (
					<Button
						size={'xs'}
						style={filterButtonStyle}
						variant={'outline'}
						leftSection={<AiOutlinePlus />}
						onClick={() => handleAddCondition(getPreparedGroup())}
					>
						{t('Add Filter Group')}
					</Button>
				)}
				<Group justify="right">
					{!hideClear && (
						<Button
							size={'xs'}
							variant={"subtle"}
							onClick={handleClear}
						>
							{t('Clear')}
						</Button>
					)}
					{!asideTitle && <SaveFilterButton />}
					{onApply && (
						<Button
							disabled={getIsApplyDisabled}
							size={'xs'}
							style={{ ...filterButtonStyle, borderColor: !getIsApplyDisabled ? 'var(--mantine-color-Accent-4)' : undefined }}
							color={'var(--mantine-color-Accent-3)'}
							onClick={handleApply}
						>
							{t('Apply Filter')}
						</Button>
					)}
				</Group>
			</Flex>
		</Box>
	);
};

export default FilterPanel;

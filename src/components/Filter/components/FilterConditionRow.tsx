import { FC, useEffect, useMemo, useState } from 'react';
import { Grid, ThemeIcon } from '@mantine/core';
import FilterAutocomplete, {
	FilterAutocompleteOption,
} from './FilterAutocomplete';
import FilterComparisonOperator from './FilterComparisonOperator';
import FilterRightHandSide from './FilterRightHandSide';
import FilterOperator from './FilterOperator';
import { FiMinusCircle } from 'react-icons/fi';
import Condition from '../../Models/Condition';
import ComparisonOperator from '../../Models/ComparisonOperator';
import DataType from '../../Models/DataType';
import ExpressionCondition from '../../Models/ExpressionCondition';
import { ConditionMode } from '../ConditionMode';
import FilterExpressionRightHandSide from './FilterExpressionRightHandside';
import {
	FilterDefinitionsByField,
	FilterDefinitionWrapper,
} from '../FilterDefinitionsByField.ts';
import FilterRightHandSideLoader from './FilterRightHandSideLoader.tsx';
import useUpdateEffect from '../../../hooks/useUpdateEffect.ts';

interface IFilterProps {
	condition: Condition;
	filterDefinitions: FilterDefinitionsByField;
	index: number;
	onDelete: () => void;
	onChange: (condition: Condition) => void;
	firstConditionRendered: boolean;
	onlyConditionInGroup: boolean;
	conditionMode: ConditionMode;
	showWhereLabel: boolean;
	firstRowRequired?: boolean;
}

const FilterConditionRow: FC<IFilterProps> = ({
	condition,
	index,
	onDelete,
	onChange,
	firstConditionRendered,
	onlyConditionInGroup,
	conditionMode,
	firstRowRequired,
	filterDefinitions,
}: IFilterProps) => {
	const [expressionCondition, setExpressionCondition] = useState<Condition>({
		...condition,
		comparisonOperator:
			condition.comparisonOperator || ComparisonOperator.In,
	});

	const findFilterDefinitionByColumnName = (
		filterDefinitions: FilterDefinitionsByField,
		columnName?: string
	): FilterDefinitionWrapper | undefined => {
		for (const def of filterDefinitions) {
			if (def.targetFieldName === columnName) {
				return def;
			}
			if (def.items) {
				const result = findFilterDefinitionByColumnName(
					def.items,
					columnName
				);
				if (result) {
					return result;
				}
			}
		}
		return undefined;
	};

	const getDataTypeForColumnName = (
		filterDefinitions: FilterDefinitionsByField,
		columnName?: string
	): DataType | undefined => {
		const filterDefinition = findFilterDefinitionByColumnName(
			filterDefinitions,
			columnName
		);
		return filterDefinition?.dataType || DataType.String;
	};

	const { comparisonOperator, propertyName, values } = expressionCondition;
	const defaultDataType =
		conditionMode === ConditionMode.ExpressionBased
			? DataType.String
			: getDataTypeForColumnName(filterDefinitions, propertyName);
	const [dataType, setDataType] = useState<DataType | undefined>(
		defaultDataType
	);

	const filterDefinition = useMemo(
		() => findFilterDefinitionByColumnName(filterDefinitions, propertyName),
		[propertyName]
	);

	const isComparisonOperatorNullOrNotNull =
		ComparisonOperator.IsNull === expressionCondition.comparisonOperator ||
		ComparisonOperator.IsNotNull === expressionCondition.comparisonOperator;
	const isFirstElement = index === 0;

	useUpdateEffect(() => {
		// Only run after the first load
		const isValid = checkIsValid();

		if (!isValid && !expressionCondition.values.length) {
			onChange({ ...expressionCondition, valid: true });
		} else if (isValid) {
			onChange({ ...expressionCondition, valid: true });
		}
	}, [expressionCondition]);

	useEffect(() => {
		isComparisonOperatorNullOrNotNull &&
			setExpressionCondition({ ...expressionCondition, values: [] });
	}, [comparisonOperator]);

	const handleLeftSideChange = (value: string) => {
		if (conditionMode === ConditionMode.ExpressionBased) {
			setExpressionCondition({
				...expressionCondition,
				leftExpression: value,
				// Clear
				rightExpression: '',
				startExpression: '',
				stopExpression: '',
			});
			setDataType(DataType.String);
			return;
		}

		// Clear
		setExpressionCondition({
			...expressionCondition,
			propertyName: value,
			values: [],
		});

		const dataType = getDataTypeForColumnName(filterDefinitions, value);
		setDataType(dataType);
	};

	const checkIsValid = (): boolean => {
		if (conditionMode === ConditionMode.ExpressionBased) {
			return (
				!_.isEmpty(expressionCondition.leftExpression) &&
				checkRightExpression()
			);
		}

		if (index === 0 && values.length === 0) {
			return !propertyName ? true : checkRightExpression();
		} else {
			return checkRightExpression();
		}
	};

	const checkRightExpression = (): boolean => {
		if (
			comparisonOperator === ComparisonOperator.IsNotNull ||
			comparisonOperator === ComparisonOperator.IsNull
		) {
			return conditionMode === ConditionMode.ExpressionBased
				? _.isEmpty(expressionCondition.rightExpression)
				: values.length === 0;
		} else {
			return conditionMode === ConditionMode.ExpressionBased
				? !_.isEmpty(expressionCondition.rightExpression)
				: values.length > 0;
		}
	};

	const getFilterDefinition = (
		filterDefinitions: FilterDefinitionsByField
	): FilterAutocompleteOption[] => {
		return filterDefinitions.map((fd) => {
			return {
				value: fd.targetFieldName || fd.group,
				datatype: fd.dataType,
				label: fd.label || fd.group,
				group: fd.group,
				items: getFilterDefinition(fd.items || []),
			} as FilterAutocompleteOption;
		});
	};

	const leftSideListOptions: FilterAutocompleteOption[] = useMemo(
		() => getFilterDefinition(filterDefinitions),
		[filterDefinitions]
	);

	const isDeleteRowVisible = () =>
		firstRowRequired ? !isFirstElement : true;

	const renderRightHandSide = () => {
		if (isComparisonOperatorNullOrNotNull) {
			return null;
		}

		// Expressions go this way
		if (conditionMode === ConditionMode.ExpressionBased) {
			return (
				<FilterExpressionRightHandSide
					expressionCondition={
						expressionCondition as ExpressionCondition
					}
					data={leftSideListOptions}
					onChange={setExpressionCondition}
				/>
			);
		}

		// Value based assumed
		const useLoader =
			(expressionCondition.comparisonOperator ===
				ComparisonOperator.Equal ||
				expressionCondition.comparisonOperator ===
					ComparisonOperator.NotEqual ||
				expressionCondition.comparisonOperator ===
					ComparisonOperator.In ||
				expressionCondition.comparisonOperator ===
					ComparisonOperator.NotIn) &&
			filterDefinition?.loader;

		if (useLoader) {
			return (
				<FilterRightHandSideLoader
					filterDefinition={filterDefinition}
					expressionCondition={
						expressionCondition as ExpressionCondition
					}
					onChange={setExpressionCondition}
				/>
			);
		}

		return (
			<FilterRightHandSide
				onChange={setExpressionCondition}
				dataType={dataType}
				expressionCondition={expressionCondition as ExpressionCondition}
			/>
		);
	};

	return (
		<Grid columns={12} justify="start" align="start">
			{!onlyConditionInGroup &&
				!firstConditionRendered &&
				!isFirstElement && (
					<Grid.Col
						span={1.75}
						display={'flex'}
						style={{ justifyContent: 'flex-end' }}
					>
						<FilterOperator
							initialValue={expressionCondition.operator}
							onChange={(value) =>
								setExpressionCondition({
									...expressionCondition,
									operator: value,
								})
							}
						/>
					</Grid.Col>
				)}
			<Grid.Col span={4}>
				<FilterAutocomplete
					data={leftSideListOptions}
					dataType={dataType}
					onChange={handleLeftSideChange}
					initialValue={
						conditionMode === ConditionMode.ValueBased
							? expressionCondition.propertyName
							: expressionCondition.leftExpression
					}
				/>
			</Grid.Col>
			<Grid.Col span={'auto'}>
				{dataType && (
					<Grid columns={12} justify="start" align="start">
						<Grid.Col span={5}>
							<FilterComparisonOperator
								dataType={
									conditionMode ===
									ConditionMode.ExpressionBased
										? undefined
										: dataType
								}
								value={
									expressionCondition.comparisonOperator as ComparisonOperator
								}
								onChange={(value) =>
									setExpressionCondition({
										...expressionCondition,
										comparisonOperator: value,
									})
								}
							/>
						</Grid.Col>
						<Grid.Col span={7}>{renderRightHandSide()}</Grid.Col>
					</Grid>
				)}
			</Grid.Col>
			<Grid.Col span={0.75} pt={12}>
				{isDeleteRowVisible() && (
					<ThemeIcon
						variant="subtle"
						onClick={onDelete}
						c={'var(--mantine-color-gray-7)'}
					>
						<FiMinusCircle cursor="pointer" />
					</ThemeIcon>
				)}
			</Grid.Col>
		</Grid>
	);
};

export default FilterConditionRow;

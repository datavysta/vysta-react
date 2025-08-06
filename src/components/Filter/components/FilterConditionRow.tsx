import { FC, useEffect, useMemo, useState } from 'react';
import FilterAutocomplete, {
	FilterAutocompleteOption,
} from './FilterAutocomplete';
import FilterComparisonOperator from './FilterComparisonOperator';
import FilterRightHandSide from './FilterRightHandSide';
import FilterOperator from './FilterOperator';
import Condition from '../../Models/Condition';
import ComparisonOperator from '../../Models/ComparisonOperator';
import DataType from '../../Models/DataType';
import ExpressionCondition from '../../Models/ExpressionCondition';
import { ConditionMode } from '../ConditionMode';
import FilterExpressionRightHandSide from './FilterExpressionRightHandside';
import {
	FilterDefinitionsByField,
	FilterDefinitionWrapper,
} from '../FilterDefinitionsByField';
import FilterRightHandSideLoader from './FilterRightHandSideLoader';
import useUpdateEffect from '../../../hooks/useUpdateEffect';
import isEmpty from "../../../utils/isEmpty";
import './FilterConditionRow.css';

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
	onlyConditionInGroup,
	conditionMode,
	firstRowRequired,
	filterDefinitions,
}: IFilterProps) => {
	const [expressionCondition, setExpressionCondition] = useState<Condition>({
		...condition,
		comparisonOperator:
			condition.comparisonOperator || ComparisonOperator.Equal,
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

	const { comparisonOperator, columnName, values } = expressionCondition;
	const defaultDataType =
		conditionMode === ConditionMode.ExpressionBased
			? DataType.String
			: getDataTypeForColumnName(filterDefinitions, columnName);
	const [dataType, setDataType] = useState<DataType | undefined>(
		defaultDataType
	);

	const filterDefinition = useMemo(
		() => findFilterDefinitionByColumnName(filterDefinitions, columnName),
		[columnName]
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
		if (isComparisonOperatorNullOrNotNull) {
			setExpressionCondition({ ...expressionCondition, values: [] });
		}
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
			columnName: value,
			values: [],
		});

		const dataType = getDataTypeForColumnName(filterDefinitions, value);
		setDataType(dataType);
	};

	const checkIsValid = (): boolean => {
		if (conditionMode === ConditionMode.ExpressionBased) {
			return (
				!isEmpty(expressionCondition.leftExpression) &&
				checkRightExpression()
			);
		}

		if (index === 0 && values.length === 0) {
			return !columnName ? true : checkRightExpression();
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
				? isEmpty(expressionCondition.rightExpression)
				: values.length === 0;
		} else {
			return conditionMode === ConditionMode.ExpressionBased
				? !isEmpty(expressionCondition.rightExpression)
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
			!!filterDefinition?.repository;

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
		<div className="filter-condition-row">
			<div className="filter-condition-content">
				{!isFirstElement && !onlyConditionInGroup && (
					<div className="filter-operator-col">
						<FilterOperator 
							initialValue={expressionCondition.operator}
							onChange={(value) => setExpressionCondition({
								...expressionCondition,
								operator: value,
							})} 
						/>
					</div>
				)}
				<div className="filter-left-side-col">
					<FilterAutocomplete
						data={leftSideListOptions}
						initialValue={conditionMode === ConditionMode.ExpressionBased ? expressionCondition.leftExpression : expressionCondition.columnName}
						onChange={handleLeftSideChange}
						dataType={dataType}
					/>
				</div>
				<div className="filter-comparison-col">
					<FilterComparisonOperator
						value={expressionCondition.comparisonOperator as ComparisonOperator}
						onChange={(value) => setExpressionCondition({
							...expressionCondition,
							comparisonOperator: value,
						})}
						dataType={conditionMode === ConditionMode.ExpressionBased ? undefined : dataType}
					/>
				</div>
				<div className="filter-right-side-col">
					{renderRightHandSide()}
				</div>
				{isDeleteRowVisible() && (
					<div className="filter-delete-col">
						<button className="filter-delete-button" onClick={onDelete}>
							⊖
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default FilterConditionRow;

import {FC, useEffect} from 'react';
import FilterAutocomplete, {
	FilterAutocompleteOption,
} from './FilterAutocomplete';
import ExpressionCondition from '../../Models/ExpressionCondition';
import ComparisonOperator from '../../Models/ComparisonOperator';
import {ConditionMode} from '../ConditionMode';
import DataType from '../../Models/DataType';
import isNil from '../../../utils/isNil';

interface IFilterProps {
	expressionCondition: ExpressionCondition;
	data: FilterAutocompleteOption[];
	onChange: (bqlExpressionCondition: ExpressionCondition) => void;
	label?: string;
}

const FilterExpressionRightHandSide: FC<IFilterProps> = ({
    label,
    onChange,
    data,
    expressionCondition,
}: IFilterProps) => {
	const {comparisonOperator} = expressionCondition;

	const isComparisonOperatorBetweenOrNotBetween =
		comparisonOperator === ComparisonOperator.Between ||
		comparisonOperator === ComparisonOperator.NotBetween;

	const onChangeRunner = (
		func: (
			bqlConditionMode: ConditionMode,
			expressionCondition: ExpressionCondition,
			value: string
		) => void,
		value: string
	) => {
		const copy = {...expressionCondition};
		func(ConditionMode.ExpressionBased, copy, value);
		onChange(copy);
	};

	useEffect(() => {
		// Toggle between between and not between, moving the values around
		if (isComparisonOperatorBetweenOrNotBetween) {
			if (
				isNil(
					ExpressionCondition.getStartExpression(
						ConditionMode.ExpressionBased,
						expressionCondition
					)
				)
			) {
				const currentRightExpression =
					ExpressionCondition.getRightExpression(
						ConditionMode.ExpressionBased,
						expressionCondition
					);
				// If we have a right expression, put that into the start expression
				if (!isNil(currentRightExpression)) {
					ExpressionCondition.setStartExpression(
						ConditionMode.ExpressionBased,
						expressionCondition,
						currentRightExpression
					);
					ExpressionCondition.setRightExpression(
						ConditionMode.ExpressionBased,
						expressionCondition,
						undefined
					);
					onChange(expressionCondition);
				}
			}
		} else {
			if (
				isNil(
					ExpressionCondition.getRightExpression(
						ConditionMode.ExpressionBased,
						expressionCondition
					)
				)
			) {
				const currentStartExpression =
					ExpressionCondition.getStartExpression(
						ConditionMode.ExpressionBased,
						expressionCondition
					);
				// If we have a start expression, put that into the right expression
				if (!isNil(currentStartExpression)) {
					ExpressionCondition.setRightExpression(
						ConditionMode.ExpressionBased,
						expressionCondition,
						currentStartExpression
					);
					ExpressionCondition.setStartExpression(
						ConditionMode.ExpressionBased,
						expressionCondition,
						undefined
					);
					ExpressionCondition.setStopExpression(
						ConditionMode.ExpressionBased,
						expressionCondition,
						undefined
					);
					onChange(expressionCondition);
				}
			}
		}
	}, [isComparisonOperatorBetweenOrNotBetween]);

	const renderAutoComplete = (
		onChange: (value: string) => void,
		initialValue: string | undefined
	) => {
		return (
			<FilterAutocomplete
				data={data}
				dataType={DataType.String}
				onChange={onChange}
				initialValue={initialValue}
				label={label}
			/>
		);
	};

	return !isComparisonOperatorBetweenOrNotBetween ? (
		<>
			{renderAutoComplete(
				onChangeRunner.bind(
					null,
					ExpressionCondition.setRightExpression
				),
				expressionCondition.rightExpression
			)}
		</>
	) : (
		<>
			{renderAutoComplete(
				onChangeRunner.bind(
					null,
					ExpressionCondition.setStartExpression
				),
				expressionCondition.startExpression
			)}
			{renderAutoComplete(
				onChangeRunner.bind(
					null,
					ExpressionCondition.setStopExpression
				),
				expressionCondition.stopExpression
			)}
		</>
	);
};

export default FilterExpressionRightHandSide;

import {FC, useEffect, useState} from 'react';
import DataType from '../../Models/DataType';
import ExpressionCondition from '../../Models/ExpressionCondition';
import {useDataTypeComponentFactory} from '../../datavistas/datatypecomponentfactory';
import ComparisonOperator from '../../Models/ComparisonOperator';
import {ConditionMode} from '../ConditionMode';
import IFieldProperty from "../../Models/public/fieldproperty";
import isNil from '../../../utils/isNil';
import useUpdateEffect from "../../../hooks/useUpdateEffect";

interface IFilterProps {
	dataType?: DataType;
	expressionCondition: ExpressionCondition;
	onChange: (expressionCondition: ExpressionCondition) => void;
	label?: string;
}

interface IBaseFieldProperty {
	label?: string;
	focusTick: number;
	isFilterComponent: boolean;
	dataType?: DataType;
}

const FilterRightHandSide: FC<IFilterProps> = ({
	dataType,
	label,
	onChange,
	expressionCondition,
}: IFilterProps) => {
	const [focusTick, setFocusTick] = useState(-1);
	const dataTypeComponentFactory = useDataTypeComponentFactory();

	useUpdateEffect(() => {
		// Only run after the first load
		if (expressionCondition.columnName) {
			setFocusTick(tick => ++tick);
		}
	}, [expressionCondition.columnName]);

	const {comparisonOperator} = expressionCondition;

	const isComparisonOperatorBetweenOrNotBetween =
		comparisonOperator === ComparisonOperator.Between ||
		comparisonOperator === ComparisonOperator.NotBetween;

	const onChangeRunner = (
		func: (
			conditionMode: ConditionMode,
			expressionCondition: ExpressionCondition,
			value: string
		) => void,
		value: string
	) => {
		const copy = {...expressionCondition};
		func(ConditionMode.ValueBased, copy, value);
		onChange(copy);
	};

	const baseFieldProperty: IBaseFieldProperty = {
		label,
		focusTick,
		isFilterComponent: true,
		dataType
	};

	let fieldProperty: IFieldProperty = {
		...baseFieldProperty,
		name: 'right',
		onChange: onChangeRunner.bind(
			null,
			ExpressionCondition.setRightExpression
		),
		value: ExpressionCondition.getRightExpression(
			ConditionMode.ValueBased,
			expressionCondition
		),
	};

	let fieldPropertyStart: IFieldProperty = {
		...baseFieldProperty,
		name: 'start',
		onChange: onChangeRunner.bind(
			null,
			ExpressionCondition.setStartExpression
		),
		value: ExpressionCondition.getStartExpression(
			ConditionMode.ValueBased,
			expressionCondition
		),
	};

	let fieldPropertyStop: IFieldProperty = {
		...baseFieldProperty,
		name: 'stop',
		onChange: onChangeRunner.bind(
			null,
			ExpressionCondition.setStopExpression
		),
		value: ExpressionCondition.getStopExpression(
			ConditionMode.ValueBased,
			expressionCondition
		),
	};

	useEffect(() => {
		// Toggle between 'between' and 'not between', moving the values around
		if (isComparisonOperatorBetweenOrNotBetween) {
			if (
				isNil(
					ExpressionCondition.getStartExpression(
						ConditionMode.ValueBased,
						expressionCondition
					)
				)
			) {
				const currentRightExpression =
					ExpressionCondition.getRightExpression(
						ConditionMode.ValueBased,
						expressionCondition
					);
				// If we have a right expression, put that into the start expression
				if (!isNil(currentRightExpression)) {
					ExpressionCondition.setStartExpression(
						ConditionMode.ValueBased,
						expressionCondition,
						currentRightExpression
					);
					ExpressionCondition.setRightExpression(
						ConditionMode.ValueBased,
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
						ConditionMode.ValueBased,
						expressionCondition
					)
				)
			) {
				const currentStartExpression =
					ExpressionCondition.getStartExpression(
						ConditionMode.ValueBased,
						expressionCondition
					);
				// If we have a start expression, put that into the right expression
				if (!isNil(currentStartExpression)) {
					ExpressionCondition.setRightExpression(
						ConditionMode.ValueBased,
						expressionCondition,
						currentStartExpression
					);
					ExpressionCondition.setStartExpression(
						ConditionMode.ValueBased,
						expressionCondition,
						undefined
					);
					ExpressionCondition.setStopExpression(
						ConditionMode.ValueBased,
						expressionCondition,
						undefined
					);
					onChange(expressionCondition);
				}
			}
		}
	}, [isComparisonOperatorBetweenOrNotBetween]);

	const renderComponent = (dataType: DataType | undefined) => {
		if (!dataType) return null;
		
		return !isComparisonOperatorBetweenOrNotBetween ? (
			<>
				{dataTypeComponentFactory.getByDataType(
					dataType,
					fieldProperty as IFieldProperty
				)}
			</>
		) : (
			<>
				{dataTypeComponentFactory.getByDataType(
					dataType,
					fieldPropertyStart as IFieldProperty
				)}
				{dataTypeComponentFactory.getByDataType(
					dataType,
					fieldPropertyStop as IFieldProperty
				)}
			</>
		);
	};

	return renderComponent(dataType);
};

export default FilterRightHandSide;

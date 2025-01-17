import { v4 as uuidv4 } from 'uuid';
import Condition from './Condition';
import ConditionType from './ConditionType';
import ComparisonOperator from './ComparisonOperator';
import { ConditionMode } from '../Filter/ConditionMode';
import isNil from '../../utils/isNil';

export default class ExpressionCondition implements Condition {
	id: string = uuidv4().toLowerCase();
	type: ConditionType = ConditionType.Expression;
	comparisonOperator?: ComparisonOperator = undefined;
	children = [];
	valid = false;
	active = true;
	propertyName?: string = undefined;
	values: string[] = [];
	leftExpression?: string;
	rightExpression?: string;
	startExpression?: string;
	stopExpression?: string;

	static getRightExpression(
		conditionMode: ConditionMode,
		condition: ExpressionCondition
	): string {
		if (conditionMode === ConditionMode.ExpressionBased) {
			return condition.rightExpression || '';
		}

		return condition.values[0] || '';
	}

	static getStartExpression(
		conditionMode: ConditionMode,
		condition: ExpressionCondition
	): string {
		if (conditionMode === ConditionMode.ExpressionBased) {
			return condition.startExpression || '';
		}

		return condition.values[0] || '';
	}

	static getStopExpression(
		conditionMode: ConditionMode,
		condition: ExpressionCondition
	): string {
		if (conditionMode === ConditionMode.ExpressionBased) {
			return condition.stopExpression || '';
		}

		return condition.values[1] || '';
	}

	static setRightExpression(
		conditionMode: ConditionMode,
		condition: ExpressionCondition,
		value: string | undefined
	): void {
		if (conditionMode === ConditionMode.ValueBased) {
			condition.values = isNil(value) ? [] : [value];
		} else {
			condition.rightExpression = value;
		}
	}

	static setStartExpression(
		conditionMode: ConditionMode,
		condition: ExpressionCondition,
		value: string | undefined
	): void {
		if (conditionMode === ConditionMode.ValueBased) {
			condition.values = isNil(value)
				? []
				: [
						value,
						ExpressionCondition.getStopExpression(
							conditionMode,
							condition
						),
				  ];
		} else {
			condition.startExpression = value;
		}
	}

	static setStopExpression(
		conditionMode: ConditionMode,
		condition: ExpressionCondition,
		value: string | undefined
	): void {
		if (conditionMode === ConditionMode.ValueBased) {
			condition.values = [
				ExpressionCondition.getStartExpression(
					conditionMode,
					condition
				),
				isNil(value) ? '' : value,
			];
		} else {
			condition.stopExpression = value;
		}
	}
}

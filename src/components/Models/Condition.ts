import { generateUUID } from '../../utils/uuid';
import { LogicalOperator } from './LogicalOperator';
import ConditionType from './ConditionType';
import ComparisonOperator from './ComparisonOperator';

export default interface Condition {
	id: string;
	type: ConditionType;
	operator?: LogicalOperator;
	comparisonOperator?: ComparisonOperator;
	active: boolean;
	valid: boolean;
	children: Condition[];
	columnName?: string;
	leftExpression?: string;
	rightExpression?: string;
	startExpression?: string;
	stopExpression?: string;
	values: string[];
}

export const newCondition = (
	propertyName: string,
	value: string | string[] | null,
	comparisonOperator: ComparisonOperator = ComparisonOperator.In
): Condition => ({
	id: generateUUID(),
	type: ConditionType.Expression,
	operator: LogicalOperator.AND,
	active: true,
	valid: true,
	children: [],
	columnName: propertyName,
	comparisonOperator: comparisonOperator,
	values: !value || !value.length ? [] : Array.isArray(value) ?  value : [value],
});

export const deleteConditionProperties = (arr: any[]) => {
	arr.forEach((obj) => {
		delete obj.id;
		delete obj.valid;

		if (obj.type === ConditionType.Expression) {
			delete obj.type;
		}

		if (obj.children && obj.children.length === 0) {
			delete obj.children;
		} else if (obj.children) {
			deleteConditionProperties(obj.children);
		}

		if (obj.values && obj.values.length === 0) {
			delete obj.values;
		}

		if (obj.active) {
			delete obj.active;
		}
	});
};

export const regenerateConditionIds = (condition: Condition | Condition[]): void => {
	const updateIds = (item: Condition) => {
		item.id = generateUUID();
		if (item.children && item.children.length > 0) {
			item.children.forEach(updateIds);
		}
	};

	if (Array.isArray(condition)) {
		condition.forEach(updateIds);
	} else {
		updateIds(condition);
	}
};

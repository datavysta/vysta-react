import { generateUUID } from '../../utils/uuid';
import Condition from './Condition';
import ConditionType from './ConditionType';
import LogicalOperator from "./LogicalOperator";

export default class GroupCondition implements Condition {
	id: string = generateUUID();
	type: ConditionType = ConditionType.Group;
	operator?: LogicalOperator = LogicalOperator.AND;
	children: Condition[] = [];
	valid = true;
	active = true;
	values = [];
}

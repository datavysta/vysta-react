import { v4 as uuidv4 } from 'uuid';
import Condition from './Condition';
import ConditionType from './ConditionType';
import LogicalOperator from "./LogicalOperator";

export default class GroupCondition implements Condition {
	id: string = uuidv4().toLowerCase();
	type: ConditionType = ConditionType.Group;
	operator?: LogicalOperator = LogicalOperator.AND;
	children: Condition[] = [];
	valid = true;
	active = true;
	values = [];
}

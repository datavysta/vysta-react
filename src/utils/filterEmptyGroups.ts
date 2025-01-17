import ConditionType from '../components/Models/ConditionType';
import Condition from "../components/Models/Condition";

export default function filterEmptyGroups(
	conditions: Condition[]
): Condition[] {
	return conditions.reduce((acc: Condition[], condition: Condition) => {
		if (
			condition.type === ConditionType.Group &&
			condition.children.length === 0
		) {
			// Skip this condition as it's a BqlGroupCondition with no children
			return acc;
		}

		acc.push({
			...condition,
			children: filterEmptyGroups(condition.children),
		});

		return acc;
	}, []);
}

import Condition from '../components/Models/Condition';

export default function updateNestedCondition(
	conditions: Condition[],
	newCondition: Condition
): Condition[] {
	return conditions.map((condition: Condition) => {
		if (condition.id === newCondition.id) {
			return newCondition;
		} else {
			return {
				...condition,
				children: updateNestedCondition(
					condition.children,
					newCondition
				),
			};
		}
	});
}

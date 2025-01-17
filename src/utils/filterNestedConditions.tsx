import Condition from '../components/Models/Condition';

export default function filterNestedConditions(
	conditions: Condition[],
	id: string
): Condition[] {
	return conditions.reduce((acc: Condition[], condition: Condition) => {
		if (condition.id !== id) {
			acc.push({
				...condition,
				children: filterNestedConditions(condition.children, id),
			});
		}
		return acc;
	}, []);
}

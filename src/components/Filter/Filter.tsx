import { FC } from 'react';
import FilterConditionRow from './components/FilterConditionRow';
import { FaPlus } from 'react-icons/fa';
import { useTranslationContext } from './TranslationContext';
import FilterGroup from './components/FilterGroup';
import Condition from '../Models/Condition';
import GroupCondition from '../Models/GroupCondition';
import ConditionType from '../Models/ConditionType';
import ExpressionCondition from '../Models/ExpressionCondition';
import { ConditionMode } from './ConditionMode';
import { FilterDefinitionsByField } from "./FilterDefinitionsByField";
import './Filter.css';

interface IFilterProps {
	conditions: Condition[];
	filterDefinitions: FilterDefinitionsByField;
	onChange: (condition: Condition) => void;
	onAddCondition: (condition: Condition, parent?: GroupCondition) => void;
	onDelete: (condition: Condition) => void;
	showAddConditionButton: boolean;
	showWhereLabel: boolean;
	conditionMode: ConditionMode;
	firstRowRequired?: boolean;
}

const Filter: FC<IFilterProps> = ({
	conditions,
	onAddCondition,
	onChange,
	onDelete,
	showAddConditionButton,
	showWhereLabel,
	conditionMode,
	firstRowRequired,
	filterDefinitions
}: IFilterProps) => {
	const { t } = useTranslationContext();

	const isExpression = (conditionType: ConditionType) =>
		conditionType === ConditionType.Expression;

	const createNewCondition = (parent?: GroupCondition) => {
		if (parent) {
			onAddCondition(new ExpressionCondition(), parent);
			return;
		}

		const newGroup = new GroupCondition();
		newGroup.children.push(new ExpressionCondition());
		onAddCondition(newGroup);
	};

	const renderChildren = (
		children: Condition[],
		firstConditionGroup: boolean = true
	) => {
		return children?.map((condition, index) => (
			<div key={condition.id} className="filter-row">
				{isExpression(condition.type) ? (
					<FilterConditionRow
						filterDefinitions={filterDefinitions}
						condition={condition}
						onDelete={() => onDelete(condition)}
						key={condition.id}
						index={index}
						onChange={onChange}
						firstConditionRendered={
							firstConditionGroup && index === 0
						}
						onlyConditionInGroup={children.length === 1}
						conditionMode={conditionMode}
						showWhereLabel={showWhereLabel}
						firstRowRequired={firstRowRequired}
					/>
				) : (
					<FilterGroup
						key={condition.id}
						condition={condition}
						index={index}
						onAddCondition={() =>
							createNewCondition(condition as GroupCondition)
						}
						onChange={onChange}
						children={renderChildren(
							(condition as GroupCondition).children,
							firstConditionGroup && index === 0
						)}
						showNestedConditionButton={true}
					/>
				)}
			</div>
		));
	};

	return (
		<div className="filter-container">
			{renderChildren(conditions)}
			{showAddConditionButton && (
				<div className="filter-footer">
					<button
						className="filter-button"
						onClick={() => createNewCondition()}
					>
						<FaPlus />
						{t('Add Condition')}
					</button>
				</div>
			)}
		</div>
	);
};

export default Filter;

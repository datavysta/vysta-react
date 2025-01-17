import { FC } from 'react';
import { Button, Flex, Group } from '@mantine/core';
import FilterConditionRow from './components/FilterConditionRow';
import { FaPlus } from 'react-icons/fa';
import { useTranslationContext } from './TranslationContext';
import FilterGroup from './components/FilterGroup';
import Condition from '../Models/Condition';
import GroupCondition from '../Models/GroupCondition';
import ConditionType from '../Models/ConditionType';
import ExpressionCondition from '../Models/ExpressionCondition';
import { ConditionMode } from './ConditionMode';
import { filterButtonStyle } from './FilterPanel';
import {FilterDefinitionsByField} from "./FilterDefinitionsByField";

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

	// const shouldShowNestedConditionBttn = (condition: Condition) =>
	// 	condition.children[condition.children.length - 1].values.length > 0 &&
	// 	condition.children[condition.children.length - 1].values[0] !== '';

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
			<Flex key={condition.id} w={'100%'} direction={'column'} gap={8}>
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
			</Flex>
		));
	};

	return (
		<Flex direction={'column'} w={'100%'} gap={8}>
			{renderChildren(conditions)}
			{showAddConditionButton && (
				<Group pt={10} style={{ gap: 10 }}>
					<Button
						style={filterButtonStyle}
						variant={conditions.length ? 'outline' : 'filled'}
						leftSection={<FaPlus />}
						onClick={() => createNewCondition()}
					>
						{t('Add Condition')}
					</Button>
				</Group>
			)}
		</Flex>
	);
};

export default Filter;

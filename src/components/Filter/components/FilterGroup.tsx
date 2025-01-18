import {FC, ReactNode} from 'react';
import {useTranslationContext} from '../TranslationContext';
import FilterOperator from './FilterOperator';
import Condition from '../../Models/Condition';
import './FilterGroup.css';

interface IFilterProps {
	condition: Condition;
	index: number;
	onAddCondition: () => void;
	onChange: (condition: Condition) => void;
	children: ReactNode;
	showNestedConditionButton: boolean;
}

const FilterGroup: FC<IFilterProps> = ({
	condition,
	onAddCondition,
	children,
	index,
	onChange,
	showNestedConditionButton,
}: IFilterProps) => {
	const { t } = useTranslationContext();

	return (
		<>
			{index !== 0 && (
				<div className="filter-operator-wrapper">
					<FilterOperator
						isOutsideAGroup={true}
						initialValue={condition.operator}
						onChange={(value) =>
							onChange({ ...condition, operator: value })
						}
					/>
				</div>
			)}
			<div
				key={condition.id}
				className="filter-group"
			>
				{children}
				{showNestedConditionButton && (
					<div className="filter-group-footer">
						<button
							className="add-filter-button"
							onClick={onAddCondition}
						>
							+
							{t('Add Filter')}
						</button>
					</div>
				)}
			</div>
		</>
	);
};

export default FilterGroup;

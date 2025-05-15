import { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslationContext } from './TranslationContext';
import Condition from '../Models/Condition';
import ExpressionCondition from '../Models/ExpressionCondition';
import GroupCondition from '../Models/GroupCondition';
import Filter from './Filter';
import filterNestedConditions from '../../utils/filterNestedConditions';
import filterEmptyGroups from '../../utils/filterEmptyGroups';
import updateNestedCondition from '../../utils/updateNestedCondition';
import { ConditionMode } from './ConditionMode';
import SaveFilterButton from './components/SaveFilterButton';
import { FilterDefinitionsByField } from "./FilterDefinitionsByField";
import DataType from "../Models/DataType";
import { ColDef } from "ag-grid-community";
import ConditionType from '../Models/ConditionType';
import CloseButton from '../CloseButton';
import './FilterPanel.css';

interface SavedFilter {
	name: string;
	conditions: Condition[];
}

interface IFilterProps {
	conditions: Condition[];
	// @deprecated Use `filterDefinitions` instead.
	colDef?: ColDef[];
	filterDefinitions?: FilterDefinitionsByField;
	asideTitle?: string;
	onApply?(conditions: Condition[]): void;
	onChange?(conditions: Condition[]): void;
	onClose?: () => void;
}

const FilterPanel: FC<IFilterProps> = ({
	conditions,
	colDef,
	asideTitle,
	onApply,
	onChange,
	filterDefinitions,
	onClose,
}: IFilterProps) => {
	const { t } = useTranslationContext();

	const validateConditions = useCallback(async (conditions: Condition[]): Promise<Condition[]> => {
		if (!filterDefinitions) {
			return conditions;
		}

		return await Promise.all(conditions.map(async condition => {
			if (condition.type === ConditionType.Group) {
				const groupCondition = condition as GroupCondition;
				groupCondition.children = await validateConditions(groupCondition.children);
				return groupCondition;
			}

			const definition = filterDefinitions.find(def => def.targetFieldName === condition.columnName);
			if (definition?.loader) {
				const selectColumns = definition.loaderColumns || ["id", "name"];
				try {
					const options = await definition.loader({ limit: 5000, select: selectColumns });
					const validValues = options.data.map((option: Record<string, unknown>) => {
						const key = selectColumns[0] as keyof typeof option;
						return option[key];
					});
					condition.values = condition.values.filter(value => validValues.includes(value));
				} catch (error) {
					console.error('Error loading options for validation:', error);
				}
			}
			return condition;
		}));
	}, [filterDefinitions]);

	const handleOnChange = useCallback(async (conditions: Condition[]) => {
		if (filterDefinitions) {
			const validatedConditions = await validateConditions(conditions);
			onChange?.(validatedConditions);
		} else {
			onChange?.(conditions);
		}
	}, [filterDefinitions, onChange, validateConditions]);

	const filterDefinitionParameter: FilterDefinitionsByField = useMemo(() => {
		if (filterDefinitions) {
			return filterDefinitions;
		}

		return (colDef || [])
			.filter((column) => column.field)
			.filter((column) => !column.hide)
			.sort((a, b) => (a.headerName || "").localeCompare(b.headerName || ""))
			.map((column) => ({
				targetFieldName: column.field || "",
				label: column.headerName || "",
				dataType: (column as { dataType?: DataType }).dataType
			}));
	}, [filterDefinitions, colDef]);

	const getPreparedGroup = useCallback(() => {
		const group = new GroupCondition();
		group.children.push(new ExpressionCondition());
		return group;
	}, []);

	const handleConditionChange = useCallback(async (condition: Condition) => {
		setCurrentConditions((prevConditions) => {
			const newConditions = updateNestedCondition(
				prevConditions,
				condition
			);
			handleOnChange(newConditions);
			return newConditions;
		});
	}, [handleOnChange]);

	const [currentConditions, setCurrentConditions] = useState<Condition[]>(() => {
		if (conditions.length > 0 && conditions[0].children[0]?.columnName) {
			return conditions;
		}
		return [getPreparedGroup()];
	});

	const isFirstConditionOnly =
		currentConditions?.length === 1 &&
		currentConditions[0].children?.length === 1;

	const handleAddCondition = useCallback((
		condition: Condition,
		parent?: GroupCondition
	) => {
		setCurrentConditions((prevConditions) => {
			if (parent) {
				return prevConditions.map((cond) => {
					if (cond.id === parent.id) {
						return {
							...cond,
							children: [...(cond.children || []), condition]
						};
					}
					return cond;
				});
			}
			return [...prevConditions, condition];
		});
	}, []);

	const handleDeleteCondition = useCallback((condition: Condition) => {
		setCurrentConditions((previousConditions) => {
			let newConditions = filterNestedConditions(
				previousConditions,
				condition.id
			);
			newConditions = filterEmptyGroups(newConditions);
			handleOnChange(newConditions);
			return newConditions;
		});
	}, [handleOnChange]);

	const isSomeConditionInvalid = useCallback(() =>
		currentConditions?.some(
			(group) => group.children?.some((expr) => !expr.valid)
		), [currentConditions]);

	const isFirstConditionValid = useCallback(() => {
		const firstCondition = currentConditions[0]
			?.children[0] as ExpressionCondition;
		return (
			firstCondition.columnName &&
			firstCondition.comparisonOperator &&
			firstCondition.values !== null
		);
	}, [currentConditions]);

	const getIsApplyDisabled = useMemo(() => {
		return isFirstConditionOnly
			? !isFirstConditionValid()
			: isSomeConditionInvalid();
	}, [isFirstConditionOnly, isFirstConditionValid, isSomeConditionInvalid]);

	const handleApply = useCallback(async () => {
		const validatedConditions = await validateConditions(currentConditions);
		onApply?.(validatedConditions);
	}, [currentConditions, validateConditions, onApply]);

	const handleClear = useCallback(() => {
		setCurrentConditions([getPreparedGroup()]);
		onApply?.([]);
	}, [getPreparedGroup, onApply]);

	const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

	useEffect(() => {
		const filters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
		setSavedFilters(filters);
	}, []);

	const handleFilterSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedFilter = savedFilters.find(f => f.name === event.target.value);
		if (selectedFilter) {
			setCurrentConditions(selectedFilter.conditions);
			onApply?.(selectedFilter.conditions);
		}
	};

	return (
		<div className="filter-panel">
			{asideTitle ? (
				<div className="filter-header with-border">
					<span className="filter-title">{asideTitle}</span>
					<button
						className="filter-button"
						onClick={() => handleAddCondition(new ExpressionCondition(), currentConditions[0] as GroupCondition)}
					>
						+
						{t('Add Filter Group')}
					</button>
				</div>
			) : (
				<div className="filter-header">
					<span className="filter-title">Filters</span>
					<div className="filter-actions">
						{!asideTitle && <SaveFilterButton conditions={currentConditions} />}
						<div className="select-wrapper">
							<select 
								className="filter-select"
								onChange={handleFilterSelect}
								value=""
							>
								<option value="">{t('Saved Filters')}</option>
								{savedFilters.map(filter => (
									<option key={filter.name} value={filter.name}>
										{filter.name}
									</option>
								))}
							</select>
						</div>
						{onClose && <CloseButton onClickAction={onClose} />}
					</div>
				</div>
			)}

			<div className="filter-content">
				<Filter
					conditions={currentConditions}
					filterDefinitions={filterDefinitionParameter}
					onChange={handleConditionChange}
					onAddCondition={handleAddCondition}
					onDelete={handleDeleteCondition}
					conditionMode={ConditionMode.ValueBased}
					showAddConditionButton={false}
					showWhereLabel={true}
					firstRowRequired={false}
				/>
			</div>

			<div className="filter-footer">
				<div className="filter-actions">
					<button
						className="add-group"
						onClick={() => handleAddCondition(getPreparedGroup())}
					>
						+ {t('Add Filter Group')}
					</button>
					<div className="filter-actions-right">
						<button
							className="clear-button"
							onClick={handleClear}
						>
							{t('Clear All Filters')}
						</button>
						<button
							className="apply"
							onClick={handleApply}
							disabled={getIsApplyDisabled}
						>
							{t('Apply')}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FilterPanel;

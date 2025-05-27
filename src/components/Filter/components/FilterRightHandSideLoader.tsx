import { FC } from 'react';
import ExpressionCondition from "../../Models/ExpressionCondition";
import { FilterDefinitionWrapper } from "../FilterDefinitionsByField";
import { useTranslationContext } from '../TranslationContext';
import { LazyLoadList } from '../../LazyLoadList/LazyLoadList';
import ComparisonOperator from '../../Models/ComparisonOperator';

interface Props {
	filterDefinition: FilterDefinitionWrapper;
	expressionCondition: ExpressionCondition;
	onChange: (expressionCondition: ExpressionCondition) => void;
}

const FilterRightHandSideLoader: FC<Props> = ({ filterDefinition, expressionCondition, onChange }) => {
	const { t } = useTranslationContext();
	const repository = filterDefinition.repository;
	const loaderColumns = filterDefinition.loaderColumns || ["id", "name"];
	const labelField = loaderColumns[1] || loaderColumns[0];

	// Determine if multi-select is needed
	const isMulti =
		expressionCondition.comparisonOperator === ComparisonOperator.In ||
		expressionCondition.comparisonOperator === ComparisonOperator.NotIn;

	// Current value(s)
	const currentValue: string[] = isMulti
		? (Array.isArray(expressionCondition.values) ? expressionCondition.values.filter((v): v is string => typeof v === 'string') : [])
		: [expressionCondition.values[0]].filter((v): v is string => typeof v === 'string' && !!v);

	// Handler for value change
	const handleChange = (val: string | string[] | null) => {
		let newValues: string[];
		if (isMulti) {
			if (Array.isArray(val)) {
				newValues = val.filter((v): v is string => typeof v === 'string');
			} else if (typeof val === 'string') {
				newValues = [val];
			} else {
				newValues = [];
			}
		} else {
			newValues = val && typeof val === 'string' ? [val] : [];
		}
		const updated = { ...expressionCondition, values: newValues };
		onChange(updated);
	};

	if (!repository) {
		return <div>{t('No repository available for this filter.')}</div>;
	}

	// LazyLoadList only supports single select out of the box, so for multi-select, you may need to extend it or use a workaround.
	// For now, implement single-select and show a warning for multi-select.
	if (isMulti) {
		return (
			<div className="vysta-select-wrapper">
				<div style={{ color: 'red', marginBottom: 8 }}>{t('Multi-select is not yet implemented for this filter.')}</div>
				<LazyLoadList
					repository={repository}
					value={currentValue.length > 0 ? currentValue[0] : null}
					onChange={handleChange}
					displayColumn={labelField as keyof Record<string, unknown>}
					label={filterDefinition.label || t('Select value')}
				/>
			</div>
		);
	}

	return (
		<div className="vysta-select-wrapper">
			<LazyLoadList
				repository={repository}
				value={currentValue.length > 0 ? currentValue[0] : null}
				onChange={handleChange}
				displayColumn={labelField as keyof Record<string, unknown>}
				label={filterDefinition.label || t('Select value')}
			/>
		</div>
	);
};

export default FilterRightHandSideLoader;

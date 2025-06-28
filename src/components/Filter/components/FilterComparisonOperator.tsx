import {FC, useEffect, useState} from 'react';
import {useTranslationContext} from '../TranslationContext';
import DataType from '../../Models/DataType';
import ComparisonOperator from '../../Models/ComparisonOperator';
import Service from '../services/bql-service';
import './FilterComparisonOperator.css';

interface IFilterComparisonOperatorProps {
	value: ComparisonOperator;
	dataType?: DataType;
	label?: string;
	onChange: (value: ComparisonOperator) => void;
}

const service = new Service();

const FilterComparisonOperator: FC<IFilterComparisonOperatorProps> = ({
	dataType,
	value,
	label,
	onChange,
}: IFilterComparisonOperatorProps) => {
	const { t } = useTranslationContext();
	const [operators, setOperators] = useState<Array<{
		value: ComparisonOperator;
		label: string;
		key: string;
	}>>([]);

	useEffect(() => {
		const operators = getAllOperators();
		if (dataType) {
			setDataTypeOperators(operators, dataType);
		} else {
			setOperators(operators);
		}
	}, [dataType]);

	const getAllOperators = () =>
		Object.values(ComparisonOperator)
			.map((key: string) => ({
				value: key as ComparisonOperator,
				label: t(key),
				key: key,
			}));

	const setDataTypeOperators = (
		operators: Array<{value: ComparisonOperator; label: string; key: string}>,
		dataType: DataType
	) => {
		const supported = service.getComparisonOperatorsByDataType(dataType);
		const filteredOperators = operators
			? operators.filter((e) => supported.find((sup) => sup === e.value))
			: [];
		setOperators(filteredOperators);
	};

	return (
		<div className="filter-comparison-operator-wrapper">
			{label && <label className="filter-comparison-operator-label">{label}</label>}
			<select
				className="filter-comparison-operator-select"
				value={value}
				onChange={(e) => onChange(e.target.value as ComparisonOperator)}
			>
				{operators.map(option => (
					<option key={option.key} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default FilterComparisonOperator;

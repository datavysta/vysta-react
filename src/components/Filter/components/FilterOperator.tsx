import { FC, useState } from 'react';
import { useTranslationContext } from '../TranslationContext';
import LogicalOperator from '../../Models/LogicalOperator';
import './FilterOperator.css';

interface IFilterProps {
	initialValue?: LogicalOperator;
	isOutsideAGroup?: boolean;
	onChange: (value: LogicalOperator) => void;
}

const FilterOperator: FC<IFilterProps> = ({
	initialValue,
	isOutsideAGroup,
	onChange,
}: IFilterProps) => {
	const { t } = useTranslationContext();
	const [value, setValue] = useState<LogicalOperator>(
		initialValue ? initialValue : LogicalOperator.AND
	);

	const data = [
		{ label: t('AND'), value: LogicalOperator.AND },
		{ label: t('OR'), value: LogicalOperator.OR },
	];

	const handleChange = (value: LogicalOperator) => {
		setValue(value);
		onChange(value);
	};

	return (
		<select
			className={`filter-operator ${isOutsideAGroup ? 'small' : 'medium'}`}
			value={value}
			onChange={(e) => handleChange(e.target.value as LogicalOperator)}
		>
			{data.map(option => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
};

export default FilterOperator;

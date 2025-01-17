import {FC, useState} from 'react';
import {useTranslation} from 'react-i18next';
import LogicalOperator from '../../Models/LogicalOperator';
import {Select} from '@mantine/core';

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
	const {t} = useTranslation();
	const [value, setValue] = useState<LogicalOperator>(
		initialValue ? initialValue : LogicalOperator.AND
	);

	const data = [
		{label: t('AND'), value: LogicalOperator.AND},
		{label: t('OR'), value: LogicalOperator.OR},
	];

	const handleChange = (value: LogicalOperator) => {
		setValue(value);
		onChange(value);
	};

	return (
		<Select
			data={data}
			value={value}
			onChange={(value) => handleChange(value as LogicalOperator)}
			size={isOutsideAGroup ? 'xs' : 'sm'}
			style={{
				borderRadius: 6,
			}}
		/>
	);
};

export default FilterOperator;

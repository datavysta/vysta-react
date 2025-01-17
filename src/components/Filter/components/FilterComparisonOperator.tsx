import {FC, useEffect, useState} from 'react';
import {Select, ComboboxItem, Image} from '@mantine/core';
import {useTranslationContext} from '../TranslationContext';
import DataType from '../../Models/DataType';
import ComparisonOperator from '../../Models/ComparisonOperator';
import Service from '../services/bql-service';
import SelectArrow from "../../../assets/svg/selectArrow.svg";

interface IFilterComparisonOperatorProps {
	value: ComparisonOperator;
	dataType?: DataType;
	label?: string;
	onChange: (value: any) => void;
}

const service = new Service(); // Instantiate the Service

const FilterComparisonOperator: FC<IFilterComparisonOperatorProps> = ({
	                                                                      dataType,
	                                                                      value,
	                                                                      label,
	                                                                      onChange,
                                                                      }: IFilterComparisonOperatorProps) => {
	const { t } = useTranslationContext();
	const [operators, setOperators] = useState<ComboboxItem[]>([]);

	useEffect(() => {
		const operators = getAllOperators();
		dataType
			? setDataTypeOperators(operators, dataType)
			: setOperators(operators);
	}, [dataType]);

	const getAllOperators = () =>
		Object.values(ComparisonOperator).filter(_ => _ != ComparisonOperator.Equal && _ != ComparisonOperator.NotEqual).map((key: string) => {
			return {
				value: key as ComparisonOperator,
				label: t(key),
				key: key,
			};
		});

	const setDataTypeOperators = (
		operators: ComboboxItem[],
		dataType: DataType
	) => {
		const supported = service.getComparisonOperatorsByDataType(dataType);
		const filteredOperators = operators
			? operators.filter((e) => supported.find((sup) => sup === e.value))
			: [];
		setOperators(filteredOperators);
	};

	return (
		<Select
			data={operators}
			onChange={onChange}
			value={value}
			label={label}
			rightSection={
				<Image
					src={SelectArrow}
					width={18}
					height={18}
					style={{pointerEvents: 'none'}}
				/>
			}
		/>
	);
};

export default FilterComparisonOperator;

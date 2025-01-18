import { FC, useEffect, useState, useRef } from 'react';
import ExpressionCondition from '../../Models/ExpressionCondition';
import { useTranslationContext } from '../TranslationContext';
import { FilterDefinitionWrapper } from '../FilterDefinitionsByField';
import { ConditionMode } from '../ConditionMode';
import useUpdateEffect from '../../../hooks/useUpdateEffect';
import ComparisonOperator from '../../Models/ComparisonOperator';
import MultiSelectCustom from './MultiSelectCustom';
import { FilterAutocompleteOption } from './FilterAutocomplete';
import { newCondition } from '../../Models/Condition';
import useFocus from "../../../hooks/useFocus";
import OrderByDirection from "../../Models/OrderByDirection";
import './FilterRightHandSideLoader.css';

interface IFilterProps {
	filterDefinition: FilterDefinitionWrapper;
	expressionCondition: ExpressionCondition;
	onChange: (expressionCondition: ExpressionCondition) => void;
}

interface ComboboxItem {
	value: string;
	label: string;
	group?: string;
	description?: string;
}

const FilterRightHandSideLoader: FC<IFilterProps> = ({
	filterDefinition,
	onChange,
	expressionCondition,
}: IFilterProps) => {
	const [focusTick, setFocusTick] = useState(-1);
	const inputRef = useFocus<HTMLSelectElement>(focusTick);
	const { t } = useTranslationContext();
	const [options, setOptions] = useState<ComboboxItem[]>([]);
	const [tempData, setTempData] = useState<ComboboxItem[]>([]);
	const [searchOptions, setSearchOptions] = useState<ComboboxItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [offset, setOffset] = useState(0);
	const [moreDataExists, setMoreDataExists] = useState<boolean>(true);
	const limit = 20; // Number of items to fetch per request
	const isMultipleSelector =
		expressionCondition.comparisonOperator === ComparisonOperator.In ||
		expressionCondition.comparisonOperator === ComparisonOperator.NotIn;

	useUpdateEffect(() => {
		// Only run after the first load
		if (expressionCondition.propertyName) {
			setFocusTick((tick) => ++tick);
		}
	}, [expressionCondition.propertyName]);

	useEffect(() => {
		// Initial load
		setOptions([]);
		setOffset(0);
	}, [filterDefinition]);

	useEffect(() => {
		// Initial load
		loadOptions(false);
	}, [filterDefinition]);

	useEffect(()=>{
      setMoreDataExists(true)
	},[expressionCondition])

	const loadOptions = async (incremental: boolean) => {
		if (filterDefinition.staticData && incremental) {
			return;
		}

		if (loading) return; // Prevent multiple simultaneous loads
		setLoading(true);

		if (!filterDefinition.loader) {
			throw new Error('Filter definition loader is not defined');
		}

		const useOffset = incremental ? offset : 0;
		const selectColumns = filterDefinition.loaderColumns || ["id", "name"];

		if (moreDataExists) {
			let result: any = await getResult(incremental, selectColumns);

			let valuesToAttach: string[] = [];
			let valuesToFilterOut: string[] = [];
			let adjustedOptions: any = options;

			expressionCondition.values.forEach((value) => {
				if (
					result.data.find((e:any) => e.id === value) &&
					tempData.find((e) => e.value === value)
				) {
					valuesToFilterOut.push(value)
				} else if (
					!result.data.find((e: any) => e.id === value) &&
					!options.find((e) => e.value === value)
				) {
					valuesToAttach.push(value);
				}
			});

			if(valuesToFilterOut.length) {
				setTempData(prev=>prev.filter(e=> !valuesToFilterOut.includes(e.value)))
			}

			if (valuesToAttach.length) {
				handleAttachTempData(valuesToAttach);
			}

			setOptions([
				...(incremental ? adjustedOptions : []),
				...mapValues(result.data)
			]);

			setOffset(useOffset + limit);
			setMoreDataExists(result.data.length > 0);
		}

		setLoading(false);
	};

	const mapValues = (data: any) => {
		const selectColumns = filterDefinition.loaderColumns || ["id", "name"];

		return data.map((item: any) => ({
			value: item[selectColumns[0]] as string,
			label: item[selectColumns[1]] as string,
			group: selectColumns.length > 2 && selectColumns[2] ? item[selectColumns[2]] as string : undefined,
			description: selectColumns.length > 3 ? item[selectColumns[3]] as string : undefined,
		}))
	}

	const handleAttachTempData = async (values: string[]) => {
		if (!filterDefinition.loader) {
			throw new Error('Filter definition loader is not defined');
		}

		const dataToAttach = await filterDefinition.loader({
			filters: [newCondition('id', values)],
		});

		const filteredData = dataToAttach.data.filter((e: any) => e.description || e.userName || e.code);

		setTempData([...mapValues(filteredData)]);
	};

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;

		const tolerance = 1; // You can adjust this tolerance value as needed
		const bottom =
			Math.abs(
				target.scrollHeight - (target.scrollTop + target.clientHeight)
			) <= tolerance;

		if (bottom) {
			loadOptions(true);
		}
	};

	const handleMultiOnChange = (values: string[]) => {
		const copy = { ...expressionCondition };
		copy.values = values;
		onChange(copy);
	};

	const handleSearchChange = async (keyword: string) => {
		if (!filterDefinition.loader) {
			throw new Error('Filter definition loader is not defined');
		}

		const selectColumns = filterDefinition.loaderColumns || ["id", "name"];

		let result: any = await getResult(false, selectColumns, keyword);

		setSearchOptions([...mapValues(result.data)]);
	};

	const handleOnChange = (value: string | null) => {
		if (!value) {
			throw new Error('Value is null');
		}

		const copy = { ...expressionCondition };
		ExpressionCondition.setRightExpression(
			ConditionMode.ValueBased,
			copy,
			value
		);
		onChange(copy);
	};

	const getResult = async (incremental: boolean, selectColumns:string[], keyword?: string) => {
		const useOffset = incremental ? offset : 0;

		if (!filterDefinition.loader) {
			throw new Error('Filter definition loader is not defined');
		}

		const apiSelectColumns = selectColumns.filter(Boolean);

		// Check if there's a valid group column (not empty string)
		const hasGroupBy = selectColumns.length > 2 && Boolean(selectColumns[2]);
		
		const orderBy = hasGroupBy 
			? [
				{ columnName: selectColumns[2], type: OrderByDirection.ASC },
				{ columnName: selectColumns[1], type: OrderByDirection.ASC }
			]
			: [{ columnName: selectColumns[1], type: OrderByDirection.ASC }];

		const result = await filterDefinition.loader({
			select: apiSelectColumns,
			limit,
			offset: keyword ? 0 : useOffset,
			orderBy,
			q: keyword || ''
		});

		return result;
	};

	if (isMultipleSelector) {
		return (
			<MultiSelectCustom
				data={options as FilterAutocompleteOption[]}
				tempData={tempData as FilterAutocompleteOption[]}
				searchOptions={searchOptions as FilterAutocompleteOption[]}
				onChange={handleMultiOnChange}
				onSearchChange={handleSearchChange}
				initialValues={expressionCondition.values}
				onScroll={handleScroll}
				filterDefinition={filterDefinition}
			/>
		);
	}

	return (
		<div className="vysta-select-wrapper">
			<select
				ref={inputRef}
				className="vysta-select"
				value={expressionCondition.values[0] || ''}
				onChange={(e) => handleOnChange(e.target.value)}
				onScroll={handleScroll}
			>
				<option value="">{loading ? t('Loading...') : t('Select an option')}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default FilterRightHandSideLoader;

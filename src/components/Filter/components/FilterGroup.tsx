import {FC, ReactNode} from 'react';
import {Box, Flex, Group} from '@mantine/core';
import {useTranslation} from 'react-i18next';
import FilterOperator from './FilterOperator';
import {AiOutlinePlus} from 'react-icons/ai';
import Condition from '../../Models/Condition';

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
	const {t} = useTranslation();

	return (
		<>
			{index !== 0 && (
				<Box w={'100'} my={4}>
					<FilterOperator
						isOutsideAGroup={true}
						initialValue={condition.operator}
						onChange={(value) =>
							onChange({...condition, operator: value})
						}
					/>
				</Box>
			)}
			<Flex
				key={condition.id}
				direction={'column'}
				bg={'var(--mantine-color-gray-19)'}
				style={{
					borderRadius: 8,
				}}
				py={16}
				px={16}
				gap={16}
			>
				{children}
				{showNestedConditionButton && (
					<Group>
						<Flex
							c={'var(--mantine-color-gray-20)'}
							onClick={onAddCondition}
							align={'center'}
							gap={6}
							fz={'12px'}
							style={{cursor: 'pointer'}}
						>
							<AiOutlinePlus/>
							{t('Add Filter')}
						</Flex>
					</Group>
				)}
			</Flex>
		</>
	);
};

export default FilterGroup;

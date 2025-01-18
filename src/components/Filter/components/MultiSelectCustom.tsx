import { FC } from 'react';
import { FilterAutocompleteOption } from './FilterAutocomplete';
import { FilterDefinitionWrapper } from '../FilterDefinitionsByField';

interface IProps {
	data: FilterAutocompleteOption[];
	searchOptions?: FilterAutocompleteOption[];
	tempData?: FilterAutocompleteOption[];
	onChange: (values: string[]) => void;
	onSearchChange: (keyword: string) => void;
	onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
	initialValues?: string[];
	filterDefinition?: FilterDefinitionWrapper;
}

const MultiSelectCustom: FC<IProps> = () => {
	return <>Not implemented</>;
};

export default MultiSelectCustom;

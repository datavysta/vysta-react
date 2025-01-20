import { FC } from 'react';
import ExpressionCondition from "../../Models/ExpressionCondition";
import {FilterDefinitionWrapper} from "../FilterDefinitionsByField";
import { useTranslationContext } from '../TranslationContext';

interface Props {
	filterDefinition: FilterDefinitionWrapper;
	expressionCondition: ExpressionCondition;
	onChange: (expressionCondition: ExpressionCondition) => void;
}

const FilterRightHandSideLoader: FC<Props> = () => {
	const { t } = useTranslationContext();
	throw new Error(t('FilterRightHandSideLoader is temporarily disabled. Please use a different component for now.'));
};

export default FilterRightHandSideLoader;

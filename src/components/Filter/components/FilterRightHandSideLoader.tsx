import { FC } from 'react';
import ExpressionCondition from "../../Models/ExpressionCondition";
import {FilterDefinitionWrapper} from "../FilterDefinitionsByField";

interface Props {
	filterDefinition: FilterDefinitionWrapper;
	expressionCondition: ExpressionCondition;
	onChange: (expressionCondition: ExpressionCondition) => void;
}

const FilterRightHandSideLoader: FC<Props> = () => {
	throw new Error('FilterRightHandSideLoader is temporarily disabled. Please use a different component for now.');
};

export default FilterRightHandSideLoader;

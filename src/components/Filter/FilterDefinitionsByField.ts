import {IReadonlyDataService} from '@datavysta/vysta-client';
import DataType from "../Models/DataType";

type FilterDefinition<TBase, TSummary extends TBase> = {
    loader?: IReadonlyDataService<TBase, TSummary>['getAll'];
    loaderColumns?: string[]; // Custom column names (e.g., ["id", "code", "siteGroupName", "name"])
    targetFieldName?: string;
    label?: string;
    dataType?: DataType;
    group?: string;
    items?: FilterDefinition<TBase, TSummary>[];
    staticData?: boolean;
};

export type FilterDefinitionWrapper = FilterDefinition<any, any>;

export type FilterDefinitionsByField = FilterDefinitionWrapper[];
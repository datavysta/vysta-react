import type { IReadonlyDataService } from '@datavysta/vysta-client';
import DataType from "../Models/DataType";

export type FilterDefinition<TBase extends object, TSummary extends TBase = TBase> = {
    repository?: IReadonlyDataService<TBase, TSummary>;
    // Custom column names (e.g., ["id", "code", "siteGroupName", "name"])
    loaderColumns?: (keyof TBase)[];
    targetFieldName?: string;
    label?: string;
    dataType?: DataType;
    group?: string;
    items?: FilterDefinition<TBase, TSummary>[];
    staticData?: boolean;
};

export type FilterDefinitionWrapper = FilterDefinition<never>;

export type FilterDefinitionsByField = FilterDefinitionWrapper[];

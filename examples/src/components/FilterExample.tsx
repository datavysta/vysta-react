import React, { useState } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import './FilterExample.css';
import Condition from "../../../src/components/Models/Condition";
import FilterPanel from "../../../src/components/Filter/FilterPanel";
import DataType from "../../../src/components/Models/DataType";
import { FilterDefinitionsByField } from "../../../src/components/Filter/FilterDefinitionsByField";
import CustomToggleComponent from '../../../src/components/datavistas/fields/CustomToggleComponent';
import Fields from '../../../src/components/datavistas/fields';
import { FieldComponentProvider } from '../../../src/components/datavistas/FieldComponentContext';

interface FilterExampleProps {
    client: VystaClient;
    tick: number;
}

const filterDefinitions: FilterDefinitionsByField = [
    {
        targetFieldName: "productName",
        label: "Product Name",
        dataType: DataType.String
    },
    {
        targetFieldName: "unitPrice",
        label: "Unit Price",
        dataType: DataType.Numeric
    },
    {
        targetFieldName: "unitsInStock",
        label: "Units In Stock",
        dataType: DataType.Numeric
    },
    {
        targetFieldName: "discontinued",
        label: "Discontinued",
        dataType: DataType.Boolean
    }
];

export function FilterExample({ 
    client, 
    tick 
}: FilterExampleProps) {
    const [conditions, setConditions] = useState<Condition[]>([]);

    const customComponents = {
        [Fields.Toggle]: CustomToggleComponent
    };

    return (
        <div className="example-container">
            <div className="filter-content">
                <h1>Filter Example</h1>
                <div className="filter-panel-container">
                    <FieldComponentProvider components={customComponents}>
                        <FilterPanel 
                            conditions={conditions}
                            onChange={setConditions}
                            filterDefinitions={filterDefinitions}
                        />
                    </FieldComponentProvider>
                </div>
                <div className="json-output">
                    <h2>Filter JSON</h2>
                    <pre>
                        {JSON.stringify(conditions, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
} 
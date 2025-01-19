import React, { useState } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { ExampleToolbar } from './ExampleToolbar';
import './FilterExample.css';
import Condition from "../../../src/components/Models/Condition";
import FilterPanel from "../../../src/components/Filter/FilterPanel";
import DataType from "../../../src/components/Models/DataType";
import { FilterDefinitionsByField } from "../../../src/components/Filter/FilterDefinitionsByField";

interface FilterExampleProps {
    client: VystaClient;
    onShowProducts: () => void;
    onShowCustomers: () => void;
    onShowOrders: () => void;
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
    onShowProducts, 
    onShowCustomers, 
    onShowOrders,
    tick 
}: FilterExampleProps) {
    const [conditions, setConditions] = useState<Condition[]>([]);

    return (
        <div className="example-container">
            <ExampleToolbar 
                onShowProducts={onShowProducts}
                onShowCustomers={onShowCustomers}
                onShowOrders={onShowOrders}
                onShowFilter={() => {}}
                currentView="filter"
            />
            <div className="filter-content">
                <h1>Filter Example</h1>
                <div className="filter-panel-container">
                    <FilterPanel 
                        conditions={conditions}
                        onChange={setConditions}
                        filterDefinitions={filterDefinitions}
                    />
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
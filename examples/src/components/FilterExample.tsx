import React, { useState } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { ExampleToolbar } from './ExampleToolbar';
import './FilterExample.css';
import Condition from "../../../src/components/Models/Condition";
import FilterPanel from "../../../src/components/Filter/FilterPanel";

interface FilterExampleProps {
    client: VystaClient;
    onShowProducts: () => void;
    onShowCustomers: () => void;
    onShowOrders: () => void;
    tick: number;
}

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
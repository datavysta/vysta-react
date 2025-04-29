import React, { useState } from 'react';
import './FilterExample.css';
import Condition from "../../../src/components/Models/Condition";
import FilterPanel from "../../../src/components/Filter/FilterPanel";
import DataType from "../../../src/components/Models/DataType";
import { FilterDefinitionsByField } from "../../../src/components/Filter/FilterDefinitionsByField";
import CustomToggleComponent from '../../../src/components/datavistas/fields/CustomToggleComponent';
import Fields from '../../../src/components/datavistas/fields';
import { FieldComponentProvider } from '../../../src/components/datavistas/FieldComponentContext';

interface FilterExampleProps {
    tick: number;
}

const productFilterDefinitions: FilterDefinitionsByField = [
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

const orderFilterDefinitions: FilterDefinitionsByField = [
    {
        targetFieldName: "orderId",
        label: "Order ID",
        dataType: DataType.Numeric
    },
    {
        targetFieldName: "customerName",
        label: "Customer Name",
        dataType: DataType.String
    },
    {
        targetFieldName: "orderDate",
        label: "Order Date",
        dataType: DataType.Date
    },
    {
        targetFieldName: "shippingMethod",
        label: "Shipping Method",
        dataType: DataType.String
    },
    {
        targetFieldName: "totalAmount",
        label: "Total Amount",
        dataType: DataType.Numeric
    }
];

export function FilterExample({ tick }: FilterExampleProps) {
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [showFilterPanel, setShowFilterPanel] = useState(true);
    const [useProductFilters, setUseProductFilters] = useState(true);

    const filterDefinitions = useProductFilters 
        ? productFilterDefinitions 
        : orderFilterDefinitions;

    const customComponents = {
        [Fields.Toggle]: CustomToggleComponent
    };

    const handleApply = (appliedConditions: Condition[]) => {
        setConditions(appliedConditions);
        // Optionally, could close the panel here
        // setShowFilterPanel(false);
    };

    const handleToggleFilterSet = () => {
        setUseProductFilters(!useProductFilters);
        setConditions([]); // Clear conditions when switching filter sets
    };

    return (
        <div className="example-container">
            <div className="filter-content">
                <div className="filter-header">
                    <h1>Filter Example</h1>
                    <button 
                        className="toggle-filter-button"
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        title={showFilterPanel ? "Hide Filter Panel" : "Show Filter Panel"}
                    >
                        {showFilterPanel ? "🔼" : "🔽"}
                    </button>
                </div>
                
                <div className="filter-controls">
                    <div className="segment-control">
                        <button 
                            className={`segment-button ${useProductFilters ? 'active' : ''}`}
                            onClick={() => useProductFilters || handleToggleFilterSet()}
                        >
                            Product Filters
                        </button>
                        <button 
                            className={`segment-button ${!useProductFilters ? 'active' : ''}`}
                            onClick={() => useProductFilters && handleToggleFilterSet()}
                        >
                            Order Filters
                        </button>
                    </div>
                </div>
                
                <div className="filter-panel-container">
                    {showFilterPanel && (
                        <FieldComponentProvider components={customComponents}>
                            <FilterPanel 
                                conditions={conditions}
                                onApply={handleApply}
                                filterDefinitions={filterDefinitions}
                            />
                        </FieldComponentProvider>
                    )}
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
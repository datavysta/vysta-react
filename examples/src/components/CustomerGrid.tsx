import React, { useMemo, useState } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { CustomerService } from '../services/CustomerService';
import { Customer } from '../types/Customer';
import { ColDef } from 'ag-grid-community';
import './CustomerGrid.css';
import { Modal, Button } from '@mantine/core';
import Condition from '../../../src/components/Models/Condition';
import FilterPanel from '../../../src/components/Filter/FilterPanel';
import DataType from '../../../src/components/Models/DataType';
import { FilterDefinitionsByField } from '../../../src/components/Filter/FilterDefinitionsByField';
import { FieldComponentProvider } from '../../../src/components/datavistas/FieldComponentContext';

interface CustomerGridProps {
    client: VystaClient;
    tick: number;
}

export function CustomerGrid({ 
    client,
    tick 
}: CustomerGridProps) {
    const customers = useMemo(() => new CustomerService(client), [client]);
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const filterDefinitions: FilterDefinitionsByField = [
        {
            targetFieldName: "customerId",
            label: "Customer ID",
            dataType: DataType.String
        },
        {
            targetFieldName: "companyName",
            label: "Company Name",
            dataType: DataType.String
        },
        {
            targetFieldName: "contactName",
            label: "Contact Name",
            dataType: DataType.String
        },
        {
            targetFieldName: "country",
            label: "Country",
            dataType: DataType.String
        },
        {
            targetFieldName: "phone",
            label: "Phone",
            dataType: DataType.String
        }
    ];

    const columnDefs: ColDef<Customer>[] = [
        { 
            field: 'customerId',
            headerName: 'ID',
            width: 100,
            initialSort: 'asc'
        },
        { 
            field: 'companyName',
            headerName: 'Company',
            flex: 2
        },
        { 
            field: 'contactName',
            headerName: 'Contact',
            flex: 1
        },
        { 
            field: 'country',
            headerName: 'Country',
            width: 120
        },
        { 
            field: 'phone',
            headerName: 'Phone',
            flex: 1
        }
    ];

    const toolbarItems = (
        <Button 
            variant="light" 
            onClick={() => setShowFilterModal(true)}
            size="sm"
        >
            Filter
        </Button>
    );

    const handleApplyFilter = (newConditions: Condition[]) => {
        setConditions(newConditions);
        setShowFilterModal(false);
    };

    return (
        <div className="example-container">
            <div className="grid-container">
                <DataGrid<Customer>
                    title="Customers"
                    noun="Customer"
                    repository={customers}
                    columnDefs={columnDefs}
                    getRowId={(customer) => customer.customerId.toString()}
                    gridOptions={{
                        alwaysShowVerticalScroll: true,
                    }}
                    styles={{
                        badge: {
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '4px 12px'
                        }
                    }}
                    tick={tick}
                    conditions={conditions}
                    toolbarItems={toolbarItems}
                />
                <Modal 
                    opened={showFilterModal} 
                    onClose={() => setShowFilterModal(false)}
                    title="Filter Customers"
                    size="90dvw"
                >
                    <FieldComponentProvider>
                        <FilterPanel
                            conditions={conditions}
                            onApply={handleApplyFilter}
                            filterDefinitions={filterDefinitions}
                        />
                    </FieldComponentProvider>
                </Modal>
            </div>
        </div>
    );
} 
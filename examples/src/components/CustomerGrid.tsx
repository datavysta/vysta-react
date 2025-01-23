import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { CustomerService } from '../services/CustomerService';
import { Customer } from '../types/Customer';
import { ColDef } from 'ag-grid-community';
import { ExampleToolbar } from './ExampleToolbar';
import './CustomerGrid.css';

interface CustomerGridProps {
    client: VystaClient;
    onShowProducts: () => void;
    onShowOrders: () => void;
    onShowFilter: () => void;
    onShowLazyLoadList: () => void;
    tick: number;
}

export function CustomerGrid({ 
    client, 
    onShowProducts, 
    onShowOrders, 
    onShowFilter,
    onShowLazyLoadList,
    tick 
}: CustomerGridProps) {
    const customers = useMemo(() => new CustomerService(client), [client]);

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

    return (
        <div className="example-container">
            <ExampleToolbar 
                onShowProducts={onShowProducts}
                onShowCustomers={() => {}}
                onShowOrders={onShowOrders}
                onShowFilter={onShowFilter}
                onShowLazyLoadList={onShowLazyLoadList}
                currentView="customers"
            />
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
                />
            </div>
        </div>
    );
} 
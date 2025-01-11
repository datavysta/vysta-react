import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { CustomerService } from '../services/CustomerService';
import { CustomerWithFullName } from '../types/Customer';
import { ColDef } from 'ag-grid-community';

interface CustomerGridProps {
    client: VystaClient;
    onShowProducts: () => void;
}

export function CustomerGrid({ client, onShowProducts }: CustomerGridProps) {
    const customers = useMemo(() => new CustomerService(client), [client]);

    const columnDefs: ColDef<CustomerWithFullName>[] = [
        { 
            field: 'customerId',
            headerName: 'ID',
            width: 100,
            sort: 'desc'
        },
        { 
            field: 'companyName',
            headerName: 'Company',
            flex: 2
        },
        { 
            field: 'contactName',
            headerName: 'Contact Name',
            flex: 1
        },
        { 
            field: 'contactTitle',
            headerName: 'Title',
            flex: 1
        },
        { 
            field: '_contact',
            headerName: 'Contact Info',
            flex: 2
        }
    ];

    return (
        <>
            <div style={{ padding: '8px' }}>
                <button onClick={onShowProducts} style={{ marginBottom: '8px' }}>Show Products</button>
            </div>
            <DataGrid<CustomerWithFullName>
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
            />
        </>
    );
} 
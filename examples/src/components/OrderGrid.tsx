import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { OrderService } from '../services/OrderService';
import { OrderWithTotal } from '../types/Order';
import { ColDef } from 'ag-grid-community';

interface OrderGridProps {
    client: VystaClient;
    onShowProducts: () => void;
    onShowCustomers: () => void;
    tick: number;
}

export function OrderGrid({ client, onShowProducts, onShowCustomers, tick }: OrderGridProps) {
    const orders = useMemo(() => new OrderService(client), [client]);

    const columnDefs: ColDef<OrderWithTotal>[] = [
        { 
            field: 'orderId',
            headerName: 'ID',
            width: 100,
            initialSort: 'asc'
        },
        { 
            field: 'orderDate',
            headerName: 'Date',
            flex: 1,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        },
        { 
            field: 'shipName',
            headerName: 'Ship To',
            flex: 2
        },
        { 
            field: 'shipCountry',
            headerName: 'Country',
            width: 120
        },
        { 
            field: 'freight',
            headerName: 'Freight',
            flex: 1,
            valueFormatter: (params) => params.value && `$${params.value.toFixed(2)}`
        },
        { 
            field: '_total',
            headerName: 'Total',
            flex: 1,
            valueFormatter: (params) => params.value && `$${params.value.toFixed(2)}`
        }
    ];

    return (
        <>
            <div style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                <button onClick={onShowProducts} style={{ marginBottom: '8px' }}>Show Products</button>
                <button onClick={onShowCustomers} style={{ marginBottom: '8px' }}>Show Customers</button>
            </div>
            <DataGrid<OrderWithTotal>
                title="Orders"
                noun="Order"
                repository={orders}
                columnDefs={columnDefs}
                getRowId={(order) => order.orderId.toString()}
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
        </>
    );
} 
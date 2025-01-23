import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { OrderService } from '../services/OrderService';
import { Order } from '../types/Order';
import { ColDef } from 'ag-grid-community';
import { ExampleToolbar } from './ExampleToolbar';
import './OrderGrid.css';

interface OrderGridProps {
    client: VystaClient;
    onShowProducts: () => void;
    onShowCustomers: () => void;
    onShowFilter: () => void;
    onShowLazyLoadList: () => void;
    tick: number;
}

export function OrderGrid({ 
    client, 
    onShowProducts, 
    onShowCustomers, 
    onShowFilter,
    onShowLazyLoadList,
    tick 
}: OrderGridProps) {
    const orders = useMemo(() => new OrderService(client), [client]);

    const columnDefs: ColDef<Order>[] = [
        { 
            field: 'orderId',
            headerName: 'ID',
            width: 100,
            initialSort: 'asc'
        },
        { 
            field: 'customerId',
            headerName: 'Customer',
            flex: 1
        },
        { 
            field: 'employeeId',
            headerName: 'Employee',
            flex: 1
        },
        { 
            field: 'orderDate',
            headerName: 'Order Date',
            flex: 1
        },
        { 
            field: 'requiredDate',
            headerName: 'Required Date',
            flex: 1
        },
        { 
            field: 'shippedDate',
            headerName: 'Shipped Date',
            flex: 1
        }
    ];

    return (
        <div className="example-container">
            <ExampleToolbar 
                onShowProducts={onShowProducts}
                onShowCustomers={onShowCustomers}
                onShowOrders={() => {}}
                onShowFilter={onShowFilter}
                onShowLazyLoadList={onShowLazyLoadList}
                currentView="orders"
            />
            <div className="grid-container">
                <DataGrid<Order>
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
            </div>
        </div>
    );
} 
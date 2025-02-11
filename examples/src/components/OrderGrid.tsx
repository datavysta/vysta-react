import React, { useMemo, useState } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { OrderService } from '../services/OrderService';
import { Order } from '../types/Order';
import { ColDef, GridApi } from 'ag-grid-community';
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
    const [logs, setLogs] = useState<string[]>([]);
    const [useFilter, setUseFilter] = useState(false);
    const [useInputProps, setUseInputProps] = useState(false);
    const [localTick, setLocalTick] = useState(0);

    const filters = useMemo(() => useFilter ? { employeeId: { eq: 1 } } : undefined, [useFilter]);
    const inputProperties = useMemo(() => useInputProps ? { test: 'value' } : undefined, [useInputProps]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

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
            <div style={{ margin: '10px' }}>
                <button onClick={() => setUseFilter(prev => !prev)} style={{ marginRight: '10px' }}>
                    Toggle Filter: {useFilter ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => setUseInputProps(prev => !prev)} style={{ marginRight: '10px' }}>
                    Toggle Input Props: {useInputProps ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => setLocalTick(t => t + 1)} style={{ marginRight: '10px' }}>
                    Increment Tick: {localTick}
                </button>
                <button onClick={() => setLogs([])} style={{ marginLeft: '10px' }}>
                    Clear Logs
                </button>
            </div>
            <div style={{ 
                margin: '10px',
                padding: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                maxHeight: '100px',
                overflowY: 'auto',
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace'
            }}>
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
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
                    filters={filters}
                    inputProperties={inputProperties}
                    tick={localTick}
                    supportDelete
                    supportRegularDownload
                    deleteButton={(onDelete) => (
                        <button 
                            onClick={onDelete}
                            style={{
                                padding: '2px 8px',
                                background: 'none',
                                border: '1px solid #ff4d4f',
                                borderRadius: '4px',
                                color: '#ff4d4f',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>
                    )}
                    onDataFirstLoaded={(api: GridApi<Order>) => {
                        addLog('onDataFirstLoaded called');
                    }}
                    onDataLoaded={(api: GridApi<Order>, data: Order[]) => {
                        addLog(`onDataLoaded called with ${data.length} rows`);
                    }}
                />
            </div>
        </div>
    );
} 
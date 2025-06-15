import React, { useMemo, useState } from 'react';
import { DataGrid } from '../../../src';
import { useServices } from './ServicesProvider';
import { Order } from '../types/Order';
import { ColDef, GridApi } from 'ag-grid-community';
import { EditableFieldType } from '../../../src/components/DataGrid/types';
import './OrderGrid.css';

interface OrderGridProps {
    tick: number;
}

export function OrderGrid({ tick }: OrderGridProps) {
    const { orderService, customerService } = useServices();
    const [logs, setLogs] = useState<string[]>([]);
    const [useFilter, setUseFilter] = useState(false);
    const [useInputProps, setUseInputProps] = useState(false);
    const [localTick, setLocalTick] = useState(0);
    const [searchText, setSearchText] = useState('');

    const filters = useMemo(() => useFilter ? { employeeId: { eq: 1 } } : undefined, [useFilter]);
    const inputProperties = useMemo(() => useInputProps ? { test: 'value' } : undefined, [useInputProps]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const columnDefs: ColDef<Order>[] = [
        { field: 'orderId', headerName: 'ID', width: 100, initialSort: 'asc' },
        { field: 'customerId', headerName: 'Customer', flex: 1 },
        { field: 'employeeId', headerName: 'Employee', flex: 1 },
        { field: 'orderDate', headerName: 'Order Date', flex: 1 },
        { field: 'requiredDate', headerName: 'Required Date', flex: 1 },
        { field: 'shippedDate', headerName: 'Shipped Date', flex: 1 }
    ];

    return (
        <div className="example-container">
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
            <div style={{ margin: '10px' }}>
                <label htmlFor="searchInput" style={{ marginRight: '10px' }}>Search: </label>
                <input 
                    id="searchInput"
                    type="text" 
                    value={searchText} 
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search orders..."
                    style={{ 
                        padding: '6px 10px',
                        border: '1px solid #ccc', 
                        borderRadius: '4px',
                        width: '250px'
                    }}
                />
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
                    repository={orderService}
                    columnDefs={columnDefs}
                    getRowId={(order) => order.orderId.toString()}
                    wildcardSearch={searchText}
                    editableFields={{
                        customerId: {
                            dataType: EditableFieldType.List,
                            listService: customerService,
                            displayColumn: 'customerId',
                            clearable: false,
                            listOptions: {
                                defaultOpened: true
                            }
                        }
                    }}
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
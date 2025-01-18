import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductService } from '../services/ProductService';
import { Product } from '../types/Product';
import { ColDef } from 'ag-grid-community';
import { ExampleToolbar } from './ExampleToolbar';
import './ProductGrid.css';

interface ProductGridProps {
    client: VystaClient;
    onShowCustomers: () => void;
    onShowOrders: () => void;
    onShowFilter: () => void;
    tick: number;
}

export function ProductGrid({ client, onShowCustomers, onShowOrders, onShowFilter, tick }: ProductGridProps) {
    const products = useMemo(() => new ProductService(client), [client]);

    const columnDefs: ColDef<Product>[] = [
        { 
            field: 'productId',
            headerName: 'ID',
            width: 100,
            initialSort: 'asc'
        },
        { 
            field: 'productName',
            headerName: 'Name',
            flex: 2
        },
        { 
            field: 'unitPrice',
            headerName: 'Price',
            flex: 1,
            valueFormatter: (params) => params.value && `$${params.value.toFixed(2)}`
        },
        { 
            field: 'quantityPerUnit',
            headerName: 'Quantity Per Unit',
            flex: 1
        },
        { 
            field: 'unitsInStock',
            headerName: 'Stock',
            width: 120
        },
        { 
            field: 'discontinued',
            headerName: 'Discontinued',
            width: 120
        }
    ];

    return (
        <div className="example-container">
            <ExampleToolbar 
                onShowProducts={() => {}}
                onShowCustomers={onShowCustomers}
                onShowOrders={onShowOrders}
                onShowFilter={onShowFilter}
                currentView="products"
            />
            <div className="grid-container">
                <DataGrid<Product>
                    title="Products"
                    noun="Product"
                    repository={products}
                    columnDefs={columnDefs}
                    getRowId={(product) => product.productId.toString()}
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
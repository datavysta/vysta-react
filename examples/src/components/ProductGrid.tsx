import React, { useMemo, useState } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductService } from '../services/ProductService';
import { Product } from '../types/Product';
import { ColDef } from 'ag-grid-community';

interface ProductGridProps {
    client: VystaClient;
    onShowCustomers: () => void;
    onShowOrders: () => void;
    tick: number;
}

export function ProductGrid({ client, onShowCustomers, onShowOrders, tick }: ProductGridProps) {
    const [showInStock, setShowInStock] = useState<boolean | null>(null);
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
            headerName: 'Product Name',
            flex: 2
        },
        { 
            field: 'unitsInStock',
            headerName: 'Stock',
            width: 120
        },
        { 
            field: 'unitPrice',
            headerName: 'Price',
            flex: 1,
            valueFormatter: (params) => params.value && `$${params.value?.toFixed(2)}`
        }
    ];

    const filters = useMemo(() => {
        if (showInStock === null) return {};
        return {
            unitsInStock: showInStock ? { gt: 0 } : { eq: 0 }
        };
    }, [showInStock]);

    const toolbarItems = (
        <div style={{ marginRight: '16px' }}>
            <select 
                value={showInStock === null ? '' : showInStock.toString()} 
                onChange={(e) => {
                    const val = e.target.value;
                    setShowInStock(val === '' ? null : val === 'true');
                }}
                style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                }}
            >
                <option value="">All Products</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
            </select>
        </div>
    );

    return (
        <>
            <div style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                <button onClick={onShowCustomers} style={{ marginBottom: '8px' }}>Show Customers</button>
                <button onClick={onShowOrders} style={{ marginBottom: '8px' }}>Show Orders</button>
            </div>
            <DataGrid<Product>
                title="Products"
                noun="Product"
                repository={products}
                columnDefs={columnDefs}
                getRowId={(product) => product.productId.toString()}
                gridOptions={{
                    alwaysShowVerticalScroll: true,
                }}
                supportDelete={true}
                supportInsert={true}
                supportRegularDownload={true}
                filters={filters}
                toolbarItems={toolbarItems}
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
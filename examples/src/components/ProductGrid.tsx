import React from 'react';
import { DataGrid } from '../../../src/components/DataGrid/DataGrid';
import { VystaClient } from '@datavysta/vysta-client';
import { ExampleToolbar } from './ExampleToolbar';
import { ColDef } from 'ag-grid-community';
import { ProductService } from '../services/ProductService';
import { Product } from '../types/Product';
import './ProductGrid.css';

interface ProductGridProps {
    client: VystaClient;
    onShowCustomers: () => void;
    onShowOrders: () => void;
    onShowFilter: () => void;
    onShowLazyLoadList: () => void;
    tick: number;
}

export function ProductGrid({ 
    client, 
    onShowCustomers, 
    onShowOrders, 
    onShowFilter,
    onShowLazyLoadList,
    tick 
}: ProductGridProps) {
    const products = React.useMemo(() => new ProductService(client), [client]);

    const columnDefs = React.useMemo<ColDef<Product>[]>(() => [
        { field: 'productId', headerName: 'ID' },
        { field: 'productName', headerName: 'Name' },
        { field: 'unitPrice', headerName: 'Price' },
        { field: 'unitsInStock', headerName: 'Stock' },
        { field: 'discontinued', headerName: 'Discontinued' }
    ], []);

    return (
        <div className="example-container">
            <ExampleToolbar
                currentView="products"
                onShowProducts={() => {}}
                onShowCustomers={onShowCustomers}
                onShowOrders={onShowOrders}
                onShowFilter={onShowFilter}
                onShowLazyLoadList={onShowLazyLoadList}
            />
            <div className="grid-container">
                <DataGrid<Product>
                    title="Products"
                    noun="Product"
                    repository={products}
                    columnDefs={columnDefs}
                    getRowId={(product) => product.productId.toString()}
                    tick={tick}
                />
            </div>
        </div>
    );
} 
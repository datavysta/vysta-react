import React from 'react';
import { DataGrid } from '../../../src/components/DataGrid/DataGrid';
import { VystaClient } from '@datavysta/vysta-client';
import { ColDef } from 'ag-grid-community';
import { ProductService } from '../services/ProductService';
import { Product } from '../types/Product';
import './ProductGrid.css';
import { PageView } from '../types/PageView';

interface ProductGridProps {
    client: VystaClient;
    onViewChange: (view: PageView) => void;
    tick: number;
}

export function ProductGrid({ 
    client, 
    onViewChange,
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
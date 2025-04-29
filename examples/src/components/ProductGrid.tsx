import React, { useMemo } from 'react';
import { DataGrid } from '../../../src/components/DataGrid/DataGrid';
import { useServices } from './ServicesProvider';
import { ColDef } from 'ag-grid-community';
import { Product } from '../types/Product';
import './ProductGrid.css';
import { PageView } from '../types/PageView';

interface ProductGridProps {
    onViewChange: (view: PageView) => void;
    tick: number;
}

export function ProductGrid({ onViewChange, tick }: ProductGridProps) {
    const { productService } = useServices();

    const columnDefs = useMemo<ColDef<Product>[]>(() => [
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
                    repository={productService}
                    columnDefs={columnDefs}
                    getRowId={(product) => product.productId.toString()}
                    tick={tick}
                />
            </div>
        </div>
    );
} 
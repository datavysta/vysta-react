import React, { useMemo } from 'react';
import { DataGrid } from '../../../src/components/DataGrid/DataGrid';
import { useServices } from './ServicesProvider';
import { ColDef } from 'ag-grid-community';
import { Product } from '../types/Product';
import './ProductGrid.css';
import { PageView } from '../types/PageView';
import { Aggregate, SelectColumn } from '@datavysta/vysta-client';

interface ProductGridProps {
    onViewChange: (view: PageView) => void;
    tick: number;
}

export function ProductGrid({ onViewChange, tick }: ProductGridProps) {
    const { productService } = useServices();

    const columnDefs = useMemo<ColDef<Product>[]>(() => [
        { field: 'productId', headerName: 'ID' },
        { field: 'productName', headerName: 'Name' },
        { field: 'unitPrice', headerName: 'Price', valueFormatter: ({ value }) => value && `$${Number(value).toFixed(2)}` },
        { field: 'unitsInStock', headerName: 'Stock' },
        { field: 'discontinued', headerName: 'Discontinued' }
    ], []);

    const aggregateSelect = useMemo<SelectColumn<Product>[]>(() => [
        { name: 'unitPrice', aggregate: Aggregate.AVG, alias: 'avgUnitPrice' },
        { name: 'unitsInStock', aggregate: Aggregate.SUM, alias: 'totalUnitsInStock' },
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
                    aggregateSelect={aggregateSelect}
                />
            </div>
        </div>
    );
} 
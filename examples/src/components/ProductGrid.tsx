import { useMemo, useState } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
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
    const [rowCount, setRowCount] = useState<number>(0);

    const defaultColDef = useMemo<ColDef>(() => ({ minWidth: 150 }), []);

    const columnDefs = useMemo<ColDef<Product>[]>(() => [
        { field: 'productId', headerName: 'ID' },
        { field: 'productName', headerName: 'Name' },
        { field: 'unitPrice', headerName: 'Price', valueFormatter: ({ value }) => value && `$${Number(value).toFixed(2)}` },
        { field: 'unitsInStock', headerName: 'Stock' },
        { field: 'discontinued', headerName: 'Discontinued' },
        { headerName: 'Price 2', colId: 'price2', valueGetter: () => 'hello' },
        { headerName: 'Stock 2', colId: 'stock2', valueGetter: () => 'hello' },
        { headerName: 'Name 2', colId: 'name2', valueGetter: () => 'hello' },
        { headerName: 'Price 3', colId: 'price3', valueGetter: () => 'hello' },
        { headerName: 'Stock 3', colId: 'stock3', valueGetter: () => 'hello' },
        { headerName: 'Name 3', colId: 'name3', valueGetter: () => 'hello' },
        { headerName: 'Price 4', colId: 'price4', valueGetter: () => 'hello' },
        { headerName: 'Stock 4', colId: 'stock4', valueGetter: () => 'hello' },
        { headerName: 'Name 4', colId: 'name4', valueGetter: () => 'hello' },
        { headerName: 'Price 5', colId: 'price5', valueGetter: () => 'hello' },
        { headerName: 'Stock 5', colId: 'stock5', valueGetter: () => 'hello' },
        { headerName: 'Name 5', colId: 'name5', valueGetter: () => 'hello' },
        { field: 'unitsInStock', headerName: 'Stock Duplicate 1' },
        { field: 'unitsInStock', headerName: 'Stock Duplicate 2' },
    ], []);

    const aggregateSelect = useMemo<SelectColumn<Product>[]>(() => [
        { name: 'unitPrice', aggregate: Aggregate.AVG, alias: 'avgUnitPrice' },
        { name: 'unitsInStock', aggregate: Aggregate.SUM, alias: 'totalUnitsInStock' },
    ], []);

    return (
        <div className="example-container">
            <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                <strong>Row Count Callback Test:</strong> Current row count: <span style={{ color: '#007bff', fontWeight: 'bold' }}>{rowCount}</span>
            </div>
            <div className="grid-container">
                <DataGrid<Product>
                    title="Products"
                    noun="Product"
                    repository={productService}
                    columnDefs={columnDefs}
                    gridOptions={{ defaultColDef }}
                    getRowId={(product) => product.productId.toString()}
                    tick={tick}
                    aggregateSelect={aggregateSelect}
                    onRowCountChange={(count) => {
                        console.log('Row count changed:', count);
                        setRowCount(count);
                    }}
                />
            </div>
        </div>
    );
}    
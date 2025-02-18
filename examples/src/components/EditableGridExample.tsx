import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductService } from '../services/ProductService';
import { Product } from '../types/Product';
import { ColDef } from 'ag-grid-community';
import './EditableGridExample.css';

interface EditableGridExampleProps {
    client: VystaClient;
    tick: number;
}

export function EditableGridExample({
    client,
    tick
}: EditableGridExampleProps) {
    const productService = useMemo(() => new ProductService(client), [client]);

    const columnDefs = useMemo<ColDef<Product>[]>(() => [
        { 
            field: 'productId',
            headerName: 'ID',
            width: 100,
            initialSort: 'asc',
            editable: false
        },
        { 
            field: 'productName',
            headerName: 'Name',
            editable: true
        },
        { 
            field: 'unitPrice',
            headerName: 'Price',
            editable: true
        },
        { 
            field: 'unitsInStock',
            headerName: 'Stock',
            editable: true
        }
    ], []);

    return (
        <div className="example-container">
            <div className="grid-container">
                <DataGrid<Product>
                    title="Editable Products"
                    noun="product"
                    repository={productService}
                    columnDefs={columnDefs}
                    getRowId={(data) => data.productId + ""}

                    tick={tick}
                />
            </div>
        </div>
    );
} 
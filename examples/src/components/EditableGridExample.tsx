import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductService } from '../services/ProductService';
import { Product } from '../types/Product';
import { ColDef } from 'ag-grid-community';
import { EditableFieldType } from '../../../src/components/DataGrid/types';
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
            initialSort: 'asc'
        },
        { 
            field: 'productName',
            headerName: 'Name'
        },
        { 
            field: 'unitPrice',
            headerName: 'Price'
        },
        { 
            field: 'unitsInStock',
            headerName: 'Stock'
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
                    editableFields={{
                        productName: {
                            dataType: EditableFieldType.Text
                        },
                        unitPrice: {
                            dataType: EditableFieldType.Number,
                            numberOptions: {
                                min: 0,
                                decimalScale: 2,
                                prefix: '$',
                                hideControls: true
                            }
                        },
                        unitsInStock: {
                            dataType: EditableFieldType.Number,
                            numberOptions: {
                                min: 0,
                                decimalScale: 0,
                                hideControls: true
                            }
                        }
                    }}
                    tick={tick}
                />
            </div>
        </div>
    );
} 
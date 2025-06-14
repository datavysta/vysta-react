import React, { useMemo } from 'react';
import { DataGrid } from '../../../src';
import { useServices } from './ServicesProvider';
import { Product } from '../types/Product';
import { ColDef } from 'ag-grid-community';
import { EditableFieldType } from '../../../src/components/DataGrid/types';
import './EditableGridExample.css';

interface EditableGridExampleProps {
    tick: number;
}

export function EditableGridExample({ tick }: EditableGridExampleProps) {
    const { productService } = useServices();

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
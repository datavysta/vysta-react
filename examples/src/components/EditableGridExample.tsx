import React, { useMemo, useEffect, useState } from 'react';
import { DataGrid } from '../../../src';
import { useServices } from './ServicesProvider';
import { Products } from '../types/Product';
import { ColDef } from 'ag-grid-community';
import { EditableFieldType } from '../../../src/components/DataGrid/types';
import './EditableGridExample.css';

interface EditableGridExampleProps {
    tick: number;
}

export function EditableGridExample({ tick }: EditableGridExampleProps) {
    const { productService, supplierService } = useServices();
    const [supplierMap, setSupplierMap] = useState<Record<number, string>>({});

    // Load all suppliers once with caching
    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const result = await supplierService.getAll({
                    select: ['supplierId', 'companyName'],
                    limit: 1000, // Get all suppliers
                    useCache: true
                });
                
                // Create a map of supplierId to companyName
                const map: Record<number, string> = {};
                result.data.forEach(supplier => {
                    map[supplier.supplierId] = supplier.companyName;
                });
                setSupplierMap(map);
            } catch (error) {
                console.error('Failed to load suppliers:', error);
            }
        };
        
        loadSuppliers();
    }, [supplierService]);

    const columnDefs = useMemo<ColDef<Products>[]>(() => [
        { 
            field: 'productId',
            headerName: 'ID',
            width: 100,
            initialSort: 'asc'
        },
        { 
            field: 'productName',
            headerName: 'Name',
            flex: 1
        },
        {
            field: 'supplierId',
            headerName: 'Supplier',
            flex: 1,
            valueGetter: (params) => {
                const supplierId = params.data?.supplierId;
                if (!supplierId) return '';
                
                // Return the company name from our cached map
                // Try both number and string keys since AG Grid might pass either
                return supplierMap[supplierId] || supplierMap[String(supplierId)] || `Supplier ${supplierId}`;
            },
            // The valueGetter is for display only, the actual field value is still supplierId
            valueSetter: (params) => {
                params.data.supplierId = params.newValue;
                return true;
            }
        },
        { 
            field: 'unitPrice',
            headerName: 'Price',
            width: 120
        },
        { 
            field: 'unitsInStock',
            headerName: 'Stock',
            width: 100
        }
    ], [supplierMap]);

    return (
        <div className="example-container">
            <div className="grid-container">
                <DataGrid<Products>
                    title="Editable Products"
                    noun="product"
                    repository={productService}
                    columnDefs={columnDefs}
                    getRowId={(data) => data.productId + ""}
                    editableFields={{
                        productName: {
                            dataType: EditableFieldType.Text
                        },
                        supplierId: {
                            dataType: EditableFieldType.List,
                            listService: supplierService as any,
                            displayColumn: 'companyName',
                            clearable: true,
                            useCache: false,
                            listOptions: {
                                searchable: true,
                                pageSize: 10
                            }
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
                    onSaveComplete={(params) => {
                        // Add a small delay to ensure the save is fully processed
                        setTimeout(() => {
                            params.gridApi.refreshInfiniteCache();
                        }, 100);
                    }}
                />
            </div>
        </div>
    );
}  
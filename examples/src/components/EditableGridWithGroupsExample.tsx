import { useMemo, useEffect, useState } from 'react';
import { DataGrid, EditableFieldType } from '@datavysta/vysta-react';
import { useServices } from './ServicesProvider';
import { Product } from '../types/Product';
import { ColDef } from 'ag-grid-community';
import './EditableGridExample.css';

interface EditableGridWithGroupsExampleProps {
    tick: number;
}

export function EditableGridWithGroupsExample({ tick }: EditableGridWithGroupsExampleProps) {
    const { productService, supplierService, categoryService } = useServices();
    const [supplierMap, setSupplierMap] = useState<Record<number, string>>({});
    const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});

    // Load suppliers and categories
    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const result = await supplierService.getAll({
                    select: ['supplierId', 'companyName'],
                    limit: 1000,
                    useCache: true
                });

                const map: Record<number, string> = {};
                result.data.forEach(supplier => {
                    map[supplier.supplierId] = supplier.companyName;
                });
                setSupplierMap(map);
            } catch (error) {
                console.error('Failed to load suppliers:', error);
            }
        };

        const loadCategories = async () => {
            try {
                const result = await categoryService.getAll({
                    select: ['categoryId', 'categoryName'],
                    limit: 1000,
                    useCache: true
                });

                const map: Record<number, string> = {};
                result.data.forEach(category => {
                    map[category.categoryId] = category.categoryName;
                });
                setCategoryMap(map);
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };

        loadSuppliers();
        loadCategories();
    }, [supplierService, categoryService]);

    // Column definitions with grouped columns
    const columnDefs = useMemo<ColDef<Product>[]>(() => [
        {
            field: 'productId',
            headerName: 'ID',
            width: 80,
            initialSort: 'asc',
            pinned: 'left'
        },
        // Group: Product Details
        {
            headerName: 'Product Details',
            marryChildren: true,
            children: [
                {
                    field: 'productName',
                    headerName: 'Name',
                    flex: 1,
                    minWidth: 200
                },
                {
                    field: 'categoryId',
                    headerName: 'Category',
                    flex: 1,
                    minWidth: 150,
                    valueGetter: (params) => {
                        const categoryId = params.data?.categoryId;
                        if (!categoryId) return '';
                        return categoryMap[categoryId] || categoryMap[String(categoryId)] || `Category ${categoryId}`;
                    }
                },
                {
                    field: 'quantityPerUnit',
                    headerName: 'Quantity Per Unit',
                    flex: 1,
                    minWidth: 150
                }
            ]
        },
        // Group: Supplier Information
        {
            headerName: 'Supplier Information',
            marryChildren: true,
            children: [
                {
                    field: 'supplierId',
                    headerName: 'Supplier',
                    flex: 1,
                    minWidth: 180,
                    valueGetter: (params) => {
                        const supplierId = params.data?.supplierId;
                        if (!supplierId) return '';
                        return supplierMap[supplierId] || supplierMap[String(supplierId)] || `Supplier ${supplierId}`;
                    }
                },
                {
                    field: 'discontinued',
                    headerName: 'Discontinued',
                    width: 120,
                    valueGetter: (params) => params.data?.discontinued ? 'Yes' : 'No'
                }
            ]
        },
        // Group: Inventory & Pricing
        {
            headerName: 'Inventory & Pricing',
            marryChildren: true,
            children: [
                {
                    field: 'unitPrice',
                    headerName: 'Unit Price',
                    width: 120,
                    valueFormatter: (params) => {
                        if (params.value == null) return '';
                        return `$${Number(params.value).toFixed(2)}`;
                    }
                },
                {
                    field: 'unitsInStock',
                    headerName: 'In Stock',
                    width: 100
                },
                {
                    field: 'unitsOnOrder',
                    headerName: 'On Order',
                    width: 100
                },
                {
                    field: 'reorderLevel',
                    headerName: 'Reorder Level',
                    width: 120
                }
            ]
        }
    ], [supplierMap, categoryMap]);

    return (
        <div className="example-container">
            <div className="grid-container">
                <h2>Editable Grid with Column Groups</h2>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                    This example demonstrates an editable grid with column groups.
                    All editable fields work correctly even when nested inside column groups.
                    Try editing Product Name, Category, Supplier, Pricing, and Inventory fields.
                </p>
                <DataGrid<Product>
                    title="Products with Grouped Columns"
                    noun="product"
                    repository={productService}
                    columnDefs={columnDefs}
                    getRowId={(data) => data.productId + ""}
                    editableFields={{
                        // Product Details group
                        productName: {
                            dataType: EditableFieldType.Text
                        },
                        categoryId: {
                            dataType: EditableFieldType.List,
                            listService: categoryService,
                            displayColumn: 'categoryName',
                            clearable: true,
                            useCache: true,
                            listOptions: {
                                searchable: true,
                                pageSize: 10
                            }
                        },
                        quantityPerUnit: {
                            dataType: EditableFieldType.Text
                        },
                        // Supplier Information group
                        supplierId: {
                            dataType: EditableFieldType.List,
                            listService: supplierService,
                            displayColumn: 'companyName',
                            clearable: true,
                            useCache: true,
                            listOptions: {
                                searchable: true,
                                pageSize: 10
                            }
                        },
                        // Inventory & Pricing group
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
                        },
                        unitsOnOrder: {
                            dataType: EditableFieldType.Number,
                            numberOptions: {
                                min: 0,
                                decimalScale: 0,
                                hideControls: true
                            }
                        },
                        reorderLevel: {
                            dataType: EditableFieldType.Number,
                            numberOptions: {
                                min: 0,
                                decimalScale: 0,
                                hideControls: true
                            }
                        }
                    }}
                    tick={tick}
                    supportRegularDownload={true}
                    onSaveComplete={(params) => {
                        console.log(`Updated ${params.field} from ${params.oldValue} to ${params.newValue} for product ID ${params.rowId}`);
                        // Refresh the grid after save
                        setTimeout(() => {
                            params.gridApi.refreshInfiniteCache();
                        }, 100);
                    }}
                />
            </div>
        </div>
    );
}
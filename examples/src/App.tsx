import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductService } from './services/ProductService';
import { Product } from './types/Product';
import { ColDef } from 'ag-grid-community';

function App() {
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [showInStock, setShowInStock] = useState<boolean | null>(null);
    const wasAuthenticated = useRef(true);
    
    const clientRef = useRef(new VystaClient({ 
        baseUrl: 'http://localhost:8080',
        debug: false,
        errorHandler: {
            onError(error: Error) {
                if (error.message === 'Authentication refresh failed') {
                    setIsAuthenticated(false);
                    login();
                } else {
                    console.error('Non-auth error:', error);
                }
            }
        }
    }));

    const login = useCallback(async () => {
        try {
            await clientRef.current.login('test@datavysta.com', 'password');
            setError(null);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            setError('Failed to login. Please check your credentials and server status.');
            setIsAuthenticated(false);
            return false;
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && !wasAuthenticated.current) {
            setTick(t => t + 1);
        }
        wasAuthenticated.current = isAuthenticated;
    }, [isAuthenticated]);

    useEffect(() => {
        async function initAuth() {
            try {
                const isValid = clientRef.current["auth"].isAuthenticated();
                if (isValid) {
                    setIsAuthenticated(true);
                } else {
                    await login();
                }
            } catch {
                await login();
            }
        }
        initAuth();
    }, [login]);

    const products = useMemo(() => new ProductService(clientRef.current), []);

    const columnDefs: ColDef<Product>[] = [
        { 
            field: 'productId',
            headerName: 'ID',
            width: 100
        },
        { 
            field: 'productName',
            headerName: 'Product Name',
            flex: 2
        },
        { 
            field: 'unitsInStock',
            headerName: 'Stock',
            width: 120
        },
        { 
            field: 'unitPrice',
            headerName: 'Price',
            flex: 1,
            valueFormatter: (params) => params.value && `$${params.value?.toFixed(2)}`
        }
    ];

    const filters = useMemo(() => {
        if (showInStock === null) return {};
        return {
            unitsInStock: showInStock ? { gt: 0 } : { eq: 0 }
        };
    }, [showInStock]);

    const toolbarItems = (
        <div style={{ marginRight: '16px' }}>
            <select 
                value={showInStock === null ? '' : showInStock.toString()} 
                onChange={(e) => {
                    const val = e.target.value;
                    setShowInStock(val === '' ? null : val === 'true');
                }}
                style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                }}
            >
                <option value="">All Products</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
            </select>
        </div>
    );

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ height: '100vh', display: 'flex' }}>
            <DataGrid<Product>
                title="Products"
                noun="Product"
                repository={products}
                columnDefs={columnDefs}
                getRowId={(product) => product.productId.toString()}
                gridOptions={{
                    alwaysShowVerticalScroll: true,
                }}
                supportDelete={true}
                supportInsert={true}
                supportRegularDownload={true}
                tick={tick}
                filters={filters}
                toolbarItems={toolbarItems}
                styles={{
                    badge: {
                        backgroundColor: '#007bff',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '4px 12px'
                    }
                }}
            />
        </div>
    );
}

export default App; 
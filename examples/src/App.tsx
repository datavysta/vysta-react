import React, { useEffect, useState, useCallback, useRef } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductGrid } from './components/ProductGrid';
import { CustomerGrid } from './components/CustomerGrid';
import { OrderGrid } from './components/OrderGrid';
import { FilterExample } from './components/FilterExample';
import { LazyLoadListExample } from './components/LazyLoadListExample';
import { MantineProvider } from '@mantine/core';

type View = 'products' | 'customers' | 'orders' | 'filter' | 'lazyloadlist';

function App() {
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [view, setView] = useState<View>('products');
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
            console.error('Login error:', err);
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
            } catch (err) {
                console.error('Init auth error:', err);
                await login();
            }
        }
        initAuth();
    }, [login]);

    const showProducts = useCallback(() => setView('products'), []);
    const showCustomers = useCallback(() => setView('customers'), []);
    const showOrders = useCallback(() => setView('orders'), []);
    const showFilter = useCallback(() => setView('filter'), []);
    const showLazyLoadList = useCallback(() => setView('lazyloadlist'), []);

    const content = isAuthenticated ? (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {view === 'products' && (
                <ProductGrid 
                    client={clientRef.current} 
                    onShowCustomers={showCustomers}
                    onShowOrders={showOrders}
                    onShowFilter={showFilter}
                    onShowLazyLoadList={showLazyLoadList}
                    tick={tick}
                />
            )}
            {view === 'customers' && (
                <CustomerGrid 
                    client={clientRef.current} 
                    onShowProducts={showProducts}
                    onShowOrders={showOrders}
                    onShowFilter={showFilter}
                    onShowLazyLoadList={showLazyLoadList}
                    tick={tick}
                />
            )}
            {view === 'orders' && (
                <OrderGrid 
                    client={clientRef.current}
                    onShowProducts={showProducts}
                    onShowCustomers={showCustomers}
                    onShowFilter={showFilter}
                    onShowLazyLoadList={showLazyLoadList}
                    tick={tick}
                />
            )}
            {view === 'filter' && (
                <FilterExample 
                    client={clientRef.current}
                    onShowProducts={showProducts}
                    onShowCustomers={showCustomers}
                    onShowOrders={showOrders}
                    onShowLazyLoadList={showLazyLoadList}
                    tick={tick}
                />
            )}
            {view === 'lazyloadlist' && (
                <LazyLoadListExample 
                    client={clientRef.current}
                    onShowProducts={showProducts}
                    onShowCustomers={showCustomers}
                    onShowOrders={showOrders}
                    onShowFilter={showFilter}
                    tick={tick}
                />
            )}
        </div>
    ) : (
        <div style={{ padding: '20px' }}>
            <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
            <button onClick={login}>Retry Login</button>
        </div>
    );

    return (
        <MantineProvider>
            {content}
        </MantineProvider>
    );
}

export default App; 
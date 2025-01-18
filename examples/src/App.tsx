import React, { useEffect, useState, useCallback, useRef } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductGrid } from './components/ProductGrid';
import { CustomerGrid } from './components/CustomerGrid';
import { OrderGrid } from './components/OrderGrid';
import { FilterExample } from './components/FilterExample';

type View = 'products' | 'customers' | 'orders' | 'filter';

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

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    const showProducts = useCallback(() => setView('products'), []);
    const showCustomers = useCallback(() => setView('customers'), []);
    const showOrders = useCallback(() => setView('orders'), []);
    const showFilter = useCallback(() => setView('filter'), []);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {view === 'products' && (
                <ProductGrid 
                    client={clientRef.current} 
                    onShowCustomers={showCustomers}
                    onShowOrders={showOrders}
                    onShowFilter={showFilter}
                    tick={tick}
                />
            )}
            {view === 'customers' && (
                <CustomerGrid 
                    client={clientRef.current} 
                    onShowProducts={showProducts}
                    onShowOrders={showOrders}
                    onShowFilter={showFilter}
                    tick={tick}
                />
            )}
            {view === 'orders' && (
                <OrderGrid 
                    client={clientRef.current}
                    onShowProducts={showProducts}
                    onShowCustomers={showCustomers}
                    onShowFilter={showFilter}
                    tick={tick}
                />
            )}
            {view === 'filter' && (
                <FilterExample 
                    client={clientRef.current}
                    onShowProducts={showProducts}
                    onShowCustomers={showCustomers}
                    onShowOrders={showOrders}
                    tick={tick}
                />
            )}
        </div>
    );
}

export default App; 
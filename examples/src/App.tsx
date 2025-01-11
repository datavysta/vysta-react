import React, { useEffect, useState, useCallback, useRef } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductGrid } from './components/ProductGrid';
import { CustomerGrid } from './components/CustomerGrid';

function App() {
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [showCustomers, setShowCustomers] = useState(false);
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

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {showCustomers ? (
                <CustomerGrid 
                    client={clientRef.current} 
                    onShowProducts={() => setShowCustomers(false)} 
                />
            ) : (
                <ProductGrid 
                    client={clientRef.current} 
                    onShowCustomers={() => setShowCustomers(true)} 
                />
            )}
        </div>
    );
}

export default App; 
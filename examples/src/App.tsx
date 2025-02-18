import React, { useEffect, useState, useCallback, useRef } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { MantineProvider } from '@mantine/core';
import { PageController, PageView } from './components/PageController';

function App() {
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [currentView, setCurrentView] = useState<PageView>('products');
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

    const content = isAuthenticated ? (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <PageController 
                client={clientRef.current}
                currentView={currentView}
                onViewChange={setCurrentView}
                tick={tick}
            />
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
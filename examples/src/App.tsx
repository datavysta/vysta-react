import React, { useEffect, useState, useCallback } from 'react';
import { MantineProvider } from '@mantine/core';
import { PageController, PageView } from './components/PageController';
import { ServicesProvider } from './components/ServicesProvider';
import { VystaConfig } from '@datavysta/vysta-client';
import { VystaServiceProvider, useVystaServices } from '../../src';

const config: VystaConfig = {
    baseUrl: 'http://localhost:8080',
    debug: true,
};

function AppContent() {
    const { authService } = useVystaServices();
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<PageView>('products');

    // Authentication logic using auth service from context
    const login = useCallback(async () => {
        try {
            await authService.login('test@datavysta.com', 'password');
            setError(null);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to login. Please check your credentials and server status.');
            setIsAuthenticated(false);
            return false;
        }
    }, [authService]);

    // Render providers and app content
    return (
        <>
            {isAuthenticated ? (
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <PageController
                        currentView={currentView}
                        onViewChange={setCurrentView}
                        tick={tick}
                    />
                </div>
            ) : (
                <div style={{ padding: '20px' }}>
                    <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
                    <button onClick={login}>Login</button>
                </div>
            )}
        </>
    );
}

function App() {
    return (
        <MantineProvider>
            <VystaServiceProvider config={config}>
                {(client) => (
                    <ServicesProvider client={client}>
                        <AppContent />
                    </ServicesProvider>
                )}
            </VystaServiceProvider>
        </MantineProvider>
    );
}

export default App; 
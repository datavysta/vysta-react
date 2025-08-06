import { useState, useCallback } from 'react';
import { MantineProvider } from '@mantine/core';
import { PageController, PageView } from './components/PageController';
import { ServicesProvider } from './components/ServicesProvider';
import { VystaConfig } from '@datavysta/vysta-client';
import { VystaServiceProvider, useVystaServices } from '@datavysta/vysta-react';

const config: VystaConfig = {
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
    debug: true,
    cache: { enabled: true }
};

function AppContent() {
    const { auth } = useVystaServices();
    const [error, setError] = useState<string | null>(null);
    const [tick, ] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<PageView>('products');

    // Authentication logic using auth object from context
    const login = useCallback(async () => {
        try {
            await auth.login('test@datavysta.com', 'password');
            setError(null);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to login. Please check your credentials and server status.');
            setIsAuthenticated(false);
            return false;
        }
    }, [auth]);

    const logout = useCallback(async () => {
        try {
            await auth.logout();
            setIsAuthenticated(false);
        } catch {
            setError('Failed to logout.');
        }
    }, [auth]);

    // Render providers and app content
    return (
        <>
            {isAuthenticated ? (
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '10px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                        <button onClick={logout}>Logout</button>
                    </div>
                    <PageController
                        currentView={currentView}
                        onViewChange={setCurrentView}
                        tick={tick}
                    />
                </div>
            ) : (
                <div style={{ padding: '20px' }}>
                    <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
                    <button onClick={login} style={{ marginRight: '10px' }}>Login</button>
                    <button onClick={logout}>Logout</button>
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
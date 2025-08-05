import { useState, useCallback } from 'react';
import { DataGrid, LazyLoadList } from '@datavysta/vysta-react';
import { useServices } from './ServicesProvider';
import { ProductService } from '../services/ProductService';
import { ColDef } from 'ag-grid-community';
import { Product } from '../types/Product';
import { Button, Group, Text, Paper, Stack, Badge, Table } from '@mantine/core';
import { IReadonlyDataService, DataResult, QueryParams } from '@datavysta/vysta-client';

interface LoadTimeEntry {
    id: string;
    component: 'grid' | 'list';
    operation: string;
    timestamp: Date;
    duration: number;
    cached: boolean;
}

// Performance tracking wrapper service
class PerformanceTrackingService<T> implements IReadonlyDataService<T, T> {
    constructor(
        private service: IReadonlyDataService<T, T>,
        private onLoadTime: (entry: Omit<LoadTimeEntry, 'id' | 'timestamp'>) => void,
        private component: 'grid' | 'list'
    ) {}

    get primaryKey() {
        return (this.service as unknown as Record<string, unknown>).primaryKey;
    }

    async getAll(params: QueryParams<T> = {}): Promise<DataResult<T>> {
        const start = performance.now();
        try {
            const result = await this.service.getAll(params);
            const duration = performance.now() - start;
            
            this.onLoadTime({
                component: this.component,
                operation: `getAll (${params.limit || 'default'} records)`,
                duration,
                cached: params.useCache === true
            });
            
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.onLoadTime({
                component: this.component,
                operation: `getAll (${params.limit || 'default'} records) - ERROR`,
                duration,
                cached: params.useCache === true
            });
            throw error;
        }
    }

    async query(params: QueryParams<T> = {}): Promise<DataResult<T>> {
        const start = performance.now();
        try {
            const result = await this.service.query(params);
            const duration = performance.now() - start;
            
            this.onLoadTime({
                component: this.component,
                operation: `query (${params.limit || 'default'} records)`,
                duration,
                cached: params.useCache === true
            });
            
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.onLoadTime({
                component: this.component,
                operation: `query (${params.limit || 'default'} records) - ERROR`,
                duration,
                cached: params.useCache === true
            });
            throw error;
        }
    }

    async download(params: QueryParams<T> = {}, fileType?: any): Promise<Blob> {
        return this.service.download(params, fileType);
    }
}

interface CachingTestExampleProps {
    tick: number;
    onViewChange: (view: any) => void;
}

export function CachingTestExample({ tick }: CachingTestExampleProps) {
    const { client } = useServices();
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [gridCacheEnabled, setGridCacheEnabled] = useState(false);
    const [listCacheEnabled, setListCacheEnabled] = useState(false);
    const [loadTimes, setLoadTimes] = useState<LoadTimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const baseProductService = new ProductService(client);

    const addLoadTime = useCallback((entry: Omit<LoadTimeEntry, 'id' | 'timestamp'>) => {
        const newEntry: LoadTimeEntry = {
            ...entry,
            id: Date.now().toString(),
            timestamp: new Date()
        };
        setLoadTimes(prev => [newEntry, ...prev.slice(0, 19)]); // Keep last 20 entries
    }, []);

    // Create performance tracking services
    const gridProductService = new PerformanceTrackingService(
        baseProductService,
        addLoadTime,
        'grid'
    );

    const listProductService = new PerformanceTrackingService(
        baseProductService,
        addLoadTime,
        'list'
    );

    const columnDefs: ColDef<Product>[] = [
        { field: 'productId', headerName: 'ID', width: 80 },
        { field: 'productName', headerName: 'Product Name', flex: 1 },
        { field: 'unitPrice', headerName: 'Price', width: 100, type: 'numericColumn' },
        { field: 'unitsInStock', headerName: 'Stock', width: 100, type: 'numericColumn' },
        { field: 'quantityPerUnit', headerName: 'Quantity Per Unit', width: 150 },
        { field: 'discontinued', headerName: 'Discontinued', width: 120, type: 'boolean' }
    ];

    const handleRefresh = useCallback(async () => {
        setIsLoading(true);
        
        // Test grid load time
        const gridStart = performance.now();
        try {
            await gridProductService.getAll({ 
                limit: 25, 
                useCache: gridCacheEnabled,
                select: ['productId', 'productName', 'unitPrice', 'unitsInStock', 'quantityPerUnit', 'discontinued']
            });
            const gridDuration = performance.now() - gridStart;
            addLoadTime({
                component: 'grid',
                operation: 'Manual Test (25 records)',
                duration: gridDuration,
                cached: gridCacheEnabled
            });
        } catch (error) {
            console.error('Grid load failed:', error);
        }

        // Test list load time
        const listStart = performance.now();
        try {
            await listProductService.getAll({ 
                limit: 10, 
                useCache: listCacheEnabled,
                select: ['productId', 'productName', 'unitPrice', 'unitsInStock', 'quantityPerUnit', 'discontinued']
            });
            const listDuration = performance.now() - listStart;
            addLoadTime({
                component: 'list',
                operation: 'Manual Test (10 records)',
                duration: listDuration,
                cached: listCacheEnabled
            });
        } catch (error) {
            console.error('List load failed:', error);
        }

        setIsLoading(false);
    }, [gridProductService, listProductService, gridCacheEnabled, listCacheEnabled, addLoadTime]);

    const handleGridDataLoaded = useCallback((gridApi: any, data: Product[]) => {
        // This will be called by DataGrid when data is loaded
        // The performance tracking is now handled by the wrapper service
    }, []);

    const clearCache = useCallback(async () => {
        try {
            await client.clearCache();
            console.log('Cache cleared successfully');
            addLoadTime({
                component: 'grid',
                operation: 'clearCache',
                duration: 0,
                cached: false
            });
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }, [client, addLoadTime]);

    const clearLoadTimes = useCallback(() => {
        setLoadTimes([]);
    }, []);

    const getAverageLoadTime = (component: 'grid' | 'list', cached: boolean) => {
        const relevant = loadTimes.filter(lt => 
            lt.component === component && lt.cached === cached && lt.operation.includes('getAll')
        );
        if (relevant.length === 0) return null;
        const avg = relevant.reduce((sum, lt) => sum + lt.duration, 0) / relevant.length;
        return avg;
    };

    const gridAvgCached = getAverageLoadTime('grid', true);
    const gridAvgUncached = getAverageLoadTime('grid', false);

    return (
        <div style={{ padding: '20px' }}>
            <Stack gap="lg">
                <Paper p="md" withBorder>
                    <Stack gap="sm">
                        <Text size="xl" fw={600}>Caching Test Example</Text>
                        <Text size="sm" c="dimmed">
                            This example demonstrates the useCache prop functionality. 
                            Enable caching to see faster subsequent loads.
                        </Text>
                        
                        <Group>
                            <Button 
                                onClick={handleRefresh} 
                                variant="outline"
                                loading={isLoading}
                            >
                                Test Load Times (Tick: {tick})
                            </Button>
                            <Button onClick={clearCache} variant="outline" color="red">
                                Clear Cache
                            </Button>
                            <Button onClick={clearLoadTimes} variant="outline" color="gray">
                                Clear Load Times
                            </Button>
                            
                            <div style={{ borderLeft: '1px solid #e0e0e0', height: '20px', margin: '0 10px' }} />
                            
                            <Button 
                                variant={gridCacheEnabled ? "filled" : "outline"}
                                color={gridCacheEnabled ? "green" : "gray"}
                                onClick={() => setGridCacheEnabled(!gridCacheEnabled)}
                            >
                                Grid Caching {gridCacheEnabled ? "ON" : "OFF"}
                            </Button>
                            <Button 
                                variant={listCacheEnabled ? "filled" : "outline"}
                                color={listCacheEnabled ? "green" : "gray"}
                                onClick={() => setListCacheEnabled(!listCacheEnabled)}
                            >
                                List Caching {listCacheEnabled ? "ON" : "OFF"}
                            </Button>
                        </Group>

                        <Group>
                            {gridAvgUncached && (
                                <Badge color="blue">
                                    Grid Uncached: {gridAvgUncached.toFixed(0)}ms avg
                                </Badge>
                            )}
                            {gridAvgCached && (
                                <Badge color="green">
                                    Grid Cached: {gridAvgCached.toFixed(0)}ms avg
                                </Badge>
                            )}
                        </Group>
                    </Stack>
                </Paper>

                <Group grow align="flex-start">
                    <Paper p="md" withBorder style={{ flex: 1 }}>
                        <Stack gap="sm">
                            <Text fw={500}>DataGrid with Caching</Text>
                            <div style={{ height: '300px' }}>
                                <DataGrid<Product>
                                    title="Products Grid"
                                    noun="Product"
                                    repository={gridProductService}
                                    columnDefs={columnDefs}
                                    getRowId={(product) => product.productId.toString()}
                                    tick={tick}
                                    useCache={gridCacheEnabled}
                                    onDataLoaded={handleGridDataLoaded}
                                    gridOptions={{
                                        cacheBlockSize: 25,
                                        paginationPageSize: 25,
                                        domLayout: 'normal'
                                    }}
                                />
                            </div>
                        </Stack>
                    </Paper>

                    <Paper p="md" withBorder style={{ flex: 1 }}>
                        <Stack gap="sm">
                            <Text fw={500}>LazyLoadList with Caching</Text>
                            <LazyLoadList<Product>
                                repository={listProductService}
                                value={selectedProduct}
                                onChange={setSelectedProduct}
                                label="Select a product"
                                displayColumn="productName"
                                pageSize={10}
                                tick={tick}
                                useCache={listCacheEnabled}
                                searchable={true}
                                clearable={true}
                            />
                            {selectedProduct && (
                                <Text size="sm">
                                    Selected: {selectedProduct}
                                </Text>
                            )}
                        </Stack>
                    </Paper>
                </Group>

                <Paper p="md" withBorder>
                    <Stack gap="sm">
                        <Text fw={500}>Load Time History</Text>
                        {loadTimes.length > 0 ? (
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Time</Table.Th>
                                        <Table.Th>Component</Table.Th>
                                        <Table.Th>Operation</Table.Th>
                                        <Table.Th>Duration</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {loadTimes.map((entry) => (
                                        <Table.Tr key={entry.id}>
                                            <Table.Td>
                                                {entry.timestamp.toLocaleTimeString()}
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge 
                                                    color={entry.component === 'grid' ? 'blue' : 'green'}
                                                    size="sm"
                                                >
                                                    {entry.component}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>{entry.operation}</Table.Td>
                                            <Table.Td>
                                                <Text 
                                                    fw={entry.duration < 100 ? 'bold' : 'normal'}
                                                    c={entry.duration < 100 ? 'green' : entry.duration < 500 ? 'yellow' : 'red'}
                                                >
                                                    {entry.duration.toFixed(0)}ms
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge 
                                                    color={entry.cached ? 'green' : 'gray'}
                                                    size="sm"
                                                >
                                                    {entry.cached ? 'Cached' : 'Uncached'}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        ) : (
                            <Text size="sm" c="dimmed">
                                No load times recorded yet. Interact with the components or click "Test Load Times" to start measuring.
                            </Text>
                        )}
                    </Stack>
                </Paper>

                <Paper p="md" withBorder>
                    <Stack gap="sm">
                        <Text fw={500}>Instructions</Text>
                        <Text size="sm">
                            1. Toggle caching switches to enable/disable caching for each component
                            <br />
                            2. Interact with the DataGrid or LazyLoadList to see automatic load time tracking
                            <br />
                            3. Click &#34;Test Load Times&#34; to perform manual performance tests
                            <br />
                            4. With caching enabled, subsequent loads should be significantly faster
                            <br />
                            5. Click &#34;Clear Cache&#34; to clear all cached data and see the difference
                            <br />
                            6. Watch the load time history table to see detailed performance metrics
                            <br />
                            7. Green badges indicate cached operations, gray badges indicate uncached operations
                            <br />
                            8. Load times are color-coded: green (&lt;100ms), yellow (100-500ms), red (&gt;500ms)
                        </Text>
                    </Stack>
                </Paper>
            </Stack>
        </div>
    );
} 
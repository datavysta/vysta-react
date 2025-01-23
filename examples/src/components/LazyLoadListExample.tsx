import React, { useMemo, useState } from 'react';
import { LazyLoadList } from '../../../src/components/LazyLoadList/LazyLoadList';
import { VystaClient } from '@datavysta/vysta-client';
import { ExampleToolbar } from './ExampleToolbar';
import { ProductService } from '../services/ProductService';
import { CustomerService } from '../services/CustomerService';
import { OrderService } from '../services/OrderService';
import { Product } from '../types/Product';
import { Customer } from '../types/Customer';
import { Order } from '../types/Order';
import { Stack } from '@mantine/core';

interface LazyLoadListExampleProps {
    client: VystaClient;
    onShowProducts: () => void;
    onShowCustomers: () => void;
    onShowOrders: () => void;
    onShowFilter: () => void;
    tick: number;
}

export function LazyLoadListExample({
    client,
    onShowProducts,
    onShowCustomers,
    onShowOrders,
    onShowFilter,
    tick
}: LazyLoadListExampleProps) {
    const [selectedProductId, setSelectedProductId] = useState<string | null>("28");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    
    const productService = useMemo(() => new ProductService(client), [client]);
    const customerService = useMemo(() => new CustomerService(client), [client]);
    const orderService = useMemo(() => new OrderService(client), [client]);

    return (
        <div>
            <ExampleToolbar
                currentView="lazyloadlist"
                onShowProducts={onShowProducts}
                onShowCustomers={onShowCustomers}
                onShowOrders={onShowOrders}
                onShowFilter={onShowFilter}
                onShowLazyLoadList={() => {}}
            />
            
            <div style={{ maxWidth: '400px', padding: '20px' }}>
                <h2>LazyLoadList Example</h2>
                <Stack gap="md">
                    <div>
                        <p>Select a product:</p>
                        <LazyLoadList<Product>
                            repository={productService}
                            value={selectedProductId}
                            onChange={setSelectedProductId}
                            label="Select Product"
                            displayColumn="productName"
                            primaryKey="productId"
                        />
                        {selectedProductId && (
                            <p style={{ marginTop: '10px' }}>Selected Product ID: {selectedProductId}</p>
                        )}
                    </div>

                    <div>
                        <p>Select a customer:</p>
                        <LazyLoadList<Customer>
                            repository={customerService}
                            value={selectedCustomerId}
                            onChange={setSelectedCustomerId}
                            label="Select Customer"
                            displayColumn="companyName"
                            primaryKey="customerId"
                        />
                        {selectedCustomerId && (
                            <p style={{ marginTop: '10px' }}>Selected Customer ID: {selectedCustomerId}</p>
                        )}
                    </div>

                    <div>
                        <p>Select an order:</p>
                        <LazyLoadList<Order>
                            repository={orderService}
                            value={selectedOrderId}
                            onChange={setSelectedOrderId}
                            label="Select Order"
                            displayColumn="orderId"
                            primaryKey="orderId"
                            filters={selectedCustomerId ? { customerId: { eq: selectedCustomerId } } : undefined}
                        />
                        {selectedOrderId && (
                            <p style={{ marginTop: '10px' }}>Selected Order ID: {selectedOrderId}</p>
                        )}
                    </div>
                </Stack>
            </div>
        </div>
    );
} 
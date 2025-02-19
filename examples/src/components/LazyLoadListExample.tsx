import React, { useMemo, useState } from 'react';
import { LazyLoadList } from '../../../src/components/LazyLoadList/LazyLoadList';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductService } from '../services/ProductService';
import { CustomerService } from '../services/CustomerService';
import { OrderService } from '../services/OrderService';
import { Product } from '../types/Product';
import { Customer } from '../types/Customer';
import { Order } from '../types/Order';
import { Stack } from '@mantine/core';

interface LazyLoadListExampleProps {
    client: VystaClient;
    tick: number;
}

export function LazyLoadListExample({
    client,
    tick
}: LazyLoadListExampleProps) {
    const [selectedProductId, setSelectedProductId] = useState<string | null>("1");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedProductId2, setSelectedProductId2] = useState<string | null>("1");
    
    const productService = useMemo(() => new ProductService(client), [client]);
    const customerService = useMemo(() => new CustomerService(client), [client]);
    const orderService = useMemo(() => new OrderService(client), [client]);

    return (
        <div>
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
                            clearable
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
                            filters={selectedCustomerId ? { customerId: { eq: selectedCustomerId } } : undefined}
                        />
                        {selectedOrderId && (
                            <p style={{ marginTop: '10px' }}>Selected Order ID: {selectedOrderId}</p>
                        )}
                    </div>

                    <div>
                        <p>Select a product by ID:</p>
                        <LazyLoadList<Product>
                            repository={productService}
                            value={selectedProductId2}
                            onChange={setSelectedProductId2}
                            label="Select Product ID"
                            displayColumn="productId"
                        />
                        {selectedProductId2 && (
                            <p style={{ marginTop: '10px' }}>Selected Product ID: {selectedProductId2}</p>
                        )}
                        <button 
                            onClick={() => setSelectedProductId2("2")}
                            style={{ marginTop: '10px' }}
                        >
                            Set to ID 2
                        </button>
                    </div>
                </Stack>
            </div>
        </div>
    );
} 
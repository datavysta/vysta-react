import React from 'react';

interface ExampleToolbarProps {
    onShowProducts: () => void;
    onShowCustomers: () => void;
    onShowOrders: () => void;
    onShowFilter: () => void;
    currentView: 'products' | 'customers' | 'orders' | 'filter';
}

export function ExampleToolbar({ 
    onShowProducts, 
    onShowCustomers, 
    onShowOrders, 
    onShowFilter,
    currentView 
}: ExampleToolbarProps) {
    return (
        <div className="example-toolbar">
            <button 
                onClick={onShowProducts}
                disabled={currentView === 'products'}
            >
                Products
            </button>
            <button 
                onClick={onShowCustomers}
                disabled={currentView === 'customers'}
            >
                Customers
            </button>
            <button 
                onClick={onShowOrders}
                disabled={currentView === 'orders'}
            >
                Orders
            </button>
            <button 
                onClick={onShowFilter}
                disabled={currentView === 'filter'}
            >
                Filter Example
            </button>
        </div>
    );
} 
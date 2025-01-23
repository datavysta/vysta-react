import React from 'react';

interface ExampleToolbarProps {
    onShowProducts: () => void;
    onShowCustomers: () => void;
    onShowOrders: () => void;
    onShowFilter: () => void;
    onShowLazyLoadList: () => void;
    currentView: 'products' | 'customers' | 'orders' | 'filter' | 'lazyloadlist';
}

export function ExampleToolbar({ 
    onShowProducts, 
    onShowCustomers, 
    onShowOrders, 
    onShowFilter,
    onShowLazyLoadList,
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
            <button 
                onClick={onShowLazyLoadList}
                disabled={currentView === 'lazyloadlist'}
            >
                Lazy Load List
            </button>
        </div>
    );
} 
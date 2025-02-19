import React from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductGrid } from './ProductGrid';
import { CustomerGrid } from './CustomerGrid';
import { OrderGrid } from './OrderGrid';
import { FilterExample } from './FilterExample';
import { LazyLoadListExample } from './LazyLoadListExample';
import { EditableGridExample } from './EditableGridExample';
import './PageController.css';

export type PageView = 'products' | 'customers' | 'orders' | 'filter' | 'lazyloadlist' | 'editablegrid';

interface PageControllerProps {
    client: VystaClient;
    currentView: PageView;
    onViewChange: (view: PageView) => void;
    tick: number;
}

function Navigation({ currentView, onViewChange }: { currentView: PageView; onViewChange: (view: PageView) => void }) {
    return (
        <div className="example-toolbar">
            <button 
                onClick={() => onViewChange('products')}
                disabled={currentView === 'products'}
            >
                Products
            </button>
            <button 
                onClick={() => onViewChange('customers')}
                disabled={currentView === 'customers'}
            >
                Customers
            </button>
            <button 
                onClick={() => onViewChange('orders')}
                disabled={currentView === 'orders'}
            >
                Orders
            </button>
            <button 
                onClick={() => onViewChange('filter')}
                disabled={currentView === 'filter'}
            >
                Filter Example
            </button>
            <button 
                onClick={() => onViewChange('lazyloadlist')}
                disabled={currentView === 'lazyloadlist'}
            >
                Lazy Load List
            </button>
            <button 
                onClick={() => onViewChange('editablegrid')}
                disabled={currentView === 'editablegrid'}
            >
                Editable Grid
            </button>
        </div>
    );
}

export function PageController({ client, currentView, onViewChange, tick }: PageControllerProps) {
    const commonProps = {
        client,
        tick
    };

    return (
        <div className="page-container">
            <Navigation currentView={currentView} onViewChange={onViewChange} />
            <div className="page-content">
                {(() => {
                    switch (currentView) {
                        case 'products':
                            return <ProductGrid {...commonProps} />;
                        case 'customers':
                            return <CustomerGrid {...commonProps} />;
                        case 'orders':
                            return <OrderGrid {...commonProps} />;
                        case 'filter':
                            return <FilterExample {...commonProps} />;
                        case 'lazyloadlist':
                            return <LazyLoadListExample {...commonProps} />;
                        case 'editablegrid':
                            return <EditableGridExample {...commonProps} />;
                        default:
                            return null;
                    }
                })()}
            </div>
        </div>
    );
} 
import { ProductGrid } from './ProductGrid';
import { CustomerGrid } from './CustomerGrid';
import { OrderGrid } from './OrderGrid';
import { FilterExample } from './FilterExample';
import { LazyLoadListExample } from './LazyLoadListExample';
import { EditableGridExample } from './EditableGridExample';
import { EditableGridWithGroupsExample } from './EditableGridWithGroupsExample';
import { FileUploadExample } from './FileUploadExample';
import { ExampleUserProfile } from './ExampleUserProfile';
import { TimezoneSelectorExample } from './TimezoneSelectorExample';
import { CachingTestExample } from './CachingTestExample';
import './PageController.css';

export type PageView = 'products' | 'customers' | 'orders' | 'filter' | 'lazyloadlist' | 'editablegrid' | 'editablegridgroups' | 'fileupload' | 'userprofile' | 'timezone' | 'cachingtest';

interface PageControllerProps {
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
            <button
                onClick={() => onViewChange('editablegridgroups')}
                disabled={currentView === 'editablegridgroups'}
            >
                Editable Grid Groups
            </button>
            <button 
                onClick={() => onViewChange('fileupload')}
                disabled={currentView === 'fileupload'}
            >
                File Upload
            </button>
            <button 
                onClick={() => onViewChange('userprofile')}
                disabled={currentView === 'userprofile'}
            >
                User Profile Example
            </button>
            <button 
                onClick={() => onViewChange('timezone')}
                disabled={currentView === 'timezone'}
            >
                Timezone Selector
            </button>
            <button 
                onClick={() => onViewChange('cachingtest')}
                disabled={currentView === 'cachingtest'}
            >
                Caching Test
            </button>
        </div>
    );
}

export function PageController({ currentView, onViewChange, tick }: PageControllerProps) {
    const commonProps = {
        tick,
        onViewChange
    };

    return (
        <div className="page-container">
            <Navigation currentView={currentView} onViewChange={onViewChange} />
            <div className="page-content">
                {(() => {
                    switch (currentView) {
                        case 'products':
                            return <ProductGrid />;
                        case 'customers':
                            return <CustomerGrid {...commonProps} />;
                        case 'orders':
                            return <OrderGrid />;
                        case 'filter':
                            return <FilterExample />;
                        case 'lazyloadlist':
                            return <LazyLoadListExample />;
                        case 'editablegrid':
                            return <EditableGridExample {...commonProps} />;
                        case 'editablegridgroups':
                            return <EditableGridWithGroupsExample {...commonProps} />;
                        case 'fileupload':
                            return <FileUploadExample />;
                        case 'userprofile':
                            return <ExampleUserProfile />;
                        case 'timezone':
                            return <TimezoneSelectorExample />;
                        case 'cachingtest':
                            return <CachingTestExample {...commonProps} />;
                        default:
                            return null;
                    }
                })()}
            </div>
        </div>
    );
}  
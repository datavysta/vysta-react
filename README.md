# @datavysta/vysta-react

React components for Vysta - a backend as a service platform.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication & Services](#authentication--services)
- [Component Usage](#component-usage)
  - [DataGrid](#datagrid)
  - [FilterPanel](#filterpanel)
  - [LazyLoadList](#lazyloadlist)
  - [FileUpload](#fileupload)
- [Advanced Features](#advanced-features)
  - [Editable Fields](#editable-fields)
  - [Component Integration](#component-integration)
  - [Aggregate Summary Rows](#aggregate-summary-rows)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [TypeScript Reference](#typescript-reference)

## Installation

```bash
npm install @datavysta/vysta-react @datavysta/vysta-client ag-grid-community ag-grid-react
```

For Mantine UI integration (recommended):

```bash
npm install @mantine/core @mantine/hooks @mantine/dates
```

## Quick Start

### 1. Import the styles

```tsx
// Import Vysta styles
import '@datavysta/vysta-react/style.css';

// If using Mantine (recommended)
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
```

### 2. Set up the service provider

```tsx
import { MantineProvider } from '@mantine/core';
import { VystaServiceProvider } from '@datavysta/vysta-react';
import { VystaConfig } from '@datavysta/vysta-client';

// Configure your Vysta client
const config: VystaConfig = {
  baseUrl: 'http://localhost:8080', // Your API endpoint
  debug: true, // Optional: enable debug logging
};

function App() {
  return (
    <MantineProvider>
      <VystaServiceProvider config={config} apps={["YourAppName"]}>
        {(client) => (
          <YourAppContent client={client} />
        )}
      </VystaServiceProvider>
    </MantineProvider>
  );
}
```

### 3. Create your data services

```tsx
import { VystaClient, VystaService } from '@datavysta/vysta-client';

// Define your entity type
interface Product {
  productId: number;
  productName: string;
  unitPrice: number;
  unitsInStock: number;
  discontinued: boolean;
}

// Create your service
export class ProductService extends VystaService<Product> {
  constructor(client: VystaClient) {
    super(client, 'YourAppName', 'Products', {
      primaryKey: 'productId'
    });
  }
}
```

### 4. Use components in your app

```tsx
import { DataGrid } from '@datavysta/vysta-react';
import { useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { ProductService } from './services/ProductService';

// In your React component
function ProductList({ client }) {
  // Create service instance
  const productService = useMemo(() => {
    return new ProductService(client);
  }, [client]);

  // Define grid columns
  const columnDefs = useMemo<ColDef<Product>[]>(() => [
    { field: 'productId', headerName: 'ID', width: 100 },
    { field: 'productName', headerName: 'Name', flex: 1 },
    { field: 'unitPrice', headerName: 'Price', 
      valueFormatter: ({ value }) => value && `$${Number(value).toFixed(2)}` },
    { field: 'unitsInStock', headerName: 'Stock' },
    { field: 'discontinued', headerName: 'Discontinued' }
  ], []);

  return (
    <DataGrid<Product>
      title="Products"
      noun="Product"
      repository={productService}
      columnDefs={columnDefs}
      getRowId={(product) => product.productId.toString()}
      supportRegularDownload={true}
    />
  );
}

## Authentication & Services

### VystaServiceProvider

The `VystaServiceProvider` is a core feature that provides the VystaClient instance and core Vysta services (roles, permissions, user profile, and authentication) to your app via React context.

#### Complete Setup Example

```tsx
import React, { useMemo } from 'react';
import { MantineProvider } from '@mantine/core';
import { VystaServiceProvider, useVystaServices } from '@datavysta/vysta-react';
import { VystaConfig } from '@datavysta/vysta-client';

// Configure your Vysta client
const config: VystaConfig = {
  baseUrl: 'http://localhost:8080',
  debug: true,
};

// Create service providers for your app
function ServicesProvider({ client, children }) {
  // Create your app-specific services
  const productService = useMemo(() => new ProductService(client), [client]);
  const customerService = useMemo(() => new CustomerService(client), [client]);
  const fileService = useMemo(() => new FileService(client), [client]);
  
  // Provide services to your app
  const value = useMemo(() => ({
    productService,
    customerService,
    fileService,
  }), [productService, customerService, fileService]);
  
  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

// Main app with authentication flow
function App() {
  return (
    <MantineProvider>
      <VystaServiceProvider config={config} apps={["YourAppName"]}>
        {(client) => (
          <ServicesProvider client={client}>
            <AppContent />
          </ServicesProvider>
        )}
      </VystaServiceProvider>
    </MantineProvider>
  );
}

// App content with authentication handling
function AppContent() {
  const { auth, isAuthenticated, profileLoading, profileError } = useVystaServices();
  const [error, setError] = useState<string | null>(null);
  
  // Login handler with error handling
  const login = useCallback(async () => {
    try {
      await auth.login('user@example.com', 'password');
      setError(null);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please check your credentials and server status.');
      return false;
    }
  }, [auth]);
  
  // Logout handler with error handling
  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch (err) {
      setError('Failed to logout.');
    }
  }, [auth]);
  
  // Render authenticated content or login form
  return (
    <>
      {isAuthenticated ? (
        <AuthenticatedContent />
      ) : (
        <div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {profileLoading ? (
            <div>Loading profile...</div>
          ) : (
            <button onClick={login}>Login</button>
          )}
        </div>
      )}
    </>
  );
}
```

### Available Context Values

The `useVystaServices` hook provides the following values:

| Value | Type | Description |
|-------|------|-------------|
| `roleService` | `VystaRoleService` | Service for role management |
| `permissionService` | `VystaPermissionService` | Service for permission management |
| `profile` | `UserProfile \| null` | The user's profile object (or null if not loaded) |
| `permissions` | `Record<string, ObjectPermission[]> \| null` | App/connection permissions |
| `canSelectConnection` | `(appName: string) => boolean` | Helper to check SELECT permission |
| `isAuthenticated` | `boolean` | True if a user profile is loaded |
| `profileLoading` | `boolean` | True while profile/permissions are loading |
| `profileError` | `unknown` | Any error from profile/permissions loading |
| `loginLoading` | `boolean` | True while login/logout is in progress |
| `loginError` | `unknown` | Any error from login/logout |
| `auth` | `AuthWrapper` | Authentication methods object |

### Authentication Methods

The `auth` object provides these methods:

```tsx
// Login with username/password
await auth.login(username, password);

// Logout the current user
await auth.logout();

// Get available sign-in methods
const signInMethods = await auth.getSignInMethods();

// Get authorization URL for OAuth provider
const authUrl = auth.getAuthorizeUrl(providerId);

// Exchange OAuth token
await auth.exchangeToken(token);
```

> **Best Practice:** Always use the context-based approach for authentication, user, and permissions state. Direct use of internal hooks is not supported in the public API.

## Component Usage

### DataGrid

The DataGrid component provides a powerful data grid with infinite scrolling, sorting, filtering, and editing capabilities.

#### Basic Usage

```tsx
import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { ColDef } from 'ag-grid-community';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function ProductGrid({ client }) {
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Define grid columns with formatting
  const columnDefs = useMemo<ColDef<Product>[]>(() => [
    { 
      field: 'productId', 
      headerName: 'ID', 
      width: 100,
      initialSort: 'asc'
    },
    { 
      field: 'productName', 
      headerName: 'Name',
      flex: 1
    },
    { 
      field: 'unitPrice', 
      headerName: 'Price',
      valueFormatter: ({ value }) => value && `$${Number(value).toFixed(2)}`
    },
    { 
      field: 'unitsInStock', 
      headerName: 'Stock'
    },
    { 
      field: 'discontinued', 
      headerName: 'Discontinued'
    }
  ], []);

  return (
    <DataGrid<Product>
      title="Products"
      noun="Product"
      repository={productService}
      columnDefs={columnDefs}
      getRowId={(product) => product.productId.toString()}
      supportRegularDownload={true}
      supportDelete={true}
      supportInsert={true}
    />
  );
}
```

#### Error Handling Example

```tsx
import React, { useMemo, useState } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { ColDef } from 'ag-grid-community';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function ProductGridWithErrorHandling({ client }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Define grid columns
  const columnDefs = useMemo<ColDef<Product>[]>(() => [
    // ... column definitions
  ], []);

  // Handle data loading errors
  const handleDataFirstLoaded = (gridApi) => {
    setError(null);
    console.log('Data loaded successfully');
  };

  // Custom loading component
  const LoadingComponent = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div>Loading products...</div>
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </div>
  );

  // Custom no rows component
  const NoRowsComponent = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div>No products found</div>
      <button onClick={() => gridApi.refreshInfiniteCache()}>Retry</button>
    </div>
  );

  return (
    <>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <DataGrid<Product>
        title="Products"
        noun="Product"
        repository={productService}
        columnDefs={columnDefs}
        getRowId={(product) => product.productId.toString()}
        onDataFirstLoaded={handleDataFirstLoaded}
        loadingComponent={LoadingComponent}
        noRowsComponent={NoRowsComponent}
      />
    </>
  );
}
```

#### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | The title displayed at the top of the grid |
| `noun` | `string` | The singular noun for your entity (used in button labels) |
| `repository` | `IDataService<T>` | The Vysta service instance for your entity |
| `columnDefs` | `ColDef<T>[]` | AG Grid column definitions |
| `getRowId` | `(data: T) => string` | Function to get a unique string ID from your entity |

#### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gridOptions` | `GridOptions<T>` | `undefined` | Additional AG Grid options |
| `supportRegularDownload` | `boolean` | `false` | Enable CSV download of grid data with current sorting and filtering |
| `supportInsert` | `boolean` | `false` | Show "New" button |
| `supportDelete` | `boolean` | `false` | Show delete button in each row |
| `deleteButton` | `(onDelete: () => void) => React.ReactNode` | `undefined` | Custom delete button renderer |
| `filters` | `{ [K in keyof T]?: any }` | `undefined` | Vysta filters to apply. Should be memoized to prevent unnecessary reloads |
| `wildcardSearch` | `string` | `undefined` | Text to use for wildcard search across fields (passed as `q` parameter) |
| `inputProperties` | `{ [key: string]: any }` | `undefined` | Additional properties to pass to data source. Should be memoized to prevent unnecessary reloads |
| `toolbarItems` | `React.ReactNode` | `undefined` | Custom toolbar items |
| `onDataFirstLoaded` | `(gridApi: GridApi<T>) => void` | `undefined` | Callback when data first loads or when filters/inputProperties change |
| `onDataLoaded` | `(gridApi: GridApi<T>, data: T[]) => void` | `undefined` | Callback when any data loads, including incremental loads |
| `getRowClass` | `(params: RowClassParams<T>) => string \| string[] \| undefined` | `undefined` | Custom row CSS classes |
| `tick` | `number` | `0` | Trigger grid refresh when incremented |
| `theme` | `Theme \| 'legacy'` | `undefined` | AG Grid theme configuration |
| `styles` | `DataGridStyles` | `{}` | Custom styles for grid elements |
| `noRowsComponent` | `React.ComponentType<any>` | `undefined` | Custom component to display when no rows are found |
| `loadingComponent` | `React.ComponentType<any>` | `undefined` | Custom component to display during loading |

#### Features

- 🔄 Infinite scrolling with server-side operations
- 📊 Sorting and filtering
- ✨ Customizable columns
- 🎨 Modern UI with great UX
- 💪 Fully typed with TypeScript

#### Styling

You can customize the appearance of individual grid elements using the `styles` prop:

```tsx
<DataGrid<Product>
  // ... other props ...
  styles={{
    container: { backgroundColor: '#f5f5f5' },
    title: { color: 'blue', fontSize: '1.2rem' },
    badge: { backgroundColor: 'red', color: 'white' },
    createButton: { backgroundColor: 'green' },
    // ... other style overrides
  }}
/>
```

Available style targets:
- `container`: The main grid container
- `toolbar`: The top toolbar section
- `titleSection`: The title and badge container
- `title`: The grid title text
- `badge`: The count badge
- `actions`: The actions container (buttons)
- `createButton`: The "New" button
- `downloadButton`: The download button
- `deleteButton`: The delete button in rows
- `grid`: The AG Grid container

#### Grid Customization

The grid uses AG Grid Community Edition under the hood. You can customize the grid behavior using the `gridOptions` prop:

```tsx
<DataGrid<Product>
  // ... required props ...
  gridOptions={{
    rowHeight: 48,
    headerHeight: 40,
    rowSelection: 'multiple',
    // ... any other AG Grid options
  }}
/>
```

#### Filtering Example

```tsx
// Example with memoized filters to prevent unnecessary reloads
function ProductList() {
  const [useFilter, setUseFilter] = useState(false);
  
  const filters = useMemo(
    () => useFilter ? { unitPrice: { gt: 20 } } : undefined,
    [useFilter]
  );

  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={useFilter} 
            onChange={(e) => setUseFilter(e.target.checked)} 
          />
          Show only products with price > $20
        </label>
      </div>
      <DataGrid<Product>
        // ... other props ...
        filters={filters}
      />
    </>
  );
}
```

### FilterPanel

The FilterPanel component provides a powerful and flexible filtering interface for your data with support for complex conditions, saved filters, and integration with DataGrid.

#### Basic Usage

```tsx
import React, { useState } from 'react';
import { FilterPanel } from '@datavysta/vysta-react';
import { DataType } from '@datavysta/vysta-react/components/Models/DataType';
import { FilterDefinitionsByField } from '@datavysta/vysta-react/components/Filter/FilterDefinitionsByField';
import { Condition } from '@datavysta/vysta-react/components/Models/Condition';

function ProductFilter() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  // Define filter fields with their data types
  const filterDefinitions: FilterDefinitionsByField = [
    {
      targetFieldName: "productName",
      label: "Product Name",
      dataType: DataType.String
    },
    {
      targetFieldName: "unitPrice",
      label: "Unit Price",
      dataType: DataType.Numeric
    },
    {
      targetFieldName: "unitsInStock",
      label: "Units In Stock",
      dataType: DataType.Numeric
    },
    {
      targetFieldName: "discontinued",
      label: "Discontinued",
      dataType: DataType.Boolean
    },
    {
      targetFieldName: "orderDate",
      label: "Order Date",
      dataType: DataType.Date
    }
  ];

  // Handle filter application
  const handleApplyFilter = (newConditions: Condition[]) => {
    setConditions(newConditions);
    console.log('Applied filter conditions:', newConditions);
    // You would typically use these conditions with a DataGrid or API call
  };

  return (
    <div>
      <button onClick={() => setIsFilterVisible(!isFilterVisible)}>
        {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
      </button>
      
      {isFilterVisible && (
        <FilterPanel 
          conditions={conditions}
          onApply={handleApplyFilter}
          onChange={(newConditions) => console.log('Filter changed:', newConditions)}
          filterDefinitions={filterDefinitions}
          allowSave={true}
          allowLoad={true}
        />
      )}
      
      {conditions.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Active Filters:</h4>
          <pre>{JSON.stringify(conditions, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

#### Integration with DataGrid

```tsx
import React, { useState, useMemo } from 'react';
import { DataGrid, FilterPanel } from '@datavysta/vysta-react';
import { DataType } from '@datavysta/vysta-react/components/Models/DataType';
import { FilterDefinitionsByField } from '@datavysta/vysta-react/components/Filter/FilterDefinitionsByField';
import { Condition } from '@datavysta/vysta-react/components/Models/Condition';
import { ColDef } from 'ag-grid-community';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';
import { conditionsToVystaFilter } from '@datavysta/vysta-react/utils/filterUtils';

function ProductFilterGrid({ client }) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Define grid columns
  const columnDefs = useMemo<ColDef<Product>[]>(() => [
    { field: 'productId', headerName: 'ID', width: 100 },
    { field: 'productName', headerName: 'Name', flex: 1 },
    { field: 'unitPrice', headerName: 'Price', 
      valueFormatter: ({ value }) => value && `$${Number(value).toFixed(2)}` },
    { field: 'unitsInStock', headerName: 'Stock' },
    { field: 'discontinued', headerName: 'Discontinued' }
  ], []);
  
  // Define filter fields
  const filterDefinitions: FilterDefinitionsByField = [
    {
      targetFieldName: "productName",
      label: "Product Name",
      dataType: DataType.String
    },
    {
      targetFieldName: "unitPrice",
      label: "Unit Price",
      dataType: DataType.Numeric
    },
    {
      targetFieldName: "unitsInStock",
      label: "Units In Stock",
      dataType: DataType.Numeric
    },
    {
      targetFieldName: "discontinued",
      label: "Discontinued",
      dataType: DataType.Boolean
    }
  ];
  
  // Convert conditions to Vysta filter format
  const filters = useMemo(() => {
    if (conditions.length === 0) return undefined;
    return conditionsToVystaFilter(conditions);
  }, [conditions]);
  
  return (
    <div>
      <button 
        onClick={() => setIsFilterVisible(!isFilterVisible)}
        style={{ marginBottom: '10px' }}
      >
        {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
      </button>
      
      {isFilterVisible && (
        <div style={{ marginBottom: '20px' }}>
          <FilterPanel 
            conditions={conditions}
            onApply={setConditions}
            filterDefinitions={filterDefinitions}
          />
        </div>
      )}
      
      <DataGrid<Product>
        title="Filtered Products"
        noun="Product"
        repository={productService}
        columnDefs={columnDefs}
        getRowId={(product) => product.productId.toString()}
        filters={filters}
      />
    </div>
  );
}
```

#### Advanced Filter with List Values

```tsx
import React, { useState, useEffect } from 'react';
import { FilterPanel } from '@datavysta/vysta-react';
import { DataType } from '@datavysta/vysta-react/components/Models/DataType';
import { FilterDefinitionsByField } from '@datavysta/vysta-react/components/Filter/FilterDefinitionsByField';
import { Condition } from '@datavysta/vysta-react/components/Models/Condition';

function AdvancedProductFilter({ client }) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: number, name: string}[]>([]);
  
  // Load categories and suppliers for dropdown filters
  useEffect(() => {
    const categoryService = new CategoryService(client);
    const supplierService = new SupplierService(client);
    
    Promise.all([
      categoryService.getAll(),
      supplierService.getAll()
    ]).then(([categoryData, supplierData]) => {
      setCategories(categoryData);
      setSuppliers(supplierData);
    });
  }, [client]);
  
  // Define filter fields with dynamic list values
  const filterDefinitions: FilterDefinitionsByField = [
    {
      targetFieldName: "productName",
      label: "Product Name",
      dataType: DataType.String
    },
    {
      targetFieldName: "categoryId",
      label: "Category",
      dataType: DataType.List,
      listValues: categories.map(c => ({ 
        value: c.id.toString(), 
        label: c.name 
      }))
    },
    {
      targetFieldName: "supplierId",
      label: "Supplier",
      dataType: DataType.List,
      listValues: suppliers.map(s => ({ 
        value: s.id.toString(), 
        label: s.name 
      }))
    },
    {
      targetFieldName: "unitPrice",
      label: "Unit Price",
      dataType: DataType.Numeric
    },
    {
      targetFieldName: "discontinued",
      label: "Discontinued",
      dataType: DataType.Boolean
    }
  ];
  
  return (
    <FilterPanel 
      conditions={conditions}
      onApply={setConditions}
      filterDefinitions={filterDefinitions}
      allowSave={true}
      allowLoad={true}
    />
  );
}
```

#### FilterPanel Props

| Prop | Type | Description |
|------|------|-------------|
| `filterDefinitions` | `FilterDefinitionsByField` | Array of field definitions with types and labels |
| `conditions` | `Condition[]` | Current filter conditions |
| `onApply` | `(conditions: Condition[]) => void` | Callback when filters are applied |
| `onChange` | `(conditions: Condition[]) => void` | Callback when conditions change |
| `allowSave` | `boolean` | Enable saving filters (requires a filter service) |
| `allowLoad` | `boolean` | Enable loading saved filters |
| `filterService` | `IFilterService` | Optional service for saving/loading filters |
| `defaultConditionMode` | `ConditionMode` | Default mode for conditions (ValueBased or ExpressionBased) |
| `styles` | `FilterPanelStyles` | Custom styles for filter panel elements |

#### Filter Types

The FilterPanel supports these data types from `DataType`:
- `String`: Text fields with operations like contains, equals, starts with
- `Numeric`: Numeric fields with operations like equals, greater than, less than
- `Boolean`: True/false fields
- `Date`: Date fields with operations like equals, before, after
- `List`: Dropdown selection with predefined values
- `MultiList`: Multi-select dropdown with predefined values

#### Filter Definition Format

Each filter definition should include:
- `targetFieldName`: The field name to filter on
- `label`: Display label for the field
- `dataType`: One of the DataType enum values
- `listValues`: For List/MultiList types, an array of { value, label } objects
- `listLoader`: For dynamic lists, a function that returns a Promise of list values

## Vysta Mantine Integration

Vysta components can optionally use Mantine UI for enhanced styling and interactions. To use Vysta's Mantine integration:

1. Install Mantine dependencies:
```bash
npm install @mantine/core @mantine/hooks
```

2. Import Mantine styles:
```tsx
import '@mantine/core/styles.css';
```

3. Wrap your Vysta components with both providers:
```tsx
import { MantineProvider } from '@mantine/core';
import { VystaMantineComponentProvider } from '@datavysta/vysta-react/mantine';

function App() {
  return (
    <MantineProvider>
      <VystaMantineComponentProvider>
        {/* Your Vysta components here */}
      </VystaMantineComponentProvider>
    </MantineProvider>
  );
}
```

This will enable Mantine-styled versions of Vysta components while maintaining all their core functionality.

## Props Documentation

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | The title displayed at the top of the grid |
| `noun` | `string` | The singular noun for your entity (used in button labels) |
| `repository` | `IDataService<T>` | The Vysta service instance for your entity |
| `columnDefs` | `ColDef<T>[]` | AG Grid column definitions |
| `getRowId` | `(data: T) => string` | Function to get a unique string ID from your entity |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gridOptions` | `GridOptions<T>` | `undefined` | Additional AG Grid options |
| `supportRegularDownload` | `boolean` | `false` | Enable CSV download of grid data with current sorting and filtering |
| `supportInsert` | `boolean` | `false` | Show "New" button |
| `supportDelete` | `boolean` | `false` | Show delete button in each row |
| `deleteButton` | `(onDelete: () => void) => React.ReactNode` | `undefined` | Custom delete button renderer |
| `filters` | `{ [K in keyof T]?: any }` | `undefined` | Vysta filters to apply. Should be memoized to prevent unnecessary reloads |
| `wildcardSearch` | `string` | `undefined` | Text to use for wildcard search across fields (passed as `q` parameter) |
| `inputProperties` | `{ [key: string]: any }` | `undefined` | Additional properties to pass to data source. Should be memoized to prevent unnecessary reloads |
| `toolbarItems` | `React.ReactNode` | `undefined` | Custom toolbar items |
| `onDataFirstLoaded` | `(gridApi: GridApi<T>) => void` | `undefined` | Callback when data first loads or when filters/inputProperties change |
| `onDataLoaded` | `(gridApi: GridApi<T>, data: T[]) => void` | `undefined` | Callback when any data loads, including incremental loads |
| `getRowClass` | `(params: RowClassParams<T>) => string \| string[] \| undefined` | `undefined` | Custom row CSS classes |
| `tick` | `number` | `0` | Trigger grid refresh when incremented |
| `theme` | `Theme \| 'legacy'` | `undefined` | AG Grid theme configuration |
| `styles` | `DataGridStyles` | `{}` | Custom styles for grid elements |
| `noRowsComponent` | `React.ComponentType<any>` | `undefined` | Custom component to display when no rows are found |
| `loadingComponent` | `React.ComponentType<any>` | `undefined` | Custom component to display during loading |

### Styling

You can customize the appearance of individual grid elements using the `styles` prop:

```tsx
<DataGrid<Product>
  // ... other props ...
  styles={{
    container: { backgroundColor: '#f5f5f5' },
    title: { color: 'blue', fontSize: '1.2rem' },
    badge: { backgroundColor: 'red', color: 'white' },
    createButton: { backgroundColor: 'green' },
    // ... other style overrides
  }}
/>
```

Available style targets:
- `container`: The main grid container
- `toolbar`: The top toolbar section
- `titleSection`: The title and badge container
- `title`: The grid title text
- `badge`: The count badge
- `actions`: The actions container (buttons)
- `createButton`: The "New" button
- `downloadButton`: The download button
- `deleteButton`: The delete button in rows
- `grid`: The AG Grid container

### Features

- 🔄 Infinite scrolling with server-side operations
- 📊 Sorting and filtering
- ✨ Customizable columns
- 🎨 Modern UI with great UX
- 💪 Fully typed with TypeScript

### Grid Customization

The grid uses AG Grid Community Edition under the hood. You can customize the grid behavior using the `gridOptions` prop:

```tsx
<DataGrid<Product>
  // ... required props ...
  gridOptions={{
    rowHeight: 48,
    headerHeight: 40,
    rowSelection: 'multiple',
    // ... any other AG Grid options
  }}
/>
```

### Filtering Example

```tsx
// Example with memoized filters to prevent unnecessary reloads
function ProductList() {
  const [useFilter, setUseFilter] = useState(false);
  
  const filters = useMemo(
    () => useFilter ? { unitPrice: { gt: 20 } } : undefined,
    [useFilter]
  );

  return (
    <DataGrid<Product>
      // ... other props ...
      filters={filters}
    />
  );
}
```

### Input Properties Example

```tsx
// Example with memoized input properties
function ProductList() {
  const [useInputProps, setUseInputProps] = useState(false);
  
  const inputProperties = useMemo(
    () => useInputProps ? { customParam: 'value' } : undefined,
    [useInputProps]
  );

  return (
    <DataGrid<Product>
      // ... other props ...
      inputProperties={inputProperties}
    />
  );
}
```

### Aggregate Summary Row (Footer)

DataGrid supports showing a summary/footer row with aggregate values (SUM, AVG, etc) using the Vysta aggregate query API. This is useful for totals, averages, and other summary statistics.

#### Usage Example

```tsx
import { DataGrid } from '@datavysta/vysta-react';
import { Aggregate, SelectColumn } from '@datavysta/vysta-client';

const aggregateSelect: SelectColumn<Product>[] = [
  { name: 'unitPrice', aggregate: Aggregate.AVG, alias: 'avgUnitPrice' },
  { name: 'unitsInStock', aggregate: Aggregate.SUM, alias: 'totalUnitsInStock' },
];

<DataGrid<Product>
  title="Products"
  noun="Product"
  repository={productService}
  columnDefs={columnDefs}
  getRowId={(product) => product.productId.toString()}
  aggregateSelect={aggregateSelect}
/>
```

- The summary row appears below the grid and updates with filters, search, etc.
- By default, the row matches columns by field name or alias. You can customize rendering with the `renderAggregateFooter` prop.
- The summary row is not part of the grid (not a pinned row), so it is always visible below the grid.

#### Details & Customization

- **Column value formatting**: The footer automatically applies the column's `valueFormatter` (if provided in your `columnDefs`). This lets you format numbers, currency, dates, etc., exactly the same way as in the grid cells.
- **Alias required**: Every `SelectColumn` in `aggregateSelect` must have an `alias`. The alias is used to look up the aggregate value in the server response.
- **Column matching**: The footer places the aggregate under the column whose `field` equals the `name` in the `SelectColumn`. The `alias` can be anything you like.
- **Fully custom footer**: Provide a `renderAggregateFooter` prop to supply your own React node. You receive the raw `summary` object (keyed by alias) and can render any layout, charts, or styled components you need.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `aggregateSelect` | `SelectColumn<T>[]` | Columns/aggregates to fetch and show in the summary row |
| `renderAggregateFooter` | `(summary: Record<string, any>) => React.ReactNode` | Optional custom render for the summary row |
| `styles.aggregateFooter` | `React.CSSProperties` | Custom style for the summary/footer row |
| `styles.aggregateValue` | `React.CSSProperties` | Style override for the `<span>` that holds each formatted value |

See the [@datavysta/vysta-client](https://www.npmjs.com/package/@datavysta/vysta-client) docs for more on `Aggregate` and `SelectColumn`.

### LazyLoadList

The LazyLoadList component provides a searchable, lazy-loading dropdown list that efficiently loads data from a Vysta service with support for filtering, grouping, and dependent dropdowns.

#### Basic Usage

```tsx
import React, { useState, useMemo } from 'react';
import { LazyLoadList } from '@datavysta/vysta-react';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function ProductSelector({ client }) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Handle selection change
  const handleProductChange = (productId: string | null) => {
    setSelectedProductId(productId);
    console.log('Selected product ID:', productId);
  };

  return (
    <div style={{ width: '300px' }}>
      <LazyLoadList<Product>
        repository={productService}
        value={selectedProductId}
        onChange={handleProductChange}
        label="Select Product"
        displayColumn="productName"
        clearable={true}
        searchable={true}
        placeholder="Search products..."
      />
      
      {selectedProductId && (
        <div style={{ marginTop: '10px' }}>
          Selected Product ID: {selectedProductId}
        </div>
      )}
    </div>
  );
}
```

#### With Filtering and Grouping

```tsx
import React, { useState, useMemo } from 'react';
import { LazyLoadList } from '@datavysta/vysta-react';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function ProductSelectorWithFiltering({ client }) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Create memoized filters
  const filters = useMemo(() => {
    if (!showDiscontinued) {
      return { discontinued: { eq: false } };
    }
    return undefined;
  }, [showDiscontinued]);

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={showDiscontinued} 
            onChange={(e) => setShowDiscontinued(e.target.checked)} 
          />
          Show discontinued products
        </label>
      </div>
      
      <LazyLoadList<Product>
        repository={productService}
        value={selectedProductId}
        onChange={setSelectedProductId}
        label="Select Product"
        displayColumn="productName"
        filters={filters}
        groupBy="categoryName"
        clearable={true}
        searchable={true}
      />
    </div>
  );
}
```

#### Dependent Dropdowns Example

```tsx
import React, { useState, useMemo, useEffect } from 'react';
import { LazyLoadList } from '@datavysta/vysta-react';
import { Category } from '../types/Category';
import { Product } from '../types/Product';
import { CategoryService } from '../services/CategoryService';
import { ProductService } from '../services/ProductService';

function DependentDropdowns({ client }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Create service instances
  const categoryService = useMemo(() => new CategoryService(client), [client]);
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Reset product selection when category changes
  useEffect(() => {
    setSelectedProductId(null);
  }, [selectedCategoryId]);
  
  // Create product filters based on selected category
  const productFilters = useMemo(() => {
    if (!selectedCategoryId) return undefined;
    return { categoryId: { eq: selectedCategoryId } };
  }, [selectedCategoryId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <LazyLoadList<Category>
        repository={categoryService}
        value={selectedCategoryId}
        onChange={setSelectedCategoryId}
        label="Select Category"
        displayColumn="categoryName"
        clearable={true}
      />
      
      <LazyLoadList<Product>
        repository={productService}
        value={selectedProductId}
        onChange={setSelectedProductId}
        label="Select Product"
        displayColumn="productName"
        filters={productFilters}
        clearable={true}
        disabled={!selectedCategoryId}
        placeholder={selectedCategoryId ? "Search products..." : "Select a category first"}
      />
      
      {selectedProductId && (
        <div>
          Selected: Category ID {selectedCategoryId}, Product ID {selectedProductId}
        </div>
      )}
    </div>
  );
}
```

#### Custom Rendering

```tsx
import React, { useState, useMemo } from 'react';
import { LazyLoadList } from '@datavysta/vysta-react';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function ProductSelectorWithCustomRendering({ client }) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Custom item renderer
  const renderItem = (product: Product) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>{product.productName}</div>
      <div style={{ 
        color: product.discontinued ? 'red' : 'green',
        fontWeight: 'bold'
      }}>
        ${product.unitPrice.toFixed(2)}
        {product.discontinued && ' (Discontinued)'}
      </div>
    </div>
  );

  return (
    <LazyLoadList<Product>
      repository={productService}
      value={selectedProductId}
      onChange={setSelectedProductId}
      label="Select Product"
      displayColumn="productName"
      clearable={true}
      renderItem={renderItem}
    />
  );
}
```

#### LazyLoadList Props

| Prop | Type | Description |
|------|------|-------------|
| `repository` | `IReadonlyDataService<T>` | The Vysta service to fetch data from |
| `value` | `string \| null` | The currently selected value |
| `onChange` | `(value: string \| null) => void` | Callback when selection changes |
| `displayColumn` | `keyof T` | The field to display in the list |
| `label` | `string` | Optional label for the list |
| `filters` | `{ [K in keyof T]?: any }` | Optional filters to apply |
| `groupBy` | `keyof T` | Optional field to group items by |
| `pageSize` | `number` | Number of items to load per page (default: 20) |
| `searchable` | `boolean` | Whether to show search input (default: true) |
| `clearable` | `boolean` | Whether to show clear button (default: true) |
| `disabled` | `boolean` | Whether the component is disabled (default: false) |
| `placeholder` | `string` | Placeholder text for the input |
| `renderItem` | `(item: T) => React.ReactNode` | Custom item renderer |
| `disableInitialValueLoad` | `boolean` | Disable initial value query when display matches key (default: false) |
| `styles` | `LazyLoadListStyles` | Custom styles for the component |

#### Features

- 🔄 Lazy loading with infinite scroll
- 🔍 Built-in search functionality
- 📑 Optional grouping of items
- 🎯 Efficient loading of selected values
- 🎨 Customizable styles and rendering
- 💪 Full TypeScript support
- 🔗 Support for dependent dropdowns

```

### FileUpload

The FileUpload component provides a powerful file upload interface that integrates with Vysta's file service and uses Uppy for drag-and-drop, progress tracking, and resumable uploads.

#### Basic Usage

```tsx
import React, { useMemo } from 'react';
import { FileUpload } from '@datavysta/vysta-react';
import { FileService } from '../services/FileService';

function BasicFileUploader({ client }) {
  // Create file service instance
  const fileService = useMemo(() => new FileService(client), [client]);
  
  // Handle successful upload
  const handleUploadSuccess = (fileId: string, fileName: string) => {
    console.log(`File uploaded successfully: ${fileName} (ID: ${fileId})`);
    // You would typically store the fileId in your database
  };

  return (
    <div>
      <h3>Upload Files</h3>
      <FileUpload
        fileService={fileService}
        onUploadSuccess={handleUploadSuccess}
        allowedFileTypes={['.jpg', '.png', '.pdf', 'image/*']}
        autoProceed={false}
      />
    </div>
  );
}
```

#### With Upload Progress and Error Handling

```tsx
import React, { useMemo, useState } from 'react';
import { FileUpload } from '@datavysta/vysta-react';
import { FileService } from '../services/FileService';

function FileUploaderWithProgress({ client }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: string, name: string}>>([]);
  
  // Create file service instance
  const fileService = useMemo(() => new FileService(client), [client]);
  
  // Handle upload progress
  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
    setUploadError(null);
  };
  
  // Handle upload success
  const handleUploadSuccess = (fileId: string, fileName: string) => {
    setUploadedFiles(prev => [...prev, { id: fileId, name: fileName }]);
    setUploadProgress(0);
    setUploadError(null);
  };
  
  // Handle upload error
  const handleUploadError = (error: Error) => {
    setUploadError(`Upload failed: ${error.message}`);
    setUploadProgress(0);
  };

  return (
    <div>
      <h3>Upload Files</h3>
      
      {uploadError && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {uploadError}
        </div>
      )}
      
      {uploadProgress > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div>Uploading: {uploadProgress.toFixed(0)}%</div>
          <div style={{ 
            height: '10px', 
            width: '100%', 
            backgroundColor: '#eee',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${uploadProgress}%`, 
              backgroundColor: '#4caf50',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}
      
      <FileUpload
        fileService={fileService}
        onUploadSuccess={handleUploadSuccess}
        onUploadProgress={handleUploadProgress}
        onUploadError={handleUploadError}
        allowedFileTypes={['.jpg', '.png', '.pdf', 'image/*']}
        autoProceed={true}
        maxFileSize={5 * 1024 * 1024} // 5MB
      />
      
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Uploaded Files:</h4>
          <ul>
            {uploadedFiles.map(file => (
              <li key={file.id}>
                {file.name} (ID: {file.id})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

#### Integration with Form and Custom Styling

```tsx
import React, { useMemo, useState } from 'react';
import { FileUpload } from '@datavysta/vysta-react';
import { FileService } from '../services/FileService';

function ProductImageUploader({ client, productId }) {
  const [fileId, setFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Create file service instance
  const fileService = useMemo(() => new FileService(client), [client]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileId) {
      alert('Please upload an image first');
      return;
    }
    
    try {
      // Save the fileId to your product record
      await productService.update(productId, { imageFileId: fileId });
      alert('Product image updated successfully');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product image');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Update Product Image</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <FileUpload
          fileService={fileService}
          onUploadSuccess={(id) => setFileId(id)}
          onUploadStart={() => setIsUploading(true)}
          onUploadComplete={() => setIsUploading(false)}
          allowedFileTypes={['image/*']}
          autoProceed={true}
          note="Upload a product image (JPG, PNG only, max 2MB)"
          maxFileSize={2 * 1024 * 1024}
          styles={{
            container: { 
              border: '2px dashed #ccc',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            },
            dropzone: {
              minHeight: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            },
            button: {
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }
          }}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={!fileId || isUploading}
        style={{
          padding: '10px 20px',
          backgroundColor: !fileId || isUploading ? '#ccc' : '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: !fileId || isUploading ? 'not-allowed' : 'pointer'
        }}
      >
        {isUploading ? 'Uploading...' : 'Save Product Image'}
      </button>
    </form>
  );
}
```

#### FileUpload Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fileService` | `VystaFileService` | Required | The Vysta file service instance to handle uploads |
| `onUploadSuccess` | `(fileId: string, fileName: string) => void` | - | Callback when file upload completes successfully |
| `onUploadProgress` | `(progress: number) => void` | - | Callback with upload progress (0-100) |
| `onUploadError` | `(error: Error) => void` | - | Callback when upload fails |
| `onUploadStart` | `() => void` | - | Callback when upload starts |
| `onUploadComplete` | `() => void` | - | Callback when upload completes (success or error) |
| `filename` | `string` | - | Optional custom filename to use instead of the uploaded file's name |
| `allowedFileTypes` | `string[]` | - | Optional array of allowed file types (e.g., ['.jpg', 'image/*']) |
| `autoProceed` | `boolean` | `false` | Whether to start upload automatically when files are selected |
| `maxFileSize` | `number` | - | Maximum file size in bytes |
| `maxNumberOfFiles` | `number` | - | Maximum number of files that can be selected |
| `note` | `string` | - | Informational text to display below the uploader |
| `styles` | `FileUploadStyles` | - | Custom styles for the component |

#### Features

- 🔄 Resumable uploads for large files
- 📁 Drag and drop interface
- 🔒 File type restrictions and validation
- 📊 Upload progress tracking
- 🎨 Customizable styling
- 🚀 Automatic or manual upload triggering
- 💪 Full TypeScript support
- 🔗 Integration with Vysta's file service

## Advanced Features

### Editable Fields

The DataGrid component supports editable cells with different field types. This allows users to edit data directly in the grid with appropriate editors for each data type.

#### Setting Up Editable Fields

```tsx
import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { ColDef } from 'ag-grid-community';
import { EditableFieldType, EditableFieldConfig } from '@datavysta/vysta-react/components/DataGrid/types';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function EditableProductGrid({ client }) {
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Define editable column configurations
  const columnDefs = useMemo<ColDef<Product>[]>(() => [
    { 
      field: 'productId', 
      headerName: 'ID',
      width: 100,
      editable: false // Not editable
    },
    { 
      field: 'productName', 
      headerName: 'Name',
      flex: 1,
      editable: true,
      // Text field configuration
      cellEditorParams: {
        type: EditableFieldType.Text,
        config: {
          required: true,
          maxLength: 40
        } as EditableFieldConfig
      }
    },
    { 
      field: 'unitPrice', 
      headerName: 'Price',
      editable: true,
      valueFormatter: ({ value }) => value && `$${Number(value).toFixed(2)}`,
      // Number field configuration
      cellEditorParams: {
        type: EditableFieldType.Number,
        config: {
          required: true,
          min: 0,
          max: 1000,
          step: 0.01
        } as EditableFieldConfig
      }
    },
    { 
      field: 'unitsInStock', 
      headerName: 'Stock',
      editable: true,
      // Number field configuration (integer)
      cellEditorParams: {
        type: EditableFieldType.Number,
        config: {
          required: true,
          min: 0,
          step: 1
        } as EditableFieldConfig
      }
    },
    { 
      field: 'discontinued', 
      headerName: 'Discontinued',
      editable: true,
      // Boolean field is automatically handled
    }
  ], []);

  return (
    <DataGrid<Product>
      title="Editable Products"
      noun="Product"
      repository={productService}
      columnDefs={columnDefs}
      getRowId={(product) => product.productId.toString()}
      supportRegularDownload={true}
      supportDelete={true}
      supportInsert={true}
    />
  );
}
```

#### Editable Field Types

The DataGrid supports these editable field types:

| Field Type | Description | Configuration Options |
|------------|-------------|----------------------|
| `Text` | Text input field | `required`, `maxLength`, `pattern` |
| `Number` | Numeric input field | `required`, `min`, `max`, `step` |
| `Date` | Date picker | `required`, `min`, `max`, `format` |
| `List` | Dropdown selection | `required`, `options`, `multiple` |

#### List Field Example

```tsx
// Example of a List field with options
{
  field: 'categoryId',
  headerName: 'Category',
  editable: true,
  cellEditorParams: {
    type: EditableFieldType.List,
    config: {
      required: true,
      options: [
        { value: '1', label: 'Beverages' },
        { value: '2', label: 'Condiments' },
        { value: '3', label: 'Confections' },
        { value: '4', label: 'Dairy Products' }
      ]
    } as EditableFieldConfig
  }
}
```

#### Dynamic List Options

```tsx
// Example with dynamic list options loaded from a service
const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

useEffect(() => {
  const categoryService = new CategoryService(client);
  categoryService.getAll().then(data => {
    setCategories(data);
  });
}, [client]);

// In your column definitions:
{
  field: 'categoryId',
  headerName: 'Category',
  editable: true,
  cellEditorParams: {
    type: EditableFieldType.List,
    config: {
      required: true,
      options: categories.map(c => ({ 
        value: c.id.toString(), 
        label: c.name 
      }))
    } as EditableFieldConfig
  }
}
```

### Component Integration

Vysta components are designed to work together seamlessly. Here are some common integration patterns:

#### DataGrid with FilterPanel

```tsx
import React, { useState, useMemo } from 'react';
import { DataGrid, FilterPanel } from '@datavysta/vysta-react';
import { DataType } from '@datavysta/vysta-react/components/Models/DataType';
import { FilterDefinitionsByField } from '@datavysta/vysta-react/components/Filter/FilterDefinitionsByField';
import { Condition } from '@datavysta/vysta-react/components/Models/Condition';
import { conditionsToVystaFilter } from '@datavysta/vysta-react/utils/filterUtils';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function IntegratedFilterGrid({ client }) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Define filter fields
  const filterDefinitions: FilterDefinitionsByField = [
    {
      targetFieldName: "productName",
      label: "Product Name",
      dataType: DataType.String
    },
    {
      targetFieldName: "unitPrice",
      label: "Unit Price",
      dataType: DataType.Numeric
    },
    {
      targetFieldName: "discontinued",
      label: "Discontinued",
      dataType: DataType.Boolean
    }
  ];
  
  // Convert conditions to Vysta filter format
  const filters = useMemo(() => {
    if (conditions.length === 0) return undefined;
    return conditionsToVystaFilter(conditions);
  }, [conditions]);
  
  // Define grid columns
  const columnDefs = useMemo(() => [
    // ... column definitions
  ], []);
  
  return (
    <div>
      <button 
        onClick={() => setIsFilterVisible(!isFilterVisible)}
        style={{ marginBottom: '10px' }}
      >
        {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
      </button>
      
      {isFilterVisible && (
        <div style={{ marginBottom: '20px' }}>
          <FilterPanel 
            conditions={conditions}
            onApply={setConditions}
            filterDefinitions={filterDefinitions}
          />
        </div>
      )}
      
      <DataGrid<Product>
        title="Filtered Products"
        noun="Product"
        repository={productService}
        columnDefs={columnDefs}
        getRowId={(product) => product.productId.toString()}
        filters={filters}
      />
    </div>
  );
}
```

#### Form with LazyLoadList and FileUpload

```tsx
import React, { useState, useMemo } from 'react';
import { LazyLoadList, FileUpload } from '@datavysta/vysta-react';
import { Product } from '../types/Product';
import { Category } from '../types/Category';
import { ProductService } from '../services/ProductService';
import { CategoryService } from '../services/CategoryService';
import { FileService } from '../services/FileService';

function ProductForm({ client }) {
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [unitPrice, setUnitPrice] = useState('');
  const [imageFileId, setImageFileId] = useState<string | null>(null);
  
  // Create service instances
  const productService = useMemo(() => new ProductService(client), [client]);
  const categoryService = useMemo(() => new CategoryService(client), [client]);
  const fileService = useMemo(() => new FileService(client), [client]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newProduct = {
        productName,
        categoryId: categoryId ? parseInt(categoryId) : null,
        unitPrice: unitPrice ? parseFloat(unitPrice) : 0,
        imageFileId
      };
      
      await productService.create(newProduct);
      alert('Product created successfully!');
      
      // Reset form
      setProductName('');
      setCategoryId(null);
      setUnitPrice('');
      setImageFileId(null);
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Product</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Product Name:
          <input 
            type="text" 
            value={productName} 
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Category:</label>
        <LazyLoadList<Category>
          repository={categoryService}
          value={categoryId}
          onChange={setCategoryId}
          displayColumn="categoryName"
          clearable={true}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Unit Price:
          <input 
            type="number" 
            value={unitPrice} 
            onChange={(e) => setUnitPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Product Image:</label>
        <FileUpload
          fileService={fileService}
          onUploadSuccess={(fileId) => setImageFileId(fileId)}
          allowedFileTypes={['image/*']}
          autoProceed={true}
        />
      </div>
      
      <button type="submit" disabled={!productName || !unitPrice}>
        Create Product
      </button>
    </form>
  );
}
```

### Aggregate Summary Rows

DataGrid supports showing summary rows with aggregate calculations like SUM, AVG, COUNT, etc.

```tsx
import React, { useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { Aggregate, SelectColumn } from '@datavysta/vysta-client';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function ProductGridWithAggregates({ client }) {
  // Create service instance
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Define aggregate columns
  const aggregateSelect: SelectColumn<Product>[] = [
    { name: 'unitPrice', aggregate: Aggregate.AVG, alias: 'avgUnitPrice' },
    { name: 'unitPrice', aggregate: Aggregate.SUM, alias: 'totalValue' },
    { name: 'unitsInStock', aggregate: Aggregate.SUM, alias: 'totalStock' },
    { name: 'productId', aggregate: Aggregate.COUNT, alias: 'productCount' }
  ];
  
  // Define grid columns
  const columnDefs = useMemo(() => [
    { field: 'productId', headerName: 'ID', width: 100 },
    { field: 'productName', headerName: 'Name', flex: 1 },
    { 
      field: 'unitPrice', 
      headerName: 'Price', 
      valueFormatter: ({ value }) => value && `$${Number(value).toFixed(2)}`
    },
    { field: 'unitsInStock', headerName: 'Stock' }
  ], []);
  
  // Custom aggregate footer renderer (optional)
  const renderAggregateFooter = (summary) => (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
      <div><strong>Summary:</strong> {summary.productCount} products</div>
      <div>Average Price: ${Number(summary.avgUnitPrice).toFixed(2)}</div>
      <div>Total Value: ${Number(summary.totalValue).toFixed(2)}</div>
      <div>Total Stock: {summary.totalStock} units</div>
    </div>
  );

  return (
    <DataGrid<Product>
      title="Products with Summary"
      noun="Product"
      repository={productService}
      columnDefs={columnDefs}
      getRowId={(product) => product.productId.toString()}
      aggregateSelect={aggregateSelect}
      renderAggregateFooter={renderAggregateFooter}
    />
  );
}
```

## Error Handling

Proper error handling is essential for a good user experience. Here are patterns for handling errors in Vysta components.

### Authentication Errors

```tsx
import React, { useState } from 'react';
import { useVystaServices } from '@datavysta/vysta-react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { auth, loginLoading, loginError } = useVystaServices();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await auth.login(username, password);
      // Redirect or show success message
    } catch (error) {
      // Error is already captured in loginError
      console.error('Login failed:', error);
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      
      {loginError && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {loginError.message || 'Authentication failed'}
        </div>
      )}
      
      <div>
        <label>
          Username:
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Password:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      
      <button type="submit" disabled={loginLoading}>
        {loginLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Data Operation Errors

```tsx
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@datavysta/vysta-react';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';

function ProductGridWithErrorHandling({ client }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [productService] = useState(() => new ProductService(client));
  
  // Load data with error handling
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getAll();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load products'));
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [productService]);
  
  // Custom error component for DataGrid
  const ErrorComponent = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ color: 'red', marginBottom: '10px' }}>
        {error?.message || 'An error occurred while loading data'}
      </div>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
  
  if (loading) {
    return <div>Loading products...</div>;
  }
  
  if (error) {
    return <ErrorComponent />;
  }
  
  // Define grid columns
  const columnDefs = [
    // ... column definitions
  ];
  
  return (
    <DataGrid<Product>
      title="Products"
      noun="Product"
      repository={productService}
      columnDefs={columnDefs}
      getRowId={(product) => product.productId.toString()}
      noRowsComponent={ErrorComponent}
    />
  );
}
```

### Form Validation Errors

```tsx
import React, { useState } from 'react';
import { ProductService } from '../services/ProductService';

function ProductForm({ client }) {
  const [productName, setProductName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const productService = new ProductService(client);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    
    if (!unitPrice) {
      newErrors.unitPrice = 'Unit price is required';
    } else if (isNaN(parseFloat(unitPrice)) || parseFloat(unitPrice) < 0) {
      newErrors.unitPrice = 'Unit price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      await productService.create({
        productName,
        unitPrice: parseFloat(unitPrice)
      });
      
      // Reset form
      setProductName('');
      setUnitPrice('');
      alert('Product created successfully!');
    } catch (error) {
      console.error('Failed to create product:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Product</h2>
      
      {submitError && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {submitError}
        </div>
      )}
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Product Name:
          <input 
            type="text" 
            value={productName} 
            onChange={(e) => setProductName(e.target.value)}
          />
        </label>
        {errors.productName && (
          <div style={{ color: 'red' }}>{errors.productName}</div>
        )}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Unit Price:
          <input 
            type="number" 
            value={unitPrice} 
            onChange={(e) => setUnitPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </label>
        {errors.unitPrice && (
          <div style={{ color: 'red' }}>{errors.unitPrice}</div>
        )}
      </div>
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

## Performance Optimization

Optimizing performance is crucial for a smooth user experience, especially with large datasets. Here are some best practices for optimizing Vysta components.

### Memoization

Always memoize props that trigger data reloads to prevent unnecessary API calls:

```tsx
import React, { useState, useMemo } from 'react';
import { DataGrid } from '@datavysta/vysta-react';

function OptimizedProductGrid({ client }) {
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  
  // Create service instance (memoized)
  const productService = useMemo(() => new ProductService(client), [client]);
  
  // Memoize filters to prevent unnecessary reloads
  const filters = useMemo(() => {
    const result: any = {};
    
    if (priceFilter !== null) {
      result.unitPrice = { gt: priceFilter };
    }
    
    return Object.keys(result).length > 0 ? result : undefined;
  }, [priceFilter]); // Only depends on priceFilter
  
  // Memoize column definitions
  const columnDefs = useMemo(() => [
    // ... column definitions
  ], []); // Empty dependency array - never changes
  
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        
        <select 
          value={priceFilter === null ? '' : priceFilter.toString()} 
          onChange={(e) => setPriceFilter(e.target.value ? parseFloat(e.target.value) : null)}
        >
          <option value="">All Prices</option>
          <option value="10">Over $10</option>
          <option value="20">Over $20</option>
          <option value="50">Over $50</option>
        </select>
      </div>
      
      <DataGrid<Product>
        title="Products"
        noun="Product"
        repository={productService}
        columnDefs={columnDefs}
        getRowId={(product) => product.productId.toString()}
        filters={filters}
        wildcardSearch={searchText || undefined}
      />
    </div>
  );
}
```

### Efficient Grid Refreshing

Use the `tick` prop to trigger grid refreshes only when needed:

```tsx
import React, { useState } from 'react';
import { DataGrid } from '@datavysta/vysta-react';

function RefreshableGrid({ client }) {
  const [tick, setTick] = useState(0);
  
  const handleRefresh = () => {
    // Increment tick to trigger grid refresh
    setTick(prev => prev + 1);
  };
  
  return (
    <div>
      <button onClick={handleRefresh}>
        Refresh Data
      </button>
      
      <DataGrid<Product>
        // ... other props
        tick={tick} // Grid will refresh when tick changes
      />
    </div>
  );
}
```

### Lazy Loading and Pagination

LazyLoadList already implements efficient lazy loading. For custom implementations:

```tsx
import React, { useState, useEffect } from 'react';

function OptimizedList({ repository }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;
  
  // Load data with pagination
  useEffect(() => {
    const loadData = async () => {
      if (!hasMore || loading) return;
      
      setLoading(true);
      try {
        const result = await repository.getPage(page, pageSize);
        setItems(prev => [...prev, ...result.items]);
        setHasMore(result.items.length === pageSize);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [repository, page, pageSize, hasMore, loading]);
  
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };
  
  return (
    <div>
      <div>
        {items.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
      
      {loading && <div>Loading...</div>}
      
      {hasMore && !loading && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}
```

### Service Instance Management

Create service instances at the highest appropriate level and pass them down:

```tsx
import React, { useMemo } from 'react';

function ProductDashboard({ client }) {
  // Create service instances once at the top level
  const services = useMemo(() => ({
    productService: new ProductService(client),
    categoryService: new CategoryService(client),
    fileService: new FileService(client)
  }), [client]);
  
  return (
    <div>
      <ProductGrid repository={services.productService} />
      <ProductForm 
        productService={services.productService}
        categoryService={services.categoryService}
        fileService={services.fileService}
      />
    </div>
  );
}
```

## Troubleshooting

Common issues and their solutions when working with Vysta components.

### Authentication Issues

**Issue**: Authentication fails with "Invalid credentials" even with correct username/password.

**Solution**: 
- Verify the `baseUrl` in your VystaConfig is correct
- Check that you're using the correct app name in the VystaServiceProvider
- Ensure your API is accessible from your client application

```tsx
// Correct configuration
const config: VystaConfig = {
  baseUrl: 'https://api.example.com', // Make sure this is correct
  debug: true // Enable for troubleshooting
};

<VystaServiceProvider config={config} apps={["YourAppName"]}>
  {/* Your app content */}
</VystaServiceProvider>
```

**Issue**: "User is not authenticated" errors after login.

**Solution**:
- Make sure you're wrapping your components with VystaServiceProvider
- Check that you're using the useVystaServices hook correctly
- Verify token storage is working (check localStorage)

### DataGrid Issues

**Issue**: DataGrid shows "No rows to show" even when data exists.

**Solution**:
- Check your repository configuration (app name, entity name)
- Verify your filters aren't too restrictive
- Ensure getRowId returns unique string IDs
- Check network requests for API errors

**Issue**: Editable cells don't save changes.

**Solution**:
- Verify your service has proper update permissions
- Check that your column is marked as editable
- Ensure cellEditorParams are configured correctly
- Look for validation errors in the console

### Component Integration Issues

**Issue**: FilterPanel conditions don't affect DataGrid.

**Solution**:
- Make sure you're using conditionsToVystaFilter to convert conditions
- Verify the field names match between FilterDefinitions and your entity
- Check that the filters prop is properly passed to DataGrid

**Issue**: LazyLoadList doesn't show selected value.

**Solution**:
- Ensure your value prop is a string (not a number)
- Check that displayColumn matches a field in your entity
- Verify the repository is configured correctly

### Performance Issues

**Issue**: DataGrid is slow with large datasets.

**Solution**:
- Avoid unnecessary re-renders by memoizing props
- Use appropriate filters to limit data fetched
- Consider using wildcardSearch instead of client-side filtering
- Check network performance with browser dev tools

**Issue**: Frequent API calls when props change.

**Solution**:
- Memoize filters, inputProperties, and other props that trigger reloads
- Use the tick prop for manual refreshes instead of changing other props

## TypeScript Reference

Vysta components are fully typed with TypeScript. Here are the key interfaces and types you'll work with.

### Entity Interfaces

Define your entity types to match your backend data model:

```tsx
// Example entity interface
export interface Product {
  productId: number;
  productName: string;
  unitPrice: number;
  unitsInStock: number;
  discontinued: boolean;
  categoryId?: number;
  categoryName?: string;
}

// Example service implementation
import { VystaClient, VystaService } from '@datavysta/vysta-client';

export class ProductService extends VystaService<Product> {
  constructor(client: VystaClient) {
    super(client, 'YourAppName', 'Products', {
      primaryKey: 'productId'
    });
  }
  
  // Optional: Add custom methods
  async getDiscontinued(): Promise<Product[]> {
    return this.getAll({ discontinued: { eq: true } });
  }
}
```

### Component Props Types

```tsx
// DataGrid props type
import { DataGridProps } from '@datavysta/vysta-react/components/DataGrid/DataGrid';

// Explicitly typed component
const MyDataGrid: React.FC<DataGridProps<Product>> = (props) => {
  return <DataGrid<Product> {...props} />;
};

// FilterPanel props type
import { FilterPanelProps } from '@datavysta/vysta-react/components/Filter/FilterPanel';

// LazyLoadList props type
import { LazyLoadListProps } from '@datavysta/vysta-react/components/LazyLoadList/LazyLoadList';

// FileUpload props type
import { FileUploadProps } from '@datavysta/vysta-react/components/FileUpload/FileUpload';
```

### Editable Field Types

```tsx
import { 
  EditableFieldType, 
  EditableFieldConfig 
} from '@datavysta/vysta-react/components/DataGrid/types';

// Text field configuration
const textFieldConfig: EditableFieldConfig = {
  required: true,
  maxLength: 100,
  pattern: '^[A-Za-z0-9 ]+$'
};

// Number field configuration
const numberFieldConfig: EditableFieldConfig = {
  required: true,
  min: 0,
  max: 1000,
  step: 0.01
};

// Date field configuration
const dateFieldConfig: EditableFieldConfig = {
  required: true,
  min: '2023-01-01',
  max: '2023-12-31'
};

// List field configuration
const listFieldConfig: EditableFieldConfig = {
  required: true,
  options: [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ],
  multiple: false
};
```

### Filter Types

```tsx
import { DataType } from '@datavysta/vysta-react/components/Models/DataType';
import { FilterDefinitionsByField } from '@datavysta/vysta-react/components/Filter/FilterDefinitionsByField';
import { Condition, ConditionMode } from '@datavysta/vysta-react/components/Models/Condition';
import { ComparisonOperator } from '@datavysta/vysta-react/components/Models/ComparisonOperator';

// Filter definitions
const filterDefinitions: FilterDefinitionsByField = [
  {
    targetFieldName: "productName",
    label: "Product Name",
    dataType: DataType.String
  },
  {
    targetFieldName: "unitPrice",
    label: "Unit Price",
    dataType: DataType.Numeric
  }
];

// Example condition
const condition: Condition = {
  targetFieldName: "unitPrice",
  comparisonOperator: ComparisonOperator.GreaterThan,
  values: ["20"],
  conditionMode: ConditionMode.ValueBased
};
```

### Service Types

```tsx
import { 
  IReadonlyDataService, 
  IDataService 
} from '@datavysta/vysta-client';

// Read-only service interface
interface MyReadOnlyService extends IReadonlyDataService<Product> {
  // Custom methods
  getTopProducts(): Promise<Product[]>;
}

// Full CRUD service interface
interface MyDataService extends IDataService<Product> {
  // Custom methods
  updateStock(productId: number, quantity: number): Promise<void>;
}
```

## License

MIT    
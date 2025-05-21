# @datavysta/vysta-react

React components for Vysta - a backend as a service platform.

## Installation

```bash
npm install @datavysta/vysta-react @datavysta/vysta-client ag-grid-community ag-grid-react
```

## Basic Usage

First, import the styles:

```tsx
import '@datavysta/vysta-react/style.css';
```

Then use the components in your app:

```tsx
import { DataGrid } from '@datavysta/vysta-react';
import { VystaClient, VystaService } from '@datavysta/vysta-client';
import { useMemo } from 'react';

// Define your entity type
interface Product {
  productId: number;
  productName: string;
  unitPrice: number;
}

// Create your service
class ProductService extends VystaService<Product> {
  constructor(client: VystaClient) {
    super(client, 'Northwinds', 'Products', {
      primaryKey: 'productId'
    });
  }
}

// In your React component
function ProductList() {
  const products = useMemo(() => {
    const client = new VystaClient({ baseUrl: 'http://localhost:8080' });
    return new ProductService(client);
  }, []);

  const columnDefs = [
    { field: 'productId', headerName: 'ID' },
    { field: 'productName', headerName: 'Name' },
    { field: 'unitPrice', headerName: 'Price' }
  ];

  return (
    <DataGrid<Product>
      title="Products"
      noun="Product"
      repository={products}
      columnDefs={columnDefs}
      getRowId={(product) => product.productId.toString()}
    />
  );
}

## VystaServiceProvider (Core Service Context)

`VystaServiceProvider` is a core feature that provides the VystaClient instance and core Vysta services (roles, permissions, user profile, and authentication) to your app via React context.

**Usage Example:**

```tsx
import { VystaServiceProvider, useVystaServices } from '@datavysta/vysta-react';
import { VystaConfig } from '@datavysta/vysta-client';

const config: VystaConfig = {
  baseUrl: '/api',
  debug: true,
};

function App() {
  return (
    <VystaServiceProvider config={config} apps={["Northwinds"]}>
      <YourApp />
    </VystaServiceProvider>
  );
}

// In any child component:
function MyComponent() {
  const {
    roleService,
    permissionService,
    profile,
    permissions,
    canSelectConnection,
    isAuthenticated,
    profileLoading,
    profileError,
    loginLoading,
    loginError,
    auth,
  } = useVystaServices();

  // Example: login
  const handleLogin = async () => {
    await auth.login('user@example.com', 'password');
  };

  // Example: logout
  const handleLogout = async () => {
    await auth.logout();
  };

  // Example: get sign-in methods
  const signInMethods = await auth.getSignInMethods();

  // ...use any of the above context values as needed
}
```

> **Note:** `VystaServiceProvider` provides the following via context (using `useVystaServices`):
> - `roleService`: VystaRoleService instance
> - `permissionService`: VystaPermissionService instance
> - `profile`: The user's profile object (or null if not loaded)
> - `permissions`: A record mapping app/connection names to their permissions (or null if not loaded or not requested)
> - `canSelectConnection`: Helper to check if the user has SELECT permission for a given app
> - `isAuthenticated`: Boolean, true if a user profile is loaded
> - `profileLoading`: Boolean, true while profile/permissions are loading
> - `profileError`: Any error encountered during profile/permissions loading
> - `loginLoading`: Boolean, true while a login/logout is in progress
> - `loginError`: Any error encountered during login/logout
> - `auth`: An object with authentication methods:
>   - `login(username, password)`
>   - `logout()`
>   - `getSignInMethods()`
>   - `getAuthorizeUrl(providerId)`
>   - `exchangeToken(token)`

> Always use the context-based approach for authentication, user, and permissions state. Direct use of internal hooks is not supported in the public API.

## Authentication and User Profile (Context-based Access)

Authentication, user profile, and permissions are now accessed exclusively via the `VystaServiceProvider` and the `useVystaServices` context hook. This ensures a single source of truth for authentication and user state throughout your app.

- `profile`: The user's profile object (or null if not loaded).
- `permissions`: A record mapping app/connection names to their permissions (or null if not loaded or not requested).
- `canSelectConnection`: Helper to check if the user has SELECT permission for a given app.
- `profileLoading`: Boolean, true while profile/permissions are loading.
- `profileError`: Any error encountered during profile/permissions loading.
- `loginLoading`: Boolean, true while a login/logout is in progress.
- `loginError`: Any error encountered during login/logout.
- `isAuthenticated`: Boolean, true if a user profile is loaded.
- `auth`: An object with authentication methods:
  - `login(username, password)`
  - `logout()`
  - `getSignInMethods()`
  - `getAuthorizeUrl(providerId)`
  - `exchangeToken(token)`
- `roleService`: VystaRoleService instance for role management.
- `permissionService`: VystaPermissionService instance for permission management.

> **Note:** Direct use of internal hooks is not supported in the public API. Always use the context-based approach for authentication and user state.

## FilterPanel Component

The FilterPanel component provides a powerful and flexible filtering interface for your data.

### Basic Usage

```tsx
import { FilterPanel } from '@datavysta/vysta-react';
import DataType from '@datavysta/vysta-react/components/Models/DataType';
import { FilterDefinitionsByField } from '@datavysta/vysta-react/components/Filter/FilterDefinitionsByField';

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

function App() {
    const [conditions, setConditions] = useState<Condition[]>([]);

    return (
        <FilterPanel 
            conditions={conditions}
            onApply={setConditions}
            filterDefinitions={filterDefinitions}
        />
    );
}
```

### FilterPanel Props

| Prop | Type | Description |
|------|------|-------------|
| `filterDefinitions` | `FilterDefinitionsByField` | Array of field definitions with types and labels |
| `conditions` | `Condition[]` | Current filter conditions |
| `onApply` | `(conditions: Condition[]) => void` | Callback when filters are applied |
| `onChange` | `(conditions: Condition[]) => void` | Callback when conditions change |

### Filter Types

The FilterPanel supports these data types from `DataType`:
- `String`: Text fields with operations like contains, equals, starts with
- `Numeric`: Numeric fields with operations like equals, greater than, less than
- `Boolean`: True/false fields
- `Date`: Date fields with operations like equals, before, after

### Filter Definition Format

Each filter definition should include:
- `targetFieldName`: The field name to filter on
- `label`: Display label for the field
- `dataType`: One of the DataType enum values

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

## LazyLoadList Component

The LazyLoadList component provides a searchable, lazy-loading dropdown list that efficiently loads data from a Vysta service.

### Basic Usage

```tsx
import { LazyLoadList } from '@datavysta/vysta-react';

function ProductSelector() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const productService = useMemo(() => new ProductService(client), [client]);

    return (
        <LazyLoadList<Product>
            repository={productService}
            value={selectedId}
            onChange={setSelectedId}
            label="Select Product"
            displayColumn="productName"
            clearable
        />
    );
}
```

### LazyLoadList Props

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
| `disableInitialValueLoad` | `boolean` | Disable initial value query when display matches key (default: false) |

### Features

- 🔄 Lazy loading with infinite scroll
- 🔍 Built-in search functionality
- 📑 Optional grouping of items
- 🎯 Efficient loading of selected values
- 🎨 Customizable styles
- 💪 Full TypeScript support

### Example with Filtering

```tsx
function OrderSelector() {
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(null);
    
    return (
        <LazyLoadList<Order>
            repository={orderService}
            value={selectedOrderId}
            onChange={setSelectedOrderId}
            label="Select Order"
            displayColumn="orderId"
            clearable={true}
            filters={customerId ? { customerId: { eq: customerId } } : undefined}
        />
    );
}
```

## FileUpload Component

A file upload component that integrates with Vysta's file service and uses Uppy for the upload interface.

```typescript
import { FileUpload } from '@datavysta/vysta-react';

function MyComponent() {
    return (
        <FileUpload
            fileService={fileService}
            allowedFileTypes={['.jpg', '.png', 'image/*']}
            filename="custom-name.jpg"
            autoProceed={true}
            onUploadSuccess={(fileId, fileName) => {
                console.log(`File uploaded: ${fileName} with ID: ${fileId}`);
            }}
        />
    );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fileService` | `VystaFileService` | Required | The Vysta file service instance to handle uploads |
| `onUploadSuccess` | `(fileId: string, fileName: string) => void` | - | Callback when file upload completes successfully |
| `filename` | `string` | - | Optional custom filename to use instead of the uploaded file's name |
| `allowedFileTypes` | `string[]` | - | Optional array of allowed file types (e.g., ['.jpg', 'image/*']) |
| `autoProceed` | `boolean` | `false` | Whether to start upload automatically when files are selected |

The component provides:
- Drag and drop interface
- File type restrictions
- Upload progress bar
- Automatic or manual upload triggering
- Integration with Vysta's file service

## License

MIT 
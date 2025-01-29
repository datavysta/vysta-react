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
| `supportRegularDownload` | `boolean` | `false` | Show download button |
| `supportInsert` | `boolean` | `false` | Show "New" button |
| `supportDelete` | `boolean` | `false` | Show delete button in each row |
| `deleteButton` | `(onDelete: () => void) => React.ReactNode` | `undefined` | Custom delete button renderer |
| `filters` | `{ [K in keyof T]?: any }` | `undefined` | Vysta filters to apply. Should be memoized to prevent unnecessary reloads |
| `inputProperties` | `{ [key: string]: any }` | `undefined` | Additional properties to pass to data source. Should be memoized to prevent unnecessary reloads |
| `toolbarItems` | `React.ReactNode` | `undefined` | Custom toolbar items |
| `onDataFirstLoaded` | `(gridApi: GridApi<T>) => void` | `undefined` | Callback when data first loads or when filters/inputProperties change |
| `onDataLoaded` | `(gridApi: GridApi<T>, data: T[]) => void` | `undefined` | Callback when any data loads, including incremental loads |
| `getRowClass` | `(params: RowClassParams<T>) => string \| string[] \| undefined` | `undefined` | Custom row CSS classes |
| `onRowClicked` | `(event: RowClickedEvent<T>) => void` | `undefined` | Row click handler |
| `tick` | `number` | `0` | Trigger grid refresh when incremented |
| `theme` | `Theme \| 'legacy'` | `undefined` | AG Grid theme configuration |
| `styles` | `DataGridStyles` | `{}` | Custom styles for grid elements |

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

## License

MIT 
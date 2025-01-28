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

## License

MIT 
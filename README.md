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
```

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
| `filters` | `{ [K in keyof T]?: any }` | `{}` | Vysta filters to apply |
| `toolbarItems` | `React.ReactNode` | `undefined` | Custom toolbar items |
| `onDataFirstLoaded` | `(gridApi: GridApi<T>) => void` | `undefined` | Callback when data first loads |
| `getRowClass` | `(params: RowClassParams<T>) => string \| string[] \| undefined` | `undefined` | Custom row CSS classes |
| `onRowClicked` | `(event: RowClickedEvent<T>) => void` | `undefined` | Row click handler |
| `tick` | `number` | `0` | Trigger grid refresh when incremented |
| `theme` | `Theme \| 'legacy'` | `undefined` | AG Grid theme configuration |

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
<DataGrid<Product>
  // ... other props ...
  filters={{
    unitPrice: { gt: 20 },
    discontinued: { eq: 0 }
  }}
/>
```

## License

MIT 
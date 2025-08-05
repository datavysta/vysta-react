import { useState, useCallback } from 'react';
import FilterRightHandSideLoader from '../../../src/components/Filter/components/FilterRightHandSideLoader';
import ExpressionCondition from '../../../src/components/Models/ExpressionCondition';
import ComparisonOperator from '../../../src/components/Models/ComparisonOperator';
import { FilterDefinition } from '../../../src/components/Filter/FilterDefinitionsByField';
import { useServices } from './ServicesProvider';
import type { Product } from '../types/Product';

export default function FilterRightHandSideLoaderExample() {
  const { productService } = useServices();

  const filterDefinition: FilterDefinition<Product, Product> = {
    targetFieldName: 'productId',
    label: 'Product',
    repository: productService,
    loaderColumns: ['productId', 'productName'],
  };

  const [condition, setCondition] = useState(() => {
    const c = new ExpressionCondition();
    c.comparisonOperator = ComparisonOperator.Equal;
    c.columnName = 'productId';
    c.values = [];
    return c;
  });

  const handleChange = useCallback((updated: ExpressionCondition) => {
    setCondition(updated);
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>FilterRightHandSideLoader Example</h2>
      <FilterRightHandSideLoader
        filterDefinition={filterDefinition}
        expressionCondition={condition}
        onChange={handleChange}
      />
      <div style={{ marginTop: 24 }}>
        <strong>Selected value:</strong>
        <pre>{JSON.stringify(condition.values, null, 2)}</pre>
      </div>
    </div>
  );
} 
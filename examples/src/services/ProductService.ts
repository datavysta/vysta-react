import { VystaClient, VystaService } from '@datavysta/vysta-client';
import { Product } from '../types/Product';

export class ProductService extends VystaService<Product> {
    constructor(client: VystaClient) {
        super(client, 'Northwinds', 'Products', {
            primaryKey: 'productId'
        });
    }
} 
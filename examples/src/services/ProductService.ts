import { VystaClient, VystaReadonlyService } from '@datavysta/vysta-client';
import { Product } from '../types/Product';

export class ProductService extends VystaReadonlyService<Product> {
    constructor(client: VystaClient) {
        super(client, 'Northwinds', 'Products');
    }
} 
import { VystaService, VystaClient } from '@datavysta/vysta-client';
import { Supplier } from '../types/Supplier';

export class SupplierService extends VystaService<Supplier> {
    constructor(client: VystaClient) {
        super(client, 'Northwinds', 'Suppliers', {
            primaryKey: 'supplierId'
        });
    }
} 
import { VystaClient, VystaService } from '@datavysta/vysta-client';
import { Customer, CustomerWithFullName } from '../types/Customer';

export class CustomerService extends VystaService<Customer, CustomerWithFullName> {
    constructor(client: VystaClient) {
        super(client, 'Northwinds', 'Customers', {
            primaryKey: 'customerId'
        });
    }

    protected override hydrate(customer: Customer): CustomerWithFullName {
        return {
            ...customer,
            _contact: `${customer.contactName} (${customer.contactTitle})`
        };
    }
} 
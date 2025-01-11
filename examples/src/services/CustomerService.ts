import { VystaClient, VystaReadonlyService } from '@datavysta/vysta-client';
import { Customer, CustomerWithFullName } from '../types/Customer';

export class CustomerService extends VystaReadonlyService<Customer, CustomerWithFullName> {
    constructor(client: VystaClient) {
        super(client, 'Northwinds', 'Customers');
    }

    protected override hydrate(customer: Customer): CustomerWithFullName {
        return {
            ...customer,
            _contact: `${customer.contactName} (${customer.contactTitle})`
        };
    }
} 
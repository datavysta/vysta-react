import { VystaClient, VystaService } from '@datavysta/vysta-client';
import { Order, OrderWithTotal } from '../types/Order';

export class OrderService extends VystaService<Order, OrderWithTotal> {
    constructor(client: VystaClient) {
        super(client, 'Northwinds', 'Orders', {
            primaryKey: 'orderId'
        });
    }

    hydrate(order: Order): OrderWithTotal {
        return {
            ...order,
            _total: order.freight + (order.details?.reduce((sum, detail) => 
                sum + (detail.unitPrice * detail.quantity * (1 - detail.discount)), 0) || 0)
        };
    }
} 
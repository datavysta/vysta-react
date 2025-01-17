interface OrderDetail {
    unitPrice: number;
    quantity: number;
    discount: number;
}

export interface Order {
    orderId: number; // [ Currency ], default: 0
    orderDate: string;
    shipName: string;
    shipCountry: string;
    freight: number;
    details?: OrderDetail[];
}

export interface OrderWithTotal extends Order {
    _total: number;
} 
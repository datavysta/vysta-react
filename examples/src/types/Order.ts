interface OrderDetail {
    unitPrice: number;
    quantity: number;
    discount: number;
}

export interface Order {
    orderId: number;
    orderDate: string;
    shipName: string;
    shipCountry: string;
    freight: number;
    details?: OrderDetail[];
}

export interface OrderWithTotal extends Order {
    _total: number;
} 
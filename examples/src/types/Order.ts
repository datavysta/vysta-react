interface OrderDetail {
    unitPrice: number;
    quantity: number;
    discount: number;
}

export interface Order {
    orderId: string;
    customerId: string;
    employeeId: string;
    orderDate: string;
    requiredDate: string;
    shippedDate: string;
    shipVia: string;
    freight: number;
    shipName: string;
    shipAddress: string;
    shipCity: string;
    shipRegion: string;
    shipPostalCode: string;
    shipCountry: string;
    details?: OrderDetail[];
}

export interface OrderWithTotal extends Order {
    _total: number;
} 
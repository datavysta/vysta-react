export interface Customer {
    customerId: number;
    companyName: string;
    contactName: string;
    contactTitle: string;
}

export interface CustomerWithFullName extends Customer {
    _contact: string;
} 
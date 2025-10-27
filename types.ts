export enum ProductStatus {
    Active = 'Active',
    Discontinued = 'Discontinued',
    LowStock = 'Low Stock'
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    status: ProductStatus;
    imageUrl: string;
    lastUpdated: string;
    dateAdded: string;
    isFeatured: boolean;
    contactEmail: string;
    productUrl: string;
}

export interface SortConfig {
    key: keyof Product;
    direction: 'ascending' | 'descending';
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

export enum AuditLogAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export interface AuditLog {
    id: string;
    timestamp: string;
    action: AuditLogAction;
    productId: string;
    productName: string;
    details: string;
}
export type UserRole = 'admin' | 'pharmacist' | 'cashier';

export interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string;
  stock: number;
  unitPrice: number;
  costPrice: number;
  expiryDate: string;
  status: 'active' | 'low-stock' | 'expired';
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  soldAt: string;
  cashier: string;
  prescriptionRequired: boolean;
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  medicationName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'dispensed';
  issuedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Optional password field for seeded/development users or stored credentials.
  // Keep it optional so the public `User` shape can omit credentials where not needed.
  password?: string;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStockProducts: number;
  salesToday: number;
  revenueToday: number;
  pendingPrescriptions: number;
}

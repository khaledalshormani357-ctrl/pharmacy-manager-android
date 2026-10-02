export type Product = {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  stock: number;
  unitPrice: number;
  costPrice?: number;
  status?: 'active' | 'low-stock' | 'expired';
};

export type Sale = {
  id: string;
  productName: string;
  quantity: number;
  total: number;
  cashier: string;
  soldAt: string;
};

export type Prescription = {
  id: string;
  patientName: string;
  medicationName: string;
  status: 'pending' | 'approved' | 'dispensed';
};

export type DashboardSummary = {
  totalProducts: number;
  lowStockProducts: number;
  salesToday: number;
  revenueToday: number;
  pendingPrescriptions: number;
};

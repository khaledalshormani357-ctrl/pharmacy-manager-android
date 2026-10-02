export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  unitPrice: number;
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

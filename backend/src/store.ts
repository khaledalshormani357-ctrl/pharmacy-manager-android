import { v4 as uuidv4 } from 'uuid';
import type { DashboardSummary, Prescription, Product, Sale, User } from './types.js';

const today = new Date().toISOString();

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Paracetamol 500 mg',
    category: 'Analgesic',
    barcode: '890123456001',
    stock: 45,
    unitPrice: 5.5,
    costPrice: 2.8,
    expiryDate: '2028-04-10',
    status: 'active',
    createdAt: today,
  },
  {
    id: 'prod-2',
    name: 'Amoxicillin 250mg',
    category: 'Antibiotic',
    barcode: '890123456002',
    stock: 8,
    unitPrice: 18.0,
    costPrice: 10.5,
    expiryDate: '2027-11-22',
    status: 'low-stock',
    createdAt: today,
  },
  {
    id: 'prod-3',
    name: 'Vitamin C Gummies',
    category: 'Supplement',
    barcode: '890123456003',
    stock: 120,
    unitPrice: 12.5,
    costPrice: 7.4,
    expiryDate: '2029-01-18',
    status: 'active',
    createdAt: today,
  },
  {
    id: 'prod-4',
    name: 'Insulin Pen',
    category: 'Diabetes',
    barcode: '890123456004',
    stock: 5,
    unitPrice: 32.0,
    costPrice: 19.8,
    expiryDate: '2026-08-25',
    status: 'low-stock',
    createdAt: today,
  },
];

export const sales: Sale[] = [
  {
    id: 'sale-1',
    productId: 'prod-1',
    productName: 'Paracetamol 500 mg',
    quantity: 2,
    total: 11,
    soldAt: new Date().toISOString(),
    cashier: 'Ali',
    prescriptionRequired: false,
  },
  {
    id: 'sale-2',
    productId: 'prod-3',
    productName: 'Vitamin C Gummies',
    quantity: 1,
    total: 12.5,
    soldAt: new Date(Date.now() - 3600000).toISOString(),
    cashier: 'Sara',
    prescriptionRequired: false,
  },
];

export const prescriptions: Prescription[] = [
  {
    id: 'rx-1',
    patientName: 'Omar Khalid',
    doctorName: 'Dr. Saleh',
    medicationName: 'Amoxicillin 250mg',
    quantity: 20,
    status: 'pending',
    issuedAt: new Date().toISOString(),
  },
  {
    id: 'rx-2',
    patientName: 'Nader Hassan',
    doctorName: 'Dr. Noor',
    medicationName: 'Insulin Pen',
    quantity: 1,
    status: 'approved',
    issuedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const users: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@pharmacy.test', role: 'admin', password: 'admin123' },
  { id: 'user-2', name: 'Pharmacist 1', email: 'pharmacist@pharmacy.test', role: 'pharmacist', password: 'pharm123' },
  { id: 'user-3', name: 'Cashier 1', email: 'cashier@pharmacy.test', role: 'cashier', password: 'cash123' },
];

export function getDashboardSummary(): DashboardSummary {
  const lowStockProducts = products.filter((product) => product.stock < 10).length;
  const revenueToday = sales.reduce((sum, sale) => sum + sale.total, 0);

  return {
    totalProducts: products.length,
    lowStockProducts,
    salesToday: sales.length,
    revenueToday,
    pendingPrescriptions: prescriptions.filter((item) => item.status === 'pending').length,
  };
}

export function addSale(productId: string, quantity: number, cashier: string, prescriptionRequired: boolean) {
  const item = products.find((product) => product.id === productId);

  if (!item) {
    throw new Error('Product not found');
  }

  if (item.stock < quantity) {
    throw new Error('Not enough stock');
  }

  const total = item.unitPrice * quantity;

  const sale: Sale = {
    id: uuidv4(),
    productId: item.id,
    productName: item.name,
    quantity,
    total,
    soldAt: new Date().toISOString(),
    cashier,
    prescriptionRequired,
  };

  sales.unshift(sale);
  item.stock = item.stock - quantity;
  item.status = item.stock < 10 ? 'low-stock' : 'active';

  return sale;
}

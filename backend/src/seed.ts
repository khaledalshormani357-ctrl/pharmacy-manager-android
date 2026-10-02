import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from './db.js';

export async function seed() {
  const usersCount = await prisma.user.count();
  if (usersCount > 0) return;

  const adminPassword = await bcrypt.hash('admin123', 10);
  const pharmPassword = await bcrypt.hash('pharm123', 10);
  const cashPassword = await bcrypt.hash('cash123', 10);

  const users: Prisma.UserCreateInput[] = [
    { name: 'Admin User', email: 'admin@pharmacy.test', password: adminPassword, role: 'admin' },
    { name: 'Pharmacist 1', email: 'pharmacist@pharmacy.test', password: pharmPassword, role: 'pharmacist' },
    { name: 'Cashier 1', email: 'cashier@pharmacy.test', password: cashPassword, role: 'cashier' },
  ];

  await prisma.user.createMany({
    data: users,
  });

  await prisma.product.createMany({
    data: [
      { name: 'Paracetamol 500 mg', category: 'Analgesic', barcode: '890123456001', stock: 45, unitPrice: 5.5, costPrice: 2.8, expiryDate: new Date('2028-04-10'), status: 'active' },
      { name: 'Amoxicillin 250mg', category: 'Antibiotic', barcode: '890123456002', stock: 8, unitPrice: 18.0, costPrice: 10.5, expiryDate: new Date('2027-11-22'), status: 'low-stock' },
      { name: 'Vitamin C Gummies', category: 'Supplement', barcode: '890123456003', stock: 120, unitPrice: 12.5, costPrice: 7.4, expiryDate: new Date('2029-01-18'), status: 'active' },
      { name: 'Insulin Pen', category: 'Diabetes', barcode: '890123456004', stock: 5, unitPrice: 32.0, costPrice: 19.8, expiryDate: new Date('2026-08-25'), status: 'low-stock' },
    ],
  });

  console.log('Seeded initial users and products');
}

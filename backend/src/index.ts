import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { signToken, authenticateToken } from './auth.js';
import { prisma } from './db.js';
import { seed } from './seed.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

seed().catch((e) => console.error('Seeding failed', e));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'pharmacy-manager-backend' });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ id: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/dashboard', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
  const alerts = await prisma.product.findMany({ where: { stock: { lt: 10 } }, take: 10 });
  const recentSales = await prisma.sale.findMany({ orderBy: { soldAt: 'desc' }, take: 20 });
  const prescriptions = await prisma.prescription.findMany({ take: 20, orderBy: { issuedAt: 'desc' } });

  const totalProducts = await prisma.product.count();
  const lowStockProducts = await prisma.product.count({ where: { stock: { lt: 10 } } });
  const salesToday = await prisma.sale.count();
  const revenueAgg = await prisma.sale.aggregate({ _sum: { total: true } });
  const revenueToday = revenueAgg._sum.total || 0;

  res.json({
    summary: {
      totalProducts,
      lowStockProducts,
      salesToday,
      revenueToday,
      pendingPrescriptions: prescriptions.filter((p) => p.status === 'pending').length,
    },
    products,
    alerts,
    recentSales,
    prescriptions,
  });
});

app.get('/api/products', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
});

app.post('/api/products', authenticateToken, async (req: Request, res: Response) => {
  const { name, category, barcode, stock, unitPrice, costPrice, expiryDate } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'name and category are required' });
  }

  const parsedStock = Number(stock ?? 0);
  const parsedUnitPrice = Number(unitPrice ?? 0);
  const parsedCostPrice = Number(costPrice ?? 0);

  const product = await prisma.product.create({
    data: {
      name,
      category,
      barcode: barcode ?? null,
      stock: parsedStock,
      unitPrice: parsedUnitPrice,
      costPrice: parsedCostPrice,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: parsedStock < 10 ? 'low-stock' : 'active',
    },
  });

  return res.status(201).json(product);
});

app.put('/api/products/:id', authenticateToken, async (req: Request, res: Response) => {
  const { name, category, barcode, stock, unitPrice, costPrice, expiryDate } = req.body;
  const productId = req.params.id;

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const parsedStock = Number(stock ?? existing.stock);
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: name ?? existing.name,
      category: category ?? existing.category,
      barcode: barcode ?? existing.barcode,
      stock: parsedStock,
      unitPrice: Number(unitPrice ?? existing.unitPrice),
      costPrice: Number(costPrice ?? existing.costPrice),
      expiryDate: expiryDate ? new Date(expiryDate) : existing.expiryDate,
      status: parsedStock < 10 ? 'low-stock' : 'active',
    },
  });

  return res.json(product);
});

app.delete('/api/products/:id', authenticateToken, async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await prisma.product.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Product deleted successfully' });
});

app.post('/api/sales', authenticateToken, async (req: Request, res: Response) => {
  const { productId, quantity, cashier, prescriptionRequired } = req.body;
  if (!productId || !quantity || !cashier) {
    return res.status(400).json({ message: 'productId, quantity, and cashier are required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');
      if (product.stock < Number(quantity)) throw new Error('Not enough stock');

      const total = Number(product.unitPrice) * Number(quantity);
      const sale = await tx.sale.create({
        data: {
          productId,
          quantity: Number(quantity),
          total,
          cashier,
          prescriptionRequired: Boolean(prescriptionRequired),
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          stock: product.stock - Number(quantity),
          status: product.stock - Number(quantity) < 10 ? 'low-stock' : 'active',
        },
      });

      return sale;
    });

    return res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create sale';
    return res.status(400).json({ message });
  }
});

app.get('/api/sales', async (_req: Request, res: Response) => {
  const sales = await prisma.sale.findMany({ orderBy: { soldAt: 'desc' } });
  res.json(sales);
});

app.get('/api/alerts', async (_req: Request, res: Response) => {
  const alerts = await prisma.product.findMany({ where: { stock: { lt: 10 } } });
  res.json(alerts);
});

app.get('/api/prescriptions', async (_req: Request, res: Response) => {
  const prescriptions = await prisma.prescription.findMany({ orderBy: { issuedAt: 'desc' } });
  res.json(prescriptions);
});

app.patch('/api/prescriptions/:id/status', authenticateToken, async (req: Request, res: Response) => {
  const { status } = req.body;
  const valid = ['pending', 'approved', 'dispensed'];

  if (!status || !valid.includes(status)) {
    return res.status(400).json({ message: 'Valid status is required: pending, approved, dispensed' });
  }

  const existing = await prisma.prescription.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  const prescription = await prisma.prescription.update({
    where: { id: req.params.id },
    data: { status },
  });

  return res.json(prescription);
});

app.get('/api/users', authenticateToken, async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

app.get('/api/reports/summary', authenticateToken, async (_req: Request, res: Response) => {
  const [totalProducts, lowStockProducts, salesToday, revenueAgg, pendingPrescriptions] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lt: 10 } } }),
    prisma.sale.count(),
    prisma.sale.aggregate({ _sum: { total: true } }),
    prisma.prescription.count({ where: { status: 'pending' } }),
  ]);

  res.json({
    summary: {
      totalProducts,
      lowStockProducts,
      salesToday,
      revenueToday: revenueAgg._sum.total || 0,
      pendingPrescriptions,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Pharmacy Manager Backend running on http://localhost:${PORT}`);
});
